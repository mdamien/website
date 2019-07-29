/* eslint no-console: 0 */
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const shuffleInPlace = require('pandemonium/shuffle-in-place');
const _ = require('lodash');

const {
  importGraphQLSchema,
  hashNode,
  createI18nPage,
  frenchTypographyReplace
} = require('./utils.js');

const {
  template,
  resolveAttachments
} = require('./templating.js');

const {
  createSettingsItemResolver,
  createRelationResolver,
  createBacklinkResolver,
  createCoverImageResolver
} = require('./schemas/resolvers.js');

// Env vars
const ROOT_PATH = process.env.ROOT_PATH || '..';
const BUILD_CONTEXT = process.env.BUILD_CONTEXT;
const ADMIN_URL = process.env.ADMIN_URL;
const NODE_ENV = process.env.NODE_ENV;

// Paths & data
const QUERIES = require('./queries.js');
const ENUMS = require(path.join(ROOT_PATH, 'specs', 'enums.json'));
const MODELS = require(path.join(ROOT_PATH, 'specs', 'models.json'));
const DB_PATH = path.join(ROOT_PATH, 'data');
const DB_GLOB = path.join(ROOT_PATH, 'data', '*.json');
const ASSETS_PATH = path.join(ROOT_PATH, 'data', 'assets');
const ASSETS_GLOB = path.join(ASSETS_PATH, '*');
const PUBLIC_PATH = path.join(process.cwd(), 'public', 'static');

const PRODUCTION_TYPE_TO_GROUP = {};

_.forEach(ENUMS.productionTypes.groups, (group, key) => {
  group.values.forEach(type => PRODUCTION_TYPE_TO_GROUP[type] = key);
});

const processing = require(path.join(ROOT_PATH, 'specs', 'processing.js')).sharpToString;

const MODELS_PATHS = {};

MODELS.forEach(model => {
  MODELS_PATHS[model] = path.join(DB_PATH, `${model}.json`);
});

// Specifics models
MODELS_PATHS.settings = path.join(DB_PATH, 'settings.json');
MODELS_PATHS.github = path.join(DB_PATH, 'github.json');
MODELS_PATHS.twitter = path.join(DB_PATH, 'twitter.json');

function solveEnum(e, target, o) {
  const k = target + 'Label';

  o[k] = {};

  if (o[target]) {
    o[k].fr = e.fr[o[target]];
    o[k].en = e.en[o[target]];
  }
}

const MODEL_READERS = {
  activities({actions: {createNode, deleteNode}, getNode, pathPrefix}) {
    const rawData = fs.readFileSync(MODELS_PATHS.activities, 'utf-8');
    const data = JSON.parse(rawData);

    // Activities
    data.activities.forEach(activity => {
      if (NODE_ENV === 'production' && activity.draft)
        return;

      const node = getNode(activity.id);

      if (node)
        deleteNode({node});

      // Solving enums
      activity.typeLabel = {
        en: ENUMS.activityTypes.en[activity.type],
        fr: ENUMS.activityTypes.fr[activity.type]
      };

      // Processing HTML
      const content = template(pathPrefix, activity.content);

      const hash = hashNode(activity);

      const slug = _.last(activity.slugs);

      createNode({
        ...activity,
        content,
        attachments: resolveAttachments(pathPrefix, activity.attachments || []),
        permalink: {
          fr: `/activites/${slug}`,
          en: `/en/activities/${slug}`
        },
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

    // Shuffling people to randomize list order
    shuffleInPlace(data.people);

    // People
    data.people.forEach(person => {
      if (NODE_ENV === 'production' && person.draft)
        return;

      const node = getNode(person.id);

      if (node)
        deleteNode({node});

      // Processing HTML
      const content = template(pathPrefix, person.bio);

      const hash = hashNode(person);

      const slug = _.last(person.slugs);

      createNode({
        ...person,
        bio: content,
        contacts: resolveAttachments(pathPrefix, person.contacts || []),
        permalink: {
          fr: `/equipe/${slug}`,
          en: `/en/people/${slug}`
        },
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

    // we need people data to create authors field from people
    const peopleRawData = fs.readFileSync(MODELS_PATHS.people, 'utf-8');
    const peopleData = JSON.parse(peopleRawData);
    const peopleIndex = _.keyBy(peopleData.people, p => p.id);

    // Productions
    data.productions.forEach(production => {
      if (NODE_ENV === 'production' && production.draft)
        return;

      const node = getNode(production.id);

      if (node)
        deleteNode({node});

      if (production.spire) {
        // use spire.generatedFields for empty object fields
        production = {...production.spire.generatedFields, ...production};
      }

      // Typography
      if (production.title && production.title.fr)
        production.title.fr = frenchTypographyReplace(production.title.fr);

      // Solving enums
      solveEnum(ENUMS.productionTypes, 'type', production);

      production.group = PRODUCTION_TYPE_TO_GROUP[production.type || ENUMS.productionTypes.default];
      const relevantGroupInfo = ENUMS.productionTypes.groups[production.group];

      production.groupLabel = {
        en: relevantGroupInfo.en,
        fr: relevantGroupInfo.fr
      };

      production.typeLabel = {
        en: ENUMS.productionTypes.en[production.type || ENUMS.productionTypes.default],
        fr: ENUMS.productionTypes.fr[production.type || ENUMS.productionTypes.default]
      };

      // if authors field is empty but we have people, let's fill the field.
      if ((!production.authors || production.authors === '') && production.people && production.people.length > 0)
        production.authors = production.people.map(pId => (peopleIndex[pId] ? `${peopleIndex[pId].firstName} ${peopleIndex[pId].lastName}` : `${pId} missing`)).join(', ');

      // Processing HTML
      const content = template(pathPrefix, production.content);

      const hash = hashNode(production);

      const slug = _.last(production.slugs);

      createNode({
        ...production,
        content,
        permalink: {
          fr: `/productions/${slug}`,
          en: `/en/productions/${slug}`
        },
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
      if (NODE_ENV === 'production' && news.draft)
        return;

      const node = getNode(news.id);

      if (node)
        deleteNode({node});

      // NOTE: renaming our `internal` prop because Gatsby does not like this very much...
      news.isInternal = news.internal;
      delete news.internal;

      // Typography
      if (news.title && news.title.fr)
        news.title.fr = frenchTypographyReplace(news.title.fr);

      // Solving enums
      news.typeLabel = {
        en: ENUMS.newsTypes.en[news.type],
        fr: ENUMS.newsTypes.fr[news.type]
      };

      // Processing HTML
      const content = template(pathPrefix, news.content);

      const hash = hashNode(news);

      const slug = _.last(news.slugs);

      // Computing expiry
      let expiry = news.startDate;

      if (news.endDate)
        expiry = news.endDate;

      if (expiry)
        news.expiry = +(new Date(expiry)) / 1000;

      createNode({
        ...news,
        content: content,
        permalink: {
          fr: `/actu/${slug}`,
          en: `/en/news/${slug}`
        },
        internal: {
          type: 'NewsJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  github({actions: {createNode, deleteNode}, getNodesByType}) {
    if (!fs.existsSync(MODELS_PATHS.github))
      return;

    const rawData = fs.readFileSync(MODELS_PATHS.github, 'utf-8');
    const data = JSON.parse(rawData);

    getNodesByType('GithubJson').forEach(node => {
      deleteNode({node});
    });

    data.forEach((event, i) => {
      const hash = hashNode(event);
      event.authors = event.authors.map(a => {
        if (a.slug)
          return {...a,
            permalink: {
              fr: `/equipe/${a.slug}`,
              en: `/en/people/${a.slug}`
            }
          };
        else
          return a;
      });
      createNode({
        ...event,
        id: `github-${i}`,
        internal: {
          type: 'GithubJson',
          contentDigest: hash,
          mediaType: 'application/json'
        }
      });
    });
  },

  twitter({actions: {createNode, deleteNode}, getNodesByType}) {
    if (!fs.existsSync(MODELS_PATHS.twitter))
      return;

    const rawData = fs.readFileSync(MODELS_PATHS.twitter, 'utf-8');
    const data = JSON.parse(rawData);

    getNodesByType('TwitterJson').forEach(node => {
      deleteNode({node});
    });

    data.forEach((tweet, i) => {
      const hash = hashNode(tweet);

      createNode({
        ...tweet,
        id: `twitter-${i}`,
        internal: {
          type: 'TwitterJson',
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

exports.createSchemaCustomization = function({actions}) {
  const fluxSchema = importGraphQLSchema('flux');
  const modelSchema = importGraphQLSchema('model');

  actions.createTypes([
    fluxSchema,
    modelSchema
  ]);
};

exports.createResolvers = function({createResolvers, pathPrefix}) {

  const settings = {
    assetsPath: ASSETS_PATH,
    publicPath: PUBLIC_PATH,
    prefix: pathPrefix,
    processing
  };

  createResolvers({
    HomeItem: {
      data: createSettingsItemResolver(settings)
    },

    ActivitiesJson: {
      // Cover
      coverImage: createCoverImageResolver(settings),

      // Relations
      people: createRelationResolver('people'),

      // Backlinks
      news: createBacklinkResolver('NewsJson', 'activities'),
      productions: createBacklinkResolver('ProductionsJson', 'activities')
    },

    NewsJson: {
      // Cover
      coverImage: createCoverImageResolver(settings),

      // Relations
      activities: createRelationResolver('activities'),
      people: createRelationResolver('people'),
      productions: createRelationResolver('productions')
    },

    PeopleJson: {
      // Cover
      coverImage: createCoverImageResolver(settings),

      // Relations
      mainActivities: createRelationResolver('mainActivities'),
      mainProductions: createRelationResolver('mainProductions'),

      // Backlinks
      activities: createBacklinkResolver('ActivitiesJson', 'people'),
      news: createBacklinkResolver('NewsJson', 'people'),
      productions: createBacklinkResolver('ProductionsJson', 'people')
    },

    ProductionsJson: {
      // Cover
      coverImage: createCoverImageResolver(settings),

      // Relations
      activities: createRelationResolver('activities'),
      people: createRelationResolver('people'),
      productions: createRelationResolver('productions')
    }
  });
};

exports.sourceNodes = function(args) {
  const {actions: {createNode}} = args;

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
    .watch(ASSETS_GLOB, {awaitWriteFinish: true})
    .on('add', copyAsset)
    .on('unlink', deleteAsset);

  // Handling database
  for (const model in MODEL_READERS)
    MODEL_READERS[model](args);

  chokidar
    .watch(DB_GLOB, {awaitWriteFinish: true})
    .on('change', p => {
      const model = path.basename(p, '.json');

      if (!(model in MODEL_READERS))
        return;

      console.log(`Updating ${model}.json`);
      MODEL_READERS[model](args);
    });

  // Some faceted enums for templating convenience
  const facetedEnums = {
    activityStatuses: [
      {
        id: 'current',
        label: {
          en: 'Active',
          fr: 'Actives'
        },
        permalink: {
          en: '/en/activities/current',
          fr: '/activites/current'
        }
      },
      {
        id: 'past',
        label: {
          en: 'Past',
          fr: 'Passées'
        },
        permalink: {
          en: '/en/activities/past',
          fr: '/activites/past'
        }
      }
    ],
    productionTypes: ENUMS.productionTypes.groupOrder.map(group => {
      const e = ENUMS.productionTypes.groups[group];

      return {
        id: group,
        label: {
          en: e.en,
          fr: e.fr
        },
        permalink: {
          en: '/en/productions/' + group,
          fr: '/productions/' + group
        },
        values: e.values.map(v => {
          return {
            label: {
              en: ENUMS.productionTypes.en[v],
              fr: ENUMS.productionTypes.fr[v]
            },
            type: v
          }
        })
      }
    })
  };

  const facetedEnumHash = hashNode(facetedEnums);

  createNode({
    ...facetedEnums,
    id: 'site-faceted-enums-node',
    internal: {
      type: 'FacetedEnumsJson',
      contentDigest: facetedEnumHash,
      mediaType: 'application/json'
    }
  });
};

exports.createPages = function({graphql, actions}) {
  const {createPage} = actions;

  // TODO: CHANGE THIS WHEN IN PROD!
  // const yesterday = +(new Date()) / 1000;
  const yesterday = +(new Date('2010-02-01T16:30')) / 1000;

  // Creating basic pages
  createI18nPage(createPage, {
    path: '/',
    component: path.resolve('./src/templates/index.js'),
    context: {
      yesterday
    }
  });

  createI18nPage(createPage, {
    path: '/about',
    frenchPath: '/a-propos',
    component: path.resolve('./src/templates/about.js')
  });

  createI18nPage(createPage, {
    path: '/archive',
    component: path.resolve('./src/templates/archive.js')
  });

  createI18nPage(createPage, {
    path: '/legal',
    component: path.resolve('./src/templates/legal.js')
  });

  createI18nPage(createPage, {
    path: '/404.html',
    component: path.resolve('./src/templates/error.js'),
    context: {
      code: 404
    }
  });

  // Activities
  createI18nPage(createPage, {
    path: '/activities',
    frenchPath: '/activites',
    component: path.resolve('./src/templates/activity-list.js'),
    context: {
      status: 'all',
      allowedStatuses: [true, false]
    }
  });

  // createI18nPage(createPage, {
  //   path: '/activities/current',
  //   frenchPath: '/activites/current',
  //   component: path.resolve('./src/templates/activity-list.js'),
  //   context: {
  //     status: 'current',
  //     allowedStatuses: [true]
  //   }
  // });

  // createI18nPage(createPage, {
  //   path: '/activities/past',
  //   frenchPath: '/activites/past',
  //   component: path.resolve('./src/templates/activity-list.js'),
  //   context: {
  //     status: 'past',
  //     allowedStatuses: [false]
  //   }
  // });

  // News
  createI18nPage(createPage, {
    path: '/news',
    frenchPath: '/actu',
    component: path.resolve('./src/templates/news-list.js')
  });

  // Productions
  createI18nPage(createPage, {
    path: '/productions',
    component: path.resolve('./src/templates/production-list.js'),
    context: {
      group: 'all',
      allowedTypes: Object.keys(ENUMS.productionTypes.en)
    }
  });

  for (const group in ENUMS.productionTypes.groups) {
    createI18nPage(createPage, {
      path: `/productions/${group}`,
      component: path.resolve('./src/templates/production-list.js'),
      context: {
        group,
        allowedTypes: ENUMS.productionTypes.groups[group].values
      }
    });
  }

  // People
  createI18nPage(createPage, {
    path: '/people',
    frenchPath: '/equipe',
    component: path.resolve('./src/templates/people-list.js')
  });

  const linkToAdmin = (model, id) => {
    if (ADMIN_URL && (!BUILD_CONTEXT || BUILD_CONTEXT !== 'prod'))
      return `${ADMIN_URL}/#/${model}/${id}`;
    else
      return null;
  };

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
          id: activity.id,
          linkToAdmin: linkToAdmin('activities', activity.id)
        };

        activity.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/activities/${slug}`,
            frenchPath: `/activites/${slug}`,
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
          id: person.id,
          linkToAdmin: linkToAdmin('people', person.id)
        };

        person.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/people/${slug}`,
            frenchPath: `/equipe/${slug}`,
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
        if (!production.external) {
          const context = {
            id: production.id,
            linkToAdmin: linkToAdmin('productions', production.id)
          };

          production.slugs.forEach(slug => {
            createI18nPage(createPage, {
              path: `/productions/${slug}`,
              component: path.resolve('./src/templates/production.js'),
              context
            });
          });
        }
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
          id: news.id,
          linkToAdmin: linkToAdmin('news', news.id)
        };

        news.slugs.forEach(slug => {
          createI18nPage(createPage, {
            path: `/news/${slug}`,
            frenchPath: `/actu/${slug}`,
            component: path.resolve('./src/templates/news.js'),
            context
          });
        });

      });
    })
  ];

  return Promise.all(promises);
};
