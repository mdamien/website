import React from 'react';
import {graphql} from 'gatsby';
import RawHtml from './RawHtml.js';

import Nav from './fragments/Nav.js';
import ToggleLang from './fragments/pages/ToggleLang.js';
//import {PlaceHolder} from './helpers.js';
//import './scss/page_objet.scss';
import DateNews from './fragments/DateNews.js';
import TimeNews from './fragments/TimeNews.js';
import {format as formatDate, getYear, parseISO} from 'date-fns';
import {IsModel} from './helpers.js';

import ProductionsAssociees from './fragments/pages/ProductionsAssociees.js';
import ActivitesAssociees from './fragments/pages/ActivitesAssociees.js';
import ActuAssociees from './fragments/pages/ActuAssociees.js';
import MembresAssocies from './fragments/pages/MembresAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';

export const queryFragment = graphql`
  fragment NewsDetail on NewsJson {
    title {
      en
      fr
    }
    description {
      en
      fr
    }
    label {
      en
      fr
    }
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
    draft
    activities {
      id
      description {
        en
        fr
      }
      permalink {
        en
        fr
      }
      name
      type
    }
    productions {
      title {
        en
        fr
      }
      authors
      groupLabel {
        en
        fr
      }
      permalink {
        en
        fr
      }
      description {
        en
        fr
      }
    }
    attachments {
      label
      value
      type
    }
    type
    startDate
    endDate
    place
  }
`;

const relatedElements = [
  {
    id: 'main-objet',
    en: 'Main article',
    fr: 'Article principal',
  },
  {
    id: 'membres-associes',
    exist: ({people}) => Boolean(people) && people.length > 0,
    en: 'Related people',
    fr: 'Membres en lien'
  },
  {
    id: 'productions-associes',
    exist: ({productions}) => Boolean(productions) && productions.length > 0,
    en: 'Related poduction',
    fr: 'Production en liens'
  },
  {
    id: 'activites-associees',
    exist: ({activities}) => Boolean(activities) && activities.length > 0,
    en: 'Related Activities',
    fr: 'Activités en lien',
  },
  {
    id: 'actu-associees',
    exist: ({news}) => Boolean(news) && news.length > 0,
    en: 'Related news',
    fr: 'Actualités associés'
  }, {
    id: 'fichiers-associes',
    exist: ({attachments}) => Boolean(attachments) && attachments.length > 0,
    en: 'Related files',
    fr: 'Fichier associés'
  },
];

export default function NewsDetail({lang, news}) {
  console.log(news);

  /*let type;

  if (news.type === 'event' ) {
      type = [
        fr = 'Evenement',
        en = 'Event'
      ]
  }
  if (news.type === 'post' ) {
      type = [
        fr = 'Publication',
        en = 'Post'
      ]
  }
  if (news.type === 'notice' ) {
      type = [
        fr = 'Annonce',
        en = 'Notice'
        ]
  }
  else {
      type = [
        fr = 'OK',
        en = ''
      ]
  }*/


  return (
    <>
      <Nav lang={lang} object={news} related={relatedElements} />
      <main id="main-objet">
        <p className="titre-sticky">{news.title && (lang === 'fr' ? news.title.fr : news.title.en) }</p>
        <article id="article-contenu">
          {/* Toggle Langue */}
          <ToggleLang lang={lang} content={news.content} />
          {/* Chapô FR */}
          <hgroup className="fr" lang="fr">
            <h1 data-type="title">{news.title && (news.title.fr)}</h1>
            <h2 data-type="description"><RawHtml html={news.description && (news.description.fr)} /></h2>
            {news.type && <p className="type-objet">{IsModel(news.type, "fr")}</p> }
            <div className="time">
              <DateNews startDate={news.startDate} endDate={news.endDate} lang={lang} />
              <TimeNews startDate={news.startDate} endDate={news.endDate} />
            </div>
          </hgroup>
          {/* Article FR */}
          <div className="article-contenu fr" lang="fr">
            {news.content && (news.content.fr && <RawHtml html={news.content.fr} />)}
          </div>

          {/* Chapô EN */}
          <hgroup className="en" lang="en">
            <h1>{news.title && (news.title.en)}</h1>
            <h2 data-type="description"><RawHtml html={news.description && (news.description.en)} /></h2>

            <p className="date">{news.endDate}</p>
            <p className="type-objet">{IsModel(news.type, "en")}</p>
          </hgroup>
          {/* Article EN */}
          <div className="article-contenu en" lang="en">
            {news.content && (news.content.en && <RawHtml html={news.content.en} />)}
          </div>

        </article>

        {/* Block Associes */}
        <MembresAssocies people={news.people} related={relatedElements[1]} lang={lang} />
        <ProductionsAssociees productions={news.productions} related={relatedElements[2]} lang={lang} />
        <ActivitesAssociees activities={news.activities} related={relatedElements[3]} lang={lang} />
        <FichiersAssocies attachments={news.attachments} related={relatedElements[5]} lang={lang} />
      </main>
    </>
  );
}
