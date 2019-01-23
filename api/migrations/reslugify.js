const slugs = require('../../specs/slugs.js');

function reslugiyModel(dbs, edits, plural, singular) {
  dbs[plural].read();

  edits[plural] = {};

  const state = dbs[plural].getState();

  return state[plural].map(item => {
    const oldSlug = item.slugs[0];
    const newSlug = slugs[singular](item);

    if (oldSlug !== newSlug)
      edits[plural][oldSlug] = newSlug;

    return {
      ...item,
      slugs: [newSlug].concat(item.slugs.slice(1))
    };
  });
}

module.exports = function(req, dbs, next) {
  const edits = {};

  const dryRun = 'dryrun' in req.query;

  [
    ['activities', 'activity'],
    ['news', 'news'],
    ['people', 'people'],
    ['productions', 'production']
  ].forEach(([plural, singular]) => {
    const state = reslugiyModel(dbs, edits, plural, singular);

    if (!dryRun)
      dbs[plural].setState({[plural]: state});
  });

  if (!dryRun)
    return next(null, edits);

  Promise.all([
    dbs.activities.write(),
    dbs.news.write(),
    dbs.people.write(),
    dbs.productions.write()
  ]).then(() => next(null, edits));
};
