const NODE_ENV = process.env.NODE_ENV;
const path = require('path');

// Babel require hook to transpile React/ES6 imports from static site templates
const siteDirectory = path.resolve(__dirname, '..', 'site');

require('@babel/register')({
  cache: NODE_ENV === 'production' ? false : true,
  only: [
    new RegExp(siteDirectory.replace(/\//g, '\/')),
    /wilson\/render\.js/
  ],
  presets: ['@babel/preset-env', '@babel/preset-react']
});

// Dependencies
const async = require('async');
const config = require('config-secrets');
const sass = require('node-sass');
const rimraf = require('rimraf');
const fs = require('fs-extra');
const {renderPage} = require('./render.js');
const Database = require('./database.js');
const Website = require('./website.js');
const {permalinkToDiskPath} = require('./utils.js');
const createSitemapFromPages = require('./sitemap.js');
const createRssFeeds = require('./rss.js');

const META = require('./meta.js');

const apply = async.apply;

// Helpers
function writePermalinkToDisk(outputDir, html, permalink, callback) {
  const diskPath = permalinkToDiskPath(outputDir, permalink);

  return async.series([
    apply(fs.ensureDir, diskPath),
    apply(fs.writeFile, path.join(diskPath, 'index.html'), html)
  ], callback);
}

function writeI18nPermalinkToDisk(outputDir, versions, permalinks, callback) {
  return async.parallel([
    apply(writePermalinkToDisk, outputDir, versions.fr, permalinks.fr),
    apply(writePermalinkToDisk, outputDir, versions.en, permalinks.en)
  ], callback);
}

const FONT_PATH = path.join(__dirname, '..', 'site', 'assets', 'font');
const BEL2_FONT_PATH = path.join(FONT_PATH, 'Bel2');
const SYMBOL_FONT_PATH = path.join(FONT_PATH, 'Symbol');

// TODO: compress, sourceMap false
function buildSass(outputDir, callback) {
  const fontDir = path.join(outputDir, 'font');

  return async.series({
    ensureFontDir: apply(fs.ensureDir, fontDir),
    copyFonts(next) {
      return async.parallel([
        apply(fs.copy, BEL2_FONT_PATH, path.join(fontDir, 'bel2')),
        apply(fs.copy, SYMBOL_FONT_PATH, path.join(fontDir, 'symbol'))
      ], next);
    },
    renderSass(next) {
      return sass.render({
        file: path.join(__dirname, '..', 'site', 'assets', 'scss', 'global.scss')
      }, (err, result) => {
        if (err)
          return callback(err);

        fs.writeFile(path.join(outputDir, 'medialab.css'), result.css, next);
      });
    }
  }, callback);
}

const IMG = [
  'people-placeholder.png',
  'cover-twitter.png',
  'cover-fb.png'
];

function copyAssets(inputDir, outputDir, callback) {
  async.parallel({
    assets(next) {
      return fs.copy(
        path.join(inputDir, 'assets'),
        path.join(outputDir, 'static'),
        next
      );
    },

    img(next) {
      const imgDir = path.join(outputDir, 'img');

      fs.ensureDir(imgDir, err => {
        if (err)
          return next(err);

        return async.each(IMG, (img, n) => {
          fs.copyFile(
            path.join(__dirname, '..', 'site', 'assets', 'images', img),
            path.join(imgDir, img),
            n
          );
        }, next);
      });
    },

    js(next) {
      const jsDir = path.join(outputDir, 'js');

      fs.ensureDir(jsDir, err => {
        if (err)
          return next(err);

        return fs.copy(
          path.join(__dirname, '..', 'site', 'assets', 'js'),
          jsDir,
          next
        );
      });
    }
  }, callback);
}

function buildSitemap(outputDir, siteUrl, pathPrefix, pages, callback) {
  const sitemap = createSitemapFromPages(siteUrl, pathPrefix, pages);
  fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap, callback);
}

function buildRssFeeds(outputDir, feeds, callback) {
  async.eachLimit(feeds, 10, (feed, next) => {
    const {fr, en} = feed;

    async.parallel([
      apply(fs.writeFile, permalinkToDiskPath(outputDir, en.path), en.rss),
      apply(fs.writeFile, permalinkToDiskPath(outputDir, fr.path), fr.rss)
    ], next);
  }, callback);
}

function build404Page(outputDir, pathPrefix, callback) {
  const html = renderPage(
    pathPrefix,
    '/',
    require.resolve('../site/templates/404.js')
  );

  fs.writeFile(path.join(outputDir, '404.html'), html, callback);
}

// Main functions
function buildI18nPage(
  outputDir,
  pathPrefix,
  {permalinks, template, context, data, scripts},
  options,
  callback
) {
  options = options || {};
  context = context || {};

  const versions = {};

  const commonContext = {
    permalinks,
    linkToAdmin: NODE_ENV !== 'production' ? '' : '', // TODO: fix this!
    ...context
  };

  const commonOptions = {
    rssFeeds: options.rssFeeds || null,
    googleAnalyticsId: config.get('googleAnalyticsId')
  };

  versions.fr = renderPage(
    pathPrefix,
    permalinks.fr,
    template,
    {
      ...commonContext,
      lang: 'fr'
    },
    data,
    {...commonOptions, scripts}
  );

  versions.en = renderPage(
    pathPrefix,
    permalinks.en,
    template,
    {
      ...commonContext,
      lang: 'en'
    },
    data,
    {...commonOptions, scripts}
  );

  writeI18nPermalinkToDisk(outputDir, versions, permalinks, callback);
}

exports.build = function build(inputDir, outputDir, options, callback) {
  options = options || {};
  const pathPrefix = options.pathPrefix || '';
  const skipDrafts = options.skipDrafts || false;

  const db = new Database(inputDir, {pathPrefix, skipDrafts});
  const website = new Website(db);

  let rssFeeds = null;

  function buildAllAssets(nextStep) {
    return async.parallel({
      assets(next) {
        return copyAssets(inputDir, outputDir, next);
      },

      covers(next) {
        return db.processCovers(inputDir, outputDir, pathPrefix, next);
      },

      sass(next) {
        return buildSass(outputDir, next);
      },

      rss(next) {
        rssFeeds = createRssFeeds(META.siteUrl, pathPrefix, db);

        return buildRssFeeds(outputDir, rssFeeds, next);
      },

      page404(next) {

        // Static error page
        return build404Page(outputDir, pathPrefix, next);
      },

      sitemap(next) {

        // Sitemap
        return buildSitemap(
          outputDir,
          META.siteUrl,
          pathPrefix,
          website.getPagesToRender(),
          next
        );
      }
    }, nextStep);
  }

  // TODO: Giving path to covers in reducers could enable to build pages while
  // processing assets
  async.series({
    cleanup: apply(rimraf, outputDir),

    createDir: apply(fs.ensureDir, outputDir),
    createStaticDir: apply(fs.ensureDir, path.join(outputDir, 'static')),

    assets: buildAllAssets,

    build(next) {

      console.time('buildPages');

      // Building pages
      return async.eachLimit(website.getPagesToRender(), 10, (page, nextPage) => {
        return buildI18nPage(
          outputDir,
          pathPrefix,
          page,
          {rssFeeds},
          nextPage
        )
      }, next);
    }
  }, callback);
}

console.time('build');
exports.build('./data', './wbuild', {skipDrafts: true}, err => {
  console.log(err);
  console.timeEnd('build');
  console.timeEnd('buildPages');
});
