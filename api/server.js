/* eslint no-console: 0 */
const url = require('url');
const http = require('http');
const path = require('path');
const querystring = require('querystring');
const async = require('async');
const express = require('express');
const exec = require('child_process').exec;
const jsonServer = require('json-server');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const uuid = require('uuid/v4');
const rimraf = require('rimraf');
const simpleGit = require('simple-git');
const CronJob = require('cron').CronJob;
const get = require('lodash/fp/get');
const set = require('lodash/fp/set');
const fs = require('fs-extra');
const io = require('socket.io');

const utils = require('./utils.js');
const dump = require('./dump.js');
const middlewares = require('./middlewares.js');
const GatsbyProcess = require('./gatsby.js');

const {
  retrieveGithubFluxData,
  retrieveTwitterFluxData
} = require('./flux.js');

const MODELS = require('../specs/models.json');
const spire = require('./spire.js');
const oldSlugRedirections = require('./oldSlugRedirections.js');

const config = require('config-secrets');

// Constants
const ARGV = require('yargs')
  .option('--gatsby', {type: 'boolean', default: true})
  .option('--bypass-auth', {type: 'boolean', default: false})
  .argv;

const PORT = config.get('port');
const DATA_PATH = config.get('data');
const BUILD_CONF = config.get('build');
const DUMP_PATH = path.join(BUILD_CONF.path, 'dump');
const SITE_PATH = path.join(BUILD_CONF.path, 'site');
const ASSETS_PATH = path.join(DATA_PATH, 'assets');

// Ensuring we have the minimal file architecture
fs.ensureDirSync(DATA_PATH);
fs.ensureDirSync(path.join(DATA_PATH, 'assets'));
fs.ensureDirSync(BUILD_CONF.path);

if (!fs.pathExistsSync(SITE_PATH))
  fs.copySync(path.join(__dirname, '..', 'site'), SITE_PATH);

rimraf.sync(path.join(SITE_PATH, '.cache'));
rimraf.sync(path.join(SITE_PATH, 'public'));

const settingsPath = path.join(DATA_PATH, 'settings.json');

if (!fs.existsSync(settingsPath))
  fs.writeFileSync(
    settingsPath,
    JSON.stringify({
      settings: {
        home: {
          grid: [],
          slider: [],
          topActivities: []
        }
      }
    }, null, 2)
  );

MODELS.forEach(model => {
  const p = path.join(DATA_PATH, `${model}.json`);

  if (!fs.existsSync(p))
    fs.writeFileSync(
      p,
      JSON.stringify({[model]: []}, null, 2)
    );
});

// Creating routers
const ROUTERS = MODELS.concat('settings').map(model => {
  return {
    model,
    router: jsonServer.router(path.join(DATA_PATH, `${model}.json`))
  };
});

// pass ADMIN_URL conf to gatsby process for dev env)
if (!process.env.ADMIN_URL)
  process.env.ADMIN_URL = config.adminUrl;

const gatsby = new GatsbyProcess(path.join(__dirname, '..', 'site'));

process.on('exit', () => gatsby.started && gatsby.kill());

// json-server init
const app = jsonServer.create();
const jsonServerMiddlewares = jsonServer.defaults();

app.use(jsonServerMiddlewares);
app.use(jsonServer.bodyParser);

app.use(session({
  cookie: {
    httpOnly: false
  },
  resave: false,
  secret: 'medialab',
  saveUninitialized: false
}));

const SUPERUSER = config.get('superuser');

// Login route
app.post('/login', function(req, res) {
  const {username, password} = req.body;

  if (
    username === SUPERUSER.username &&
    password === SUPERUSER.password
  ) {
    req.session.authenticated = true;
    return res.status(200).send('OK');
  }

  return res.status(401).send('Unauthorized');
});

app.get('/is-logged', function(req, res) {
  return res.json(!!(req.session && req.session.authenticated));
});

if (!ARGV.bypassAuth)
  app.use(middlewares.authentication);

app.use(fileUpload());
app.use('/assets', express.static(ASSETS_PATH));

ROUTERS.forEach(({model, router}) => {

  // Adding fields projection
  router.render = (req, res) => {
    const parsed = url.parse(req.url);
    let data = res.locals.data;

    const query = querystring.parse(parsed.query);

    if (query._fields) {
      const fields = query._fields.split(',');

      data = data.map(item => {
        if (fields.length === 1)
          return get(fields[0], item);

        let result = {};

        fields.forEach(field => {
          result = set(field, get(field, item), result);
        });

        return result;
      }).filter(x => x);
    }

    if (query._suggest) {
      const field = query._suggest;

      const values = new Set();

      // TODO: we can do better...
      if (field === 'contacts.label' || field === 'attachments.label') {
        const target = field.split('.')[0];

        data.forEach(item => {
          if (!item[target])
            return;

          item[target].forEach(contact => values.add(contact.label));
        });
      }
      else {
        data.forEach(item => {
          const value = get(field, item);
          [].concat(value).forEach(v => values.add(v));
        });
      }

      data = Array.from(values).filter(x => x);
    }

    return res.json(data);
  };

  app.use(`/${model}`, middlewares.lastUpdated, router);
});

// Upload route
app.post('/upload', (req, res) => {
  const file = req.files.file;

  if (!file)
    return res.status(400).send('No file.');

  const ext = path.extname(file.name),
        filename = utils.cleanAssetName(path.basename(file.name, ext));

  const name = `${filename}_${uuid()}${ext}`;

  file.mv(path.join(ASSETS_PATH, name), err => {
    if (err)
      return res.status(500).send(err);

    return res.status(200).json({name, originalName: file.name});
  });
});

// Reboot gatsby route
app.get('/reboot-gatsby', (req, res) => {
  gatsby.restart(() => res.status(200).send('Ok'));
});

// Migration routes
const MIGRATION_SCHEMES = {
  'clean-unused-assets': require('./migrations/clean-unused-assets.js')(ASSETS_PATH),
  'drop-important': require('./migrations/drop-important.js'),
  'drop-unpublished-spire-notices': require('./migrations/drop-unpublished-spire-notices.js'),
  'fix-asset-names': require('./migrations/fix-asset-names.js'),
  // 'fix-dates': require('./migrations/fix-dates.js'),
  // 'fix-minutes': require('./migrations/fix-minutes.js'),
  // 'fix-missing-processed': require('./migrations/fix-missing-processed.js'),
  'prod-cleanup': require('./migrations/prod-cleanup.js'),
  'reset-settings': require('./migrations/reset-settings.js'),
  'reslugify': require('./migrations/reslugify.js'),
  'refresh-generatedFields-productions': require('./migrations/refresh-generatedFields-productions.js')
};

app.get('/migrate/:scheme', (req, res) => {
  const scheme = req.params.scheme;
  const fn = MIGRATION_SCHEMES[scheme];

  if (typeof fn !== 'function')
    return res.status(404).send('Bad Scheme!');

  const dbs = {};

  ROUTERS.forEach(({model, router}) => (dbs[model] = router.db));

  return fn(req, dbs, (err, result) => {
    if (err)
      return res.status(500).send('' + err);

    if (!result)
      return res.send('Success!');

    return res.json(result);
  });
});

// Creating server
const server = http.Server(app);

// Serving websockets
const ws = io(server, {path: '/sockets'});

const LOCKS = {
  buildStatus: 'free',
  deployStatus: 'free',
  spireStatus: 'free'
};

const changeBuildStatus = (newStatus) => {
  LOCKS.buildStatus = newStatus;
  ws.emit('buildStatusChanged', newStatus);
};

const changeDeployStatus = (newStatus) => {
  LOCKS.deployStatus = newStatus;
  ws.emit('deployStatusChanged', newStatus);
};

const changeSpireStatus = (newStatus) => {
  LOCKS.spireStatus = newStatus;
  ws.emit('spireStatusChanged', newStatus);
};

ws.on('connection', socket => {

  // When retrieving deploy status
  socket.on('getDeployStatus', (data, callback) => {
    callback(null, {status: LOCKS.deployStatus});
  });

  // When triggering deploy
  socket.on('deploy', () => {

    // Git handle
    let git;

    // NOTE: we could do some things in parallel to gain some time

    async.series({

      // 1) Cleanup
      cleanup(next) {
        changeDeployStatus('cleaning');

        rimraf(DUMP_PATH, next);
      },

      // 2) Pulling
      pull(next) {
        changeDeployStatus('pulling');

        fs.ensureDirSync(DUMP_PATH);

        git = simpleGit(DUMP_PATH);

        git
          .cwd(DUMP_PATH)
          .init()
          .addRemote('origin', BUILD_CONF.repository)
          .pull('origin', 'master', next);
      },

      // 3) Wiping files
      wiping(next) {
        const toDelete = MODELS.map(m => path.join(DUMP_PATH, m, '*.json'));

        toDelete.push(path.join(DUMP_PATH, 'assets', '*'));
        toDelete.push(path.join(DUMP_PATH, 'settings.json'));

        async.each(toDelete, rimraf, next);
      },

      // 4) Dumping the files
      dump(next) {

        changeDeployStatus('dumping');
        dump(DUMP_PATH);

        process.nextTick(next);
      },

      // 5) Committing the dump
      commit(next) {
        changeDeployStatus('committing');

        git
          .cwd(DUMP_PATH)
          .add('./*')
          .commit('New dump')
          .push('origin', 'master', next);
      }
    }, err => {
      if (err)
        console.error(err);

      setTimeout(() => changeDeployStatus('free'), 1000);
    });
  });

  // When retrieving spire status
  socket.on('getSpireStatus', (data, callback) => {
    callback(null, {status: LOCKS.spireStatus});
  });

  // When triggering spire
  socket.on('aspire', () => {

    spire.aSPIRE((err) => {
      if (err)
        console.error(err);
      changeSpireStatus('free');
    }, changeSpireStatus);
  });
});

// Flux logic
const PEOPLE_DB = ROUTERS.find(({model}) => model === 'people').router.db;

function retrieveFluxData(callback) {

  // Retrieving people data
  PEOPLE_DB.read();

  const people = PEOPLE_DB.getState().people;

  return async.parallel({
    github: next => {
      return retrieveGithubFluxData(people, (err, data) => {
        if (err)
          return next(err);

        fs.writeJson(path.join(DATA_PATH, 'github.json'), data, {spaces: 2}, next);
      });
    },
    twitter: next => {
      return retrieveTwitterFluxData((err, data) => {
        if (err)
          return next(err);

        fs.writeJson(path.join(DATA_PATH, 'twitter.json'), data, {spaces: 2}, next);
      });
    }
  }, callback);
}

// Build logic
function buildStaticSite(callback) {
  console.log('Building site...');

  changeBuildStatus('cleaning');

  return async.series({

    // 1) Cleanup
    droppingLastBuild(next) {
      return async.parallel([
        async.apply(rimraf, path.join(SITE_PATH, 'public')),
        async.apply(rimraf, path.join(SITE_PATH, '.cache'))
      ], next);
    },

    // 2) Refreshing flux data
    flux(next) {
      changeBuildStatus('flux');

      return retrieveFluxData(next);
    },

    // 3) Building static site
    building(next) {
      changeBuildStatus('building');

      const env = Object.assign({}, process.env);
      env.BUILD_CONTEXT = 'prod';
      env.ROOT_PATH = path.resolve(__dirname, '..');
      env.GOOGLE_ANALYTICS_ID = config.get('googleAnalyticsId');
      env.NODE_ENV = 'production';

      return exec('gatsby build', {cwd: SITE_PATH, env}, next);
    },

    // 4) Deploying using rsync
    rsync(next) {
      changeBuildStatus('rsync');

      const rsyncConfig = config.get('rsync');

      if (!rsyncConfig.target || !rsyncConfig.password) {
        console.log('Skipping rsync...');
        return next();
      }

      const built = path.join(SITE_PATH, 'public', '/');

      const command = [
        `RSYNC_PASSWORD=${rsyncConfig.password}`,
        `rsync -az --del ${built} ${rsyncConfig.target}`
      ].join(' ');

      return exec(command, next);
    }
  }, callback);
}

// Building every 15 minutes
function buildTask() {

  // We can't run several build at once!
  if (LOCKS.buildStatus !== 'free')
    return false;

  buildStaticSite(err => {
    changeBuildStatus('free');

    if (err)
      console.error(err);
    else
      console.log('Done building site.');
  });

  return true;
}

const cron = new CronJob('*/15 * * * *', buildTask);

cron.start();

app.get('/build', (req, res) => {
  const willBuild = buildTask();

  const payload = !willBuild ?
    {result: 'Already building.'} :
    {result: 'Ok'};

  return res.json(payload);
});

app.get('/redirects.nginx.conf', (req, res) => {
  oldSlugRedirections((err, redirections) => {
    if (err)
      return res.status(500).send(err);
    else
      return res.type('txt/*').send(redirections);
  })
})

// Listening
console.log(`Listening on port ${PORT}...`);
server.listen(PORT);

// Starting gatsby
const shouldStartGatsby = ARGV.gatsby;

if (shouldStartGatsby)
  gatsby.start();
