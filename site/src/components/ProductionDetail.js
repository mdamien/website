import React from 'react';
import {graphql} from 'gatsby';

import PublicationsAssocies from './fragments/pages/PublicationsAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';
import Nav from './fragments/Nav.js';

import RawHtml from './RawHtml';
import './scss/page_objet.scss';

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
    activities {
      id
      name
    }
    people {
      id
      firstName
      lastName
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
    draft
    slugs
  }
`;

export default function ProductionDetail({lang, production}) {
  console.log(lang, production);

  return (
    <>
      <Nav />
      <main id="main-objet">
        <p class="titre-sticky">{production.name}</p>
        <article id="article-contenu">
          <hgroup>
            <h1>{production.baseline && (lang === "fr" ?  production.baseline.fr : production.baseline.en)}</h1>
            <h2>{production.baseline && (lang === "fr" ?  production.baseline.fr : production.baseline.en)}</h2>

            <p class="date">{production.endDate}</p>
            <p class="type-objet">{production.type}</p>

          </hgroup>

          <div class="article-contenu">
          {production.content && (lang === "fr" ? production.content.fr && <RawHtml html={production.content.fr} />  : production.content.en && <RawHtml html={production.content.en} />)}
          </div>
        </article>

        <div>
          {lang === "fr" ? "Personnes liées" + String.fromCharCode(8239) +":"  : "Related people:"}
          <ul>
            {(production.people || []).map(p => <li key={p.id}>{p.firstName} {p.lastName}</li>)}
          </ul>
        </div>
        <PublicationsAssocies publications={production.productions} lang={lang} />
        <FichiersAssocies />
      </main>
    </>
  );
}
