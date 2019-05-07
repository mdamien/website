/* eslint no-console: 0 */
const config = require('config'),
      Ajv = require('ajv'),
      async = require('async'),
      request = require('request'),
      _ = require('lodash'),
      slug = require('slug'),
      uuid = require('uuid/v4');

const models = require('../specs/models.json');

const VALIDATORS = {};

models.forEach(model => {
  const ajv = new Ajv();
  VALIDATORS[model] = ajv.compile(require(`../specs/schemas/${model}.json`));
});

const spireTypes = require('../specs/spireProductionsTypes.json');

const DEFAULT_MAX_SLUG_TOKENS = 6;
function slugify(text) {
  const s = slug(text, {lower: true});
  return s.split('-').slice(0, DEFAULT_MAX_SLUG_TOKENS).join('-');
}

const resultPerPage = 2000;

const title = record => (record.title_non_sort ? record.title_non_sort : '') + record.title + (record.title_sub ? ' - ' + record.title_sub : '');

// translation functions stored by object path.
// translation function returns false is ther is nothing to update for the path.
const translators = {
  'type': record => spireTypes[record.spire_document_type],
  'date': record => record.date_issued,
  'title.en': record => title(record),
  'title.fr': record => title(record),
  'content': record => {
    const content = {};
    if (record.descriptions) {
      record.descriptions.forEach(d => {
        if (d.language === 'fr' || d.language === 'en')
          content[d.language] = d.value;
      });
    }
    return content === {} ? false : content;
  },
  'authors': record => record.creators.filter(c => c.role === 'aut' && c.agent.rec_class === 'Person').map(c => `${c.agent.name_given} ${c.agent.name_family}`).join(', '),
  // people:
  'ref': record => record.citations.html.chicago,
  'url': record => {
    if (record.resources && record.resources.length >= 1)
      return record.resources[0].url;
    else
      return config.spire.front + record.rec_id;
  }
};

function translateRecord(record) {
  const newO = {};
  for (const field in translators) {
    const v = translators[field](record);
    if (v !== false)
      _.set(newO, field, v);
  }
  return newO;
}

module.exports.translators = translators;

module.exports.aSPIRE = function aSPIRE(callback) {
  async.waterfall([
    // load indeces of existing prod and authors
    getRefDone => {
      async.parallel({
        people: fetchPeopleDone => {
          request.get(`http://localhost:${config.port}/people/people`, {json: true}, (err, result) => {
            if (err) fetchPeopleDone(err);
            fetchPeopleDone(null, _.keyBy(result.body, p => p.slugs[0]));
          });
        },
        productions: fetchProductionsDone => {
          request.get(`http://localhost:${config.port}/productions/productions`, {json: true}, (err, result) => {
            if (err) fetchProductionsDone(err);
            fetchProductionsDone(null, _.keyBy(result.body.filter(p => !!p.spire), p => p.spire.id));
          });
        }
      }, (err, indeces) => {
        if (err) throw err;
        getRefDone(null, indeces);
      });
    },
    (indeces, doneAPISpire) => {
      let resultOffset = 0;
      let spireRecords = []
      async.doUntil(
        (apiPageDone) => {
          // request spire API
          const body = {jsonrpc: '2.0', method: 'search', id: 1,
          params: ['corpus', {
            filter_class: 'Document',
            result_batch_size: resultPerPage,
            result_citation_styles: ['chicago'],
            search_terms: {
                index: 'affiliation_id',
                operator: '=',
                value: '2441/53r60a8s3kup1vc9kf4j86q90'},
            result_offset: resultOffset
          }]};
          console.debug(`request to spire ${resultOffset}`);
          request.post(config.spire.api, {body, json: true}, apiPageDone);
        },
        (response) => {
          // store result
          spireRecords = spireRecords.concat(response.body.result.records)
          // pagination control
          const r = response.body.result;
          console.debug(`got ${r.result_batch_size}`);
          // test if a new page is needed
          if (r.result_batch_size < resultPerPage) {
            // we are done
            return true;
          }
          // need more results
          resultOffset += resultPerPage;
          return false;
        },
        // manage Spire result
        (err) => {
          if (err) {
            doneAPISpire(err);
          }
          console.debug(`got ${spireRecords.length}`);
     
          // common queue to process the writing requests
          const websiteApiQueue = async.queue(({method, model, object}, cb) => {
            if (!VALIDATORS[model](object)) {
              console.error(model, object, VALIDATORS[model].errors);
              cb(new Error(VALIDATORS[model].errors));
            }
            const url = method === 'PUT' ? `http://localhost:${config.port}/${model}/${model}/${object.id}` : `http://localhost:${config.port}/${model}/${model}/`;
            console.debug(`API CALL ${model} ${method} ${object.id}`);
            request({url, method, body: object, json: true}, (reqErr) => {
              if (reqErr) {
                console.error(`error ${method} ${model} ${object.id}`, err);
                cb(reqErr);
              }
              else
                cb(null);
            });
          }, 2);

          const spireAuthors = _.keyBy(_.values(indeces.people).filter(p => !!p.spire), p => p.spire.id);
          // find authors and detect missing ones
          const missingLabAuthors = _.keyBy(_.flatten(spireRecords.map(
            // only author (not organisators)
            r => r.creators.filter(c => (c.role === 'aut' &&
            // which were at that time affiliated to the lab 
            c.affiliation && c.affiliation.rec_id === '2441/53r60a8s3kup1vc9kf4j86q90')
            // which is a person which is not registered as a spire authors in our data
            && c.agent && c.agent.rec_class === 'Person' && !spireAuthors[c.agent.rec_id])
            .map(c => c.agent))), c => c.rec_id);
          // let's try to reconcile with slugs
          const peopleToResolve = [];
          _.forEach(missingLabAuthors, (aut, idSpire) => {
            // simple true match on slug
            const match = indeces.people[slugify(`${aut.name_given} ${aut.name_family}`)];
            if (match) {
              spireAuthors[idSpire] = {spire: {id: idSpire}, ...match}
              websiteApiQueue.push({method: 'PUT', model: 'people', object: {spire: {id: idSpire}, ...match}}, (e) => {
                if (e) console.error(e);
              });
            }
            else {
              peopleToResolve.push(aut);
            }
          });
          // log what left to be resolved
          if (peopleToResolve.length > 0)
            console.debug(`missing spire authors in data ${peopleToResolve.map(aut => `${aut.name_given} ${aut.name_family}`)}`);

          // control variables
          const modifiedProductionIds = [];
          let nbNewProductions = 0;
          const tooRecentProductionsId = [];

          //treat records
          async.each(spireRecords,
            (record, d) => {

              // create the object by translating it to our data model
              const newProduction = translateRecord(record);
              newProduction.lastUpdated = Date.now();
              // meta
              newProduction.spire = {
                id: record.rec_id,
                lastUpdated: newProduction.lastUpdated,
                meta: record
              };
              // reuse ref for description
              newProduction.description = {fr: newProduction.ref, en: newProduction.ref};
              // link to author people
              const people = record.creators
                // filter authors who are person
                .filter(c => c.role === 'aut' && c.agent && c.agent.rec_class === 'Person')
                .map(c => spireAuthors[c.agent.rec_id] && spireAuthors[c.agent.rec_id].id)
                .filter(c => !!c);
              newProduction.people = people;

              const p = indeces.productions[record.rec_id];
              // do we already have this one ?
              // has the content changed from last spire update ? (default last spire => 2019/01/11)
              if (p && (p.lastUpdated <= (p.spire.lastUpdated || 1547290000000))) {
                // We should put this condition back to limit futile updates && p.spire.meta.rec_modified_date !== record.rec_modified_date) {
                // flash the data from spire.
                websiteApiQueue.push({method: 'PUT', model: 'productions', object: {...p, ...newProduction}}, (e) => {
                  if (e) console.error(e);
                });
                modifiedProductionIds.push(p.id);
              }
              else
                if (p) {
                  console.debug(p.id, new Date(p.lastUpdated), new Date(p.spire.lastUpdated || 1547290000000));
                  tooRecentProductionsId.push(p.id);
                }
              // if new publication + if type is not translated to null
              if (!p && spireTypes[record.spire_document_type]) {
                newProduction.id = uuid();
                // draft by default
                newProduction.draft = true;
                // slugs
                newProduction.slugs = [slugify(newProduction.title ? (newProduction.title.fr || newProduction.title.en || '') : '')];

                // lastUpdated
                websiteApiQueue.push({method: 'POST', model: 'productions', object: newProduction}, (e) => {
                  if (e) console.error(e);
                });
                nbNewProductions += 1;
              }
              d(null);
            },
            (r) => {
              if (r) doneAPISpire(r);
              if (websiteApiQueue.idle())
                doneAPISpire(null, {nbNewProductions, modifiedProductionIds, tooRecentProductionsId, peopleToResolve});
              else
                websiteApiQueue.drain = () => {
                  doneAPISpire(null, {nbNewProductions, modifiedProductionIds, tooRecentProductionsId, peopleToResolve});
                };
            }
          );
        }
      );
    }
  ], callback);
};

module.exports.aspireAuthors = function aspireAuthors(callback) {
  let resultOffset = 0;
  async.doUntil((done) => {
    // request spire API
    const body = {jsonrpc: '2.0', method: 'search', id: 1,
    params: ['corpus', {
      filter_class: 'Person',
      result_batch_size: 2000,
      search_terms: {
          index: 'affiliation_id',
          operator: '=',
          value: '2441/53r60a8s3kup1vc9kf4j86q90'},
      result_offset: resultOffset
    }]};
    console.debug('request to spire', resultOffset);
    request.post(config.spire.api, {body, json: true}, done);
  }, (response) => {
    const r = response.body.result;
    console.debug(`got ${r.result_batch_size}`);
    // test if a new page is needed
    if (r.result_batch_size < resultPerPage) {
      // we are done
      return true;
    }
    // need more results
    resultOffset += resultPerPage;
    return false;
  }, (err, response) => {
    const spirePeople = {};
    if (err) {
      throw err;
    }
    response.body.result.records.map(p => {
      let spireSlug = slugify(`${p.name_given} ${p.name_family}`);
      switch (spireSlug) {
        case 'benjamin-ooghe':
          spireSlug = 'benjamin-ooghe-tabanou';
          break;
        case 'vincent-lepinay':
          spireSlug = 'vincent-antonin-lepinay';
          break;
        case 'davy-braun':
          spireSlug = 'davy-peter-braun';
          break;
        default:
          break;
      }
      spirePeople[spireSlug] = p.rec_id;
    });
    callback(spirePeople);
  });
};
