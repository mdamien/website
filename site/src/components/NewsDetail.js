import React from 'react';
import {graphql} from 'gatsby';

import PublicationsAssocies from './fragments/pages/PublicationsAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';
import Nav from './fragments/Nav.js';
import ToggleLang from './fragments/pages/ToggleLang.js';
import {PlaceHolder} from './helpers.js';

import RawHtml from './RawHtml';
//import './scss/page_objet.scss';

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
    people {
      id
      firstName
      lastName
    }
    draft
    slugs
    activities {
      id
      description {
        en
        fr
      }
      slugs
      name
      type
    }
    productions {
      id
      description {
        en
        fr
      }
      slugs
      title {
        en
        fr
      }
      type
    }
  }
`;

  const relatedElements = [
    {
      id: 'main-objet',
      en: 'Main article',
      fr: 'Article principal',
    },
    {
      id: 'productions-associes',
      exist : ({productions}) => Boolean(productions),
      en: 'Related poduction',
      fr: 'Production en liens'
    },
    {
      id: 'activites-associees',
      exist : ({activities}) => Boolean(activities),
      en: 'Related Activities',
      fr: 'Activités en lien',
    },
    {
      id: 'fichiers-associes',
      exist : ({files}) => Boolean(files),
      en: 'Related files',
      fr: 'Fichier associés'
    },
    {
      id: 'membres-associes',
      exist : ({people}) => Boolean(people),
      en: 'Related people',
      fr: 'Membres en lien'
    },
  ];



export default function NewsDetail({lang, news}) {
  console.log(lang, news);

  // Place Holder attachements
  PlaceHolder(news);

  return (
    <>
      <Nav lang={lang} object={news} related={relatedElements} />
      <main id="main-objet">
        <p className="titre-sticky">{news.title && (lang === "fr" ? news.title.fr : news.title.en ) }</p>
        <article id="article-contenu">
          {/* Toggle Langue */}
          <ToggleLang lang={lang} content={news.content} />
          {/* Chapô FR */}
          <hgroup className="fr" lang="fr">
            <h1>{news.title && (news.title.fr)}</h1>
            <h2>{news.description && (news.description.fr)}</h2>
            <p className="date">{news.endDate}</p>
            <p className="type-objet">{news.type}</p>
          </hgroup>
          {/* Article FR */}
          <div className="article-contenu fr" lang="fr">
            {news.content && ( news.content.fr && <RawHtml html={news.content.fr} /> )}
          </div>

          {/* Chapô EN */}
          <hgroup className="en" lang="en">
            <h1>{news.title && (news.title.en)}</h1>
            <h2>{news.description && (news.description.en)}</h2>
            <p className="date">{news.endDate}</p>
            <p className="type-objet">{news.type}</p>
          </hgroup>
          {/* Article EN */}
          <div className="article-contenu en" lang="en">
            {news.content && ( news.content.en && <RawHtml html={news.content.en} /> )}
          </div>

        </article>

        <div>
          {lang === "fr" ? "Personnes liées" + String.fromCharCode(8239) +":"  : "Related people:"}
          <ul>
            {(news.people || []).map(p => <li key={p.id}>{p.firstName} {p.lastName}</li>)}
          </ul>
        </div>
        <PublicationsAssocies publications={news.productions} lang={lang} />
        <FichiersAssocies lang={lang} fichier={news.attachement} />
      </main>
    </>
  );
}
