const spire = require('../spire');
const _ = require('lodash');

module.exports = function(req, dbs, next) {
    dbs.productions.read();
    const prodState = dbs.productions.getState();
    dbs.people.read();
    const peopleState = dbs.people.getState();
    const spireAuthors = _.keyBy(peopleState.people.filter(p => !!p.spire), p => p.spire.id);


    prodState.productions.filter(p => p.spire && p.spire.meta).forEach(p => {
      p.spire.generatedFields = spire.translateRecord(p.spire.meta, spireAuthors);
      for (const field in p.spire.generatedFields) {
        delete p[field];
      }
    });

    dbs.productions.setState(prodState);

    dbs.productions.write().then(() => next());
};