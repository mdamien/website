import React from 'react';
import {graphql} from 'gatsby';
import RawHTML from './RawHtml.js';

import {SECTIONS} from './fragments/sections';

import {join} from './helpers';
import Nav from './fragments/Nav.js';
import ToggleLang from './fragments/pages/ToggleLang.js';

import DateNews from './fragments/DateNews.js';
import TimeNews from './fragments/TimeNews.js';
import {format as formatDate, getYear, parseISO} from 'date-fns';

import ProductionsAssociees from './fragments/pages/ProductionsAssociees.js';
import ActivitesAssociees from './fragments/pages/ActivitesAssociees.js';
import ActuAssociees from './fragments/pages/ActuAssociees.js';
import MembresAssocies from './fragments/pages/MembresAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';

import RawHtml from './RawHtml';
//import './scss/page_objet.scss';


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
    startDate
    endDate
    type
    content {
      en
      fr
    }
    coverImage {
      url
      processed {
        medium
        large
      }
    }
    people {
      firstName
      lastName
      role {
        en
        fr
      }
      permalink {
        en
        fr
      }
      coverImage {
        url
      }
    }
    activities {
      id
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
    }
    attachments {
      type
    }
    active
    draft
    attachments {
      label
      value
      type
    }
  }
`;

export default function ActivityDetail({lang, activity}) {
  console.log(lang, activity);

  //Placeholder
  // activity.attachments = [{label: "Faux_files.xml", value: "Faux_files", type: 'XML',},{label: "Faux_files.pdf", value: "Faux_files", type: 'PDF',}];
  // activity.activities = [{name: "Fausse Activité", baseline: { fr: "Fausse baseline", en: "Fake Baseline"}, slugs: "fakeslug"}];
  // activity.people = [{firstName: "Bob", lastName: "Morane", slugs: "fakeslug"}];
  // console.log(activity);
  //activity.attachments = [{label: "Faux_files.pdf", value: "Faux_files", type: 'Fake',}];


  // related Elements
  const files = activity.attachments;
  const people = activity.people.map(p => {
    return <span key={p.id}>{p.firstName} {p.lastName}</span>;
  });


  return (
    <main id="main-objet">
      <Nav lang={lang} data={activity} order={['main', 'people', 'productions', 'activities', 'attachments']} />
      <p className="titre-sticky">{activity.name}</p>
      <article id="main">
        {/* Toggle Langue */}
        <ToggleLang lang={lang} content={activity.content} />
        {/* Chapô FR */}
        <hgroup className="fr" lang="fr">
          <h1>{activity.name}</h1>
          <h2 data-type="description"><RawHTML html={activity.description && activity.description.fr} /></h2>
          <DateNews startDate={activity.startDate} endDate={activity.endDate} lang={lang} />
          <TimeNews startDate={activity.startDate} endDate={activity.endDate} />
          <p className="type-objet">{activity.type}</p>
        </hgroup>
        {/* Article FR */}
        <div className="article-contenu fr" lang="fr">
          {activity.content && (activity.content.fr && <RawHtml html={activity.content.fr} />)}
        </div>

        {/* Chapô EN */}
        <hgroup className="en" lang="en">
          <h1>{activity.title && (activity.title.en)}</h1>
          <h2 data-type="description"><RawHTML html={activity.description && activity.description.en} /></h2>
          <p className="date">{activity.endDate}</p>
          <p className="type-objet">{activity.type}</p>
        </hgroup>
        {/* Article EN */}
        <div className="article-contenu en" lang="en">
          {activity.content && (activity.content.en && <RawHtml html={activity.content.en} />)}
        </div>

      </article>
      <MembresAssocies people={activity.people} related={SECTIONS.people} lang={lang} />
      <ProductionsAssociees productions={activity.productions} related={SECTIONS.productions} lang={lang} />
      <ActivitesAssociees activities={activity.activities} related={SECTIONS.activities} lang={lang} />
      <FichiersAssocies attachments={activity.attachments} related={SECTIONS.attachments} lang={lang} />
    </main>
  );
}
