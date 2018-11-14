import React from 'react';
import {graphql} from 'gatsby';

export const queryFragment = graphql`
  fragment ActivityDetail on ActivitiesJson {
    name
    type
    baseline {
      en
      fr
    }
    description {
      en
      fr
    }
    type
    content {
      en
      fr
    }
    people
    active
    draft
  }
`;

export default function ActivityDetail({data}) {
  console.log(data);

  return (
    <div>
      <h1>Activité: {data.name}</h1>
      {data.draft && <p><em>This is a draft.</em></p>}
      {data.active && <p><em>This activity is active.</em></p>}
      <p>
        <strong>Type</strong>: {data.type}
      </p>
      <p>
        <strong>EN baseline</strong>: {data.baseline && data.baseline.en}
      </p>
      <p>
        <strong>FR baseline</strong>: {data.baseline && data.baseline.fr}
      </p>
    </div>
  );
}