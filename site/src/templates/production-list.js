import React from 'react';
import {graphql} from 'gatsby';

import Layout from '../components/Layout';
import ProductionListing from '../components/ProductionListing';

export const query = graphql`
  query ($allowedTypes: [String]!) {
    allProductionsJson(filter: {type: {in: $allowedTypes}}) {
      edges {
        node {
          id
          title {
            en
            fr
          }
          description {
            en
            fr
          }
          slugs
          type
          authors
          lastUpdated
        }
      }
    }
  }
`;

export default ({data, pageContext}) => {
  console.log(data, pageContext);

  const list = data.allProductionsJson.edges.map(e => e.node);

  return (
    <Layout lang={pageContext.lang}>
      <ProductionListing lang={pageContext.lang} list={list} group={pageContext.group} />
    </Layout>
  );
};
