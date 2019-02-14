const GraphQLTypes = require('gatsby/graphql');
const _ = require('lodash');

exports.graphQLSchemaAdditionForSettings = function(schemas, getNode) {

  const relationTypes = {};

  for (const k in schemas) {
    relationTypes[k] = new GraphQLTypes.GraphQLObjectType({
      name: _.capitalize(k),
      fields: {
        ...schemas[k],
        id: {
          type: GraphQLTypes.GraphQLString
        }
      }
    });
  }

  const ItemType = new GraphQLTypes.GraphQLObjectType({
    name: 'settings__item',
    fields: {
      id: {
        type: GraphQLTypes.GraphQLString
      },
      model: {
        type: GraphQLTypes.GraphQLString
      },
      data: {
        type: new GraphQLTypes.GraphQLUnionType({
          name: 'settings__item__data',
          types: Object.keys(relationTypes).map(k => relationTypes[k]),
          resolveType(item) {
            const type = item.internal.type;

            if (type === 'ActivitiesJson')
              return relationTypes.activities;

            if (type === 'NewsJson')
              return relationTypes.news;

            if (type === 'PeopleJson')
              return relationTypes.people;

            if (type === 'ProductionsJson')
              return relationTypes.productions;

            throw new Error('Unknown type!');
          }
        }),
        resolve(item) {
          const node = getNode(item.id);

          return node;
        }
      }
    }
  });

  return {
    home: {
      type: new GraphQLTypes.GraphQLObjectType({
        name: 'settings__home',
        fields: {
          grid: {
            type: new GraphQLTypes.GraphQLList(ItemType)
          },
          slider: {
            type: new GraphQLTypes.GraphQLList(ItemType)
          }
        }
      })
    }
  };
};

function recurseIntoSchema(model, meta) {

  if (meta.type === 'string')
    return {type: GraphQLTypes.GraphQLString};

  if (meta.type === 'number')
    return {type: GraphQLTypes.GraphQLFloat};

  if (meta.type === 'boolean')
    return {type: GraphQLTypes.GraphQLBoolean};

  if (meta.type === 'array' && meta.formType !== 'ref') {
    const {type: subType} = recurseIntoSchema(model, meta.items);

    return {
      type: new GraphQLTypes.GraphQLList(subType)
    };
  }

  if (meta.type === 'object') {
    const fields = {};

    for (const k in meta.properties)
      fields[k] = recurseIntoSchema(model, meta.properties[k]);

    return {
      type: new GraphQLTypes.GraphQLObjectType({
        name: model + '__' + _.deburr(meta.title.replace(/ /g, '_')),
        fields
      })
    };
  }
}

exports.graphQLSchemaAdditionFromJsonSchema = function(model, schema) {
  const item = {};

  for (const k in schema.properties) {
    if (k === 'id')
      continue;

    const meta = schema.properties[k];
    const addition = recurseIntoSchema(model, meta);

    if (addition)
      item[k] = addition;
  }

  return item;
};

exports.patchGraphQLSchema = function(current, model, type, schema) {

  // Checking empty relations
  for (const k in schema.properties) {
    const spec = schema.properties[k];

    if (spec.formType === 'ref') {

      const hasItems = type.nodes.some(node => {
        return node[k] && node[k].length;
      });

      if (!hasItems && !(k in current[model])) {
        const otherSchema = current[spec.model];

        const RelationType = new GraphQLTypes.GraphQLObjectType({
          name: model + '__' + k + '__relation',
          fields: {
            ...otherSchema,
            id: {
              type: GraphQLTypes.GraphQLString
            }
          }
        });

        current[model][k] = {type: new GraphQLTypes.GraphQLList(RelationType)};
      }
    }
  }
};

exports.addBacklinkToGraphQLSchema = function(getNodes, schemas, source, target) {

  const BacklinkType = new GraphQLTypes.GraphQLObjectType({
    name: target + '__backlink',
    fields: {
      ...schemas[target],
      id: {
        type: GraphQLTypes.GraphQLString
      }
    }
  });

  schemas[source][target] = {
    type: new GraphQLTypes.GraphQLList(BacklinkType),
    resolve: function(item) {
      return getNodes().filter(node => {

        if (!node[source])
          return;

        return node[source].some(id => id === item.id)
      });
    }
  };
};
