import React from 'react';
import {graphql} from 'gatsby';
import RawHtml from './RawHtml.js';

import Nav from './fragments/Nav.js';
import ToggleLang from './fragments/pages/ToggleLang.js';
import {IsModel} from './helpers.js';


import Highlight from './fragments/pageEquipe/Highlight.js';
import ProductionsAssociees from './fragments/pages/ProductionsAssociees.js';
import ActivitesAssociees from './fragments/pages/ActivitesAssociees.js';
import ActuAssociees from './fragments/pages/ActuAssociees.js';
import MembresAssocies from './fragments/pages/MembresAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';
//import './scss/page_objet.scss';

export const queryFragment = graphql`
  fragment ProductionDetail on ProductionsJson {
    title {
      en
      fr
    }
    type
    description {
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
    draft
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
    exist: ({people}) => Boolean(people),
    en: 'Related people',
    fr: 'Membres en lien'
  },
  {
    id: 'productions-associes',
    exist: ({productions}) => Boolean(productions),
    en: 'Related poduction',
    fr: 'Production en liens'
  },
  {
    id: 'activites-associees',
    exist: ({activities}) => Boolean(activities),
    en: 'Related Activities',
    fr: 'Activités en lien',
  },
  {
    id: 'actu-associees',
    exist: ({news}) => Boolean(news),
    en: 'Related news',
    fr: 'Actualités associés'
  }, {
    id: 'fichiers-associes',
    exist: ({files}) => Boolean(files),
    en: 'Related files',
    fr: 'Fichier associés'
  },
];

export default function ProductionDetail({lang, production}) {
  console.log(production);
  return (
    <>
      <Nav lang={lang} object={production} related={relatedElements} />
      <main id="main-objet">
        <p className="titre-sticky">{production.title && (lang === 'fr' ? production.title.fr : production.title.en) }</p>
        <article id="article-contenu">
          {/* Toggle Langue */}
          <ToggleLang lang={lang} content={production.content} />
          {/* Chapô FR */}
          <hgroup className="fr" lang="fr">
            <h1>{production.title && (production.title.fr)}</h1>
            <h2 data-type="description"><RawHtml html={production.description && (production.description.fr)} /></h2>
            <p className="type-objet">{IsModel(production.type, "fr")}</p>
            <div className="time">
              <DateNews startDate={production.startDate} endDate={production.endDate} lang={lang} />
              <TimeNews startDate={production.startDate} endDate={production.endDate} />
            </div>            
          </hgroup>
          {/* Article FR */}
          <div className="article-contenu fr" lang="fr">
            {production.content && (production.content.fr && <RawHtml html={production.content.fr} />)}
          </div>

          {/* Chapô EN */}
          <hgroup className="en" lang="en">
            <h1>{production.title && (production.title.en)}</h1>
            <h2 data-type="description"><RawHtml html={production.description && (production.description.en)} /></h2>
            <p className="date">{production.endDate}</p>
            <p className="type-objet">{IsModel(production.type, "fr")}</p>
          </hgroup>
          {/* Article EN */}
          <div className="article-contenu en" lang="en">
            {production.content && (production.content.en && <RawHtml html={production.content.en} />)}
          </div>

        </article>

        <MembresAssocies people={production.people} related={relatedElements[1]} lang={lang} />
        <ProductionsAssociees productions={production.productions} related={relatedElements[2]} lang={lang} />
        <ActivitesAssociees activities={production.activities} related={relatedElements[3]} lang={lang} />
        <ActuAssociees actu={production.news} related={relatedElements[4]} lang={lang} />
        <FichiersAssocies attachments={production.attachments} related={relatedElements[5]} lang={lang} />
      </main>
    </>
  );
}
