import React from 'react';
import {graphql} from 'gatsby';

import Layout from '../components/Layout';
import Home from '../components/Home';

export const query = graphql`
  {
    settingsJson {
      home {
        grid {
          id
          model
          data {
            ... on Activities {
              coverImage {
                url
              }
              description {
                en
                fr
              }
              name
              baseline {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
            ... on News {
              coverImage {
                url
              }
              description {
                en
                fr
              }
              title {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
            ... on Productions {
              coverImage {
                url
              }
              description {
                en
                fr
              }
              title {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
          }
        }
        slider {
          id
          model
          data {
            ... on Activities {
              name
              coverImage {
                url
              }
              baseline {
                en
                fr
              }
              description {
                en
                fr
              }
              baseline {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
            ... on News {
              coverImage {
                url
              }
              place
              startDate
              endDate
              label {
                en
                fr
              }
              title {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
            ... on Productions {
              coverImage {
                url
              }
              description {
                en
                fr
              }
              authors
              title {
                en
                fr
              }
              permalink {
                en
                fr
              }
            }
          }
        }
      }
    }
    rdv: allNewsJson(limit: 5) {
      edges {
        node {
          title {
            fr
            en
          }
          startDate
          endDate,
          label {
            en
            fr
          }
          place
          permalink {
            en
            fr
          }
        }
      }
    }
  }
`;

const IndexPage = ({data, pageContext}) => {
  console.log(data, pageContext);

  const grid = data.settingsJson.home.grid;
  const slider = data.settingsJson.home.slider;
  const rdv = data.rdv.edges.map(({node}) => node);

  return (
    <Layout
      lang={pageContext.lang}
      className="page-home"
      permalinks={pageContext.permalinks}>
      <Home lang={pageContext.lang} grid={grid} slider={slider} rdv={rdv} />
    </Layout>
  );
};

export default IndexPage;
