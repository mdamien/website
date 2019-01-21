/* eslint no-console: 0 */
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

const {
  addBacklinkToGraphQLSchema,
  graphQLSchemaAdditionForSettings,
  graphQLSchemaAdditionFromJsonSchema,
  patchGraphQLSchema
} = require('./schema.js');

const {
  hashNode,
  createI18nPage
} = require('./utils.js');

const {
  template
} = require('./templating.js');

const ROOT_PATH = process.env.ROOT_PATH || '..';

const QUERIES = require('./queries.js');
const MODELS = require(path.join(ROOT_PATH, 'specs', 'models.json'));
const DB_PATH = path.join(ROOT_PATH, 'data');
const DB_GLOB = path.join(ROOT_PATH, 'data', '*.json');
const ASSETS_PATH = path.join(ROOT_PATH, 'data', 'assets');
const ASSETS_GLOB = path.join(ROOT_PATH, 'data', 'assets', '*');
const PUBLIC_PATH = path.join(process.cwd(), 'public', 'static');

const MODELS_PATHS = {};
const SCHEMAS = {};
const GRAPHQL_SCHEMAS = {};

MODELS.forEach(model => {
  MODELS_PATHS[model] = path.join(DB_PATH, `${model}.json`);
  SCHEMAS[model] = require(path.join(ROOT_PATH, 'specs', 'schemas', `${model}.json`));
  GRAPHQL_SCHEMAS[model] = graphQLSchemaAdditionFromJsonSchema(model, SCHEMAS[model]);
});

MODELS_PATHS.settings = path.join(DB_PATH, 'settings.json');

const DUMMY_HOME_DATA = {
  slider: [
    {
      type: 'news',
      id: 'b635fdd5-ba26-47f1-8995-628cdf33ae18'
    },
    {
      type: 'activities',
      id: '5ec9bfeb-37cc-492d-991b-4ebe7d2ba224'
    },
    {
      type: 'news',
      id: '536fe70e-ffb7-4e3e-85d4-a648097a010b'
    },
    {
      type: 'productions',
      id: 'f6b39e7f-1077-449e-9936-62e9df187b24'
    }
  ],
  grid: [
    {
      type: 'news',
      id: '00195d68-1ad2-4814-baed-16e3b39f17b4'
    },
    {
      type: 'productions',
      id: '217bcd44-4f8d-4afb-9587-7a0a2ca1d7ce'
    },
    {
      type: 'activities',
      id: '5c03c6fc-8793-40ed-bf5d-f2d98a5c780d'
    },
    {
      type: 'activities',
      id: '676f5dd7-27ca-4831-9c5d-7510aa71b88d'
    },
    {
      type: 'people',
      id: 'a85cb8cb-3ece-41e0-adca-5085a331ee40'
    },
    {
      type: 'news',
      id: '43e75abf-2114-4db4-8c6b-86ff0280bb2a'
    }
  ]
};

const MODEL_READERS = {
  activities({actions: {createNode, deleteNode}, getNode, pathPrefix}) {
    const rawData = fs.readFileSync(MODELS_PATHS.activities, 'utf-8');
    const data = JSON.parse(rawData);

    // Activities
    data.activities.forEach(activity => {

      const node = getNode(activity.id);

      if (node)
        deleteNode({node});

      // Processing HTML
      const content = template(pathPrefix, activity.content);

      const hash = hashNode(activity);

      createNode({
        ...activity,
        content,
        identifier: activity.id,
        internal: {
          type: 'ActivitiesJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  people({actions: {createNode, deleteNode}, getNode, pathPrefix}) {
    const rawData = fs.readFileSync(MODELS_PATHS.people, 'utf-8');
    const data = JSON.parse(rawData);

    // People
    data.people.forEach(person => {

      const node = getNode(person.id);

      if (node)
        deleteNode({node});

      // Processing HTML
      const content = template(pathPrefix, person.bio);

      const hash = hashNode(person);

      createNode({
        ...person,
        bio: content,
        identifier: person.id,
        internal: {
          type: 'PeopleJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  productions({actions: {createNode, deleteNode}, getNode, pathPrefix}) {
    const rawData = fs.readFileSync(MODELS_PATHS.productions, 'utf-8');
    const data = JSON.parse(rawData);

    // Productions
    data.productions.forEach(production => {

      const node = getNode(production.id);

      if (node)
        deleteNode({node});

      // Processing HTML
      const content = template(pathPrefix, production.content);

      const hash = hashNode(production);

      createNode({
        ...production,
        content,
        identifier: production.id,
        internal: {
          type: 'ProductionsJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  news({actions: {createNode, deleteNode}, getNode, pathPrefix}) {
    const rawData = fs.readFileSync(MODELS_PATHS.news, 'utf-8');
    const data = JSON.parse(rawData);

    // News
    data.news.forEach(news => {

      const node = getNode(news.id);

      if (node)
        deleteNode({node});

      // Processing HTML
      const content = template(pathPrefix, news.content);

      const hash = hashNode(news);

      createNode({
        ...news,
        content: content,
        identifier: news.id,
        rawActivities: news.activities,
        internal: {
          type: 'NewsJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  settings({actions: {createNode, deleteNode}, getNode}) {
    const rawData = fs.readFileSync(MODELS_PATHS.settings, 'utf-8');
    const data = JSON.parse(rawData);

    const node = getNode('site-settings-node');

    if (node)
      deleteNode({node});

    const hash = hashNode(data.settings);

    createNode({
      ...data.settings,
      id: 'site-settings-node',
      internal: {
        type: 'SettingsJson',
        contentDigest: hash,
        mediaType: 'application/json'
      }
    });
  }
};

exports.sourceNodes = function(args) {

  const copyAsset = asset => {
    fs.copySync(
      asset,
      path.join(PUBLIC_PATH, path.basename(asset)),
      {overwrite: true}
    );
  };

  const deleteAsset = asset => {
    fs.unlinkSync(path.join(PUBLIC_PATH, path.basename(asset)));
  };

  // Handling assets
  chokidar
    .watch(ASSETS_GLOB)
    .on('add', copyAsset)
    .on('unlink', deleteAsset);

  // Handling database
  for (const model in MODEL_READERS)
    MODEL_READERS[model](args);

  chokidar
    .watch(DB_GLOB)
    .on('change', p => {
      const model = path.basename(p, '.json');

      if (!(model in MODEL_READERS))
        return;

      console.log(`Updating ${model}.json`);
      MODEL_READERS[model](args);
    });
};

exports.createPages = function({graphql, actions}) {
  const {createPage} = actions;

  // Creating basic pages
  createI18nPage(createPage, {
    path: '/',
    component: path.resolve('./src/templates/index.js'),
    context: {
      today: (new Date()).toISOString().split('T')[0],
      grid: DUMMY_HOME_DATA.grid,
      slider: DUMMY_HOME_DATA.slider,
      ids: DUMMY_HOME_DATA.grid
        .concat(DUMMY_HOME_DATA.slider)
        .map(({id}) => id)
    }
  });

  createI18nPage(createPage, {
    path: '/activities',
    component: path.resolve('./src/templates/activity-list.js')
  });

  createI18nPage(createPage, {
    path: '/news',
    component: path.resolve('./src/templates/news-list.js')
  });

  createI18nPage(createPage, {
    path: '/productions',
    component: path.resolve('./src/templates/production-list.js')
  });

  createI18nPage(createPage, {
    path: '/people',
    component: path.resolve('./src/templates/people-list.js')
  });

  // Chaining promises
  const promises = [

    // Activities
    graphql(QUERIES.ACTIVITIES).then(result => {
      if (!result.data)
        return;

      // Creating pages
      result.data.allActivitiesJson.edges.forEach(edge => {
        const activity = edge.node;

        const context = {
          identifier: activity.identifier
        };

        activity.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/activities/${slug}`,
            component: path.resolve('./src/templates/activity.js'),
            context
          });
        });
      });
    }),

    // People
    graphql(QUERIES.PEOPLE).then(result => {
      if (!result.data)
        return;

      // Creating pages
      result.data.allPeopleJson.edges.forEach(edge => {
        const person = edge.node;

        const context = {
          identifier: person.identifier
        };

        person.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/people/${slug}`,
            component: path.resolve('./src/templates/people.js'),
            context
          });
        });
      });
    }),

    // Productions
    graphql(QUERIES.PUBLICATION).then(result => {
      if (!result.data)
        return;

      // Creating pages
      result.data.allProductionsJson.edges.forEach(edge => {
        const production = edge.node;

        const context = {
          identifier: production.identifier
        };

        production.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/productions/${slug}`,
            component: path.resolve('./src/templates/production.js'),
            context
          });
        });
      });
    }),

    // News
    graphql(QUERIES.NEWS).then(result => {
      if (!result.data)
        return;

      // Creating pages
      result.data.allNewsJson.edges.forEach(edge => {
        const news = edge.node;

        const context = {
          identifier: news.identifier
        };

        news.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/news/${slug}`,
            component: path.resolve('./src/templates/news.js'),
            context
          });
        });

      });
    })
  ];

  return Promise.all(promises);
};

exports.setFieldsOnGraphQLNodeType = function({type, getNodesByType}) {

  if (type.name === 'SettingsJson') {
    return graphQLSchemaAdditionForSettings();
  }

  else if (type.name === 'ActivitiesJson') {
    patchGraphQLSchema(GRAPHQL_SCHEMAS, 'activities', type, SCHEMAS.activities);
    return GRAPHQL_SCHEMAS.activities;
  }

  else if (type.name === 'PeopleJson') {
    patchGraphQLSchema(GRAPHQL_SCHEMAS, 'people', type, SCHEMAS.people);
    addBacklinkToGraphQLSchema(
      getNodesByType.bind(null, 'ActivitiesJson'),
      GRAPHQL_SCHEMAS,
      'people',
      'activities'
    );
    return GRAPHQL_SCHEMAS.people;
  }

  else if (type.name === 'ProductionsJson') {
    patchGraphQLSchema(GRAPHQL_SCHEMAS, 'productions', type, SCHEMAS.productions);
    return GRAPHQL_SCHEMAS.productions;
  }

  else if (type.name === 'NewsJson') {
    patchGraphQLSchema(GRAPHQL_SCHEMAS, 'news', type, SCHEMAS.news);
    return GRAPHQL_SCHEMAS.news;
  }

  return {};
};
