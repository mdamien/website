import React from 'react';
import {graphql} from 'gatsby';
import {Link} from 'gatsby';

import Highlights from './fragments/Highlights.js';
import Logo from '../assets/svg/logo_medialab.svg';
import { Icons } from '../helpers/Icons.js';


import ProductionsAssociees from './fragments/ProductionsAssociees.js';
import ActivitesAssociees from './fragments/ActivitesAssociees.js';
import ActuAssociees from './fragments/ActuAssociees.js';

import Nav from '../common/Nav.js';

import RawHtml from '../helpers/RawHtml';
import {templateMembership} from '../helpers/helpers.js';
//import './scss/page_personne.scss';

import Img from '../assets/images/sample/default-people.png';

export const queryFragment = graphql`
  fragment PeopleDetail on PeopleJson {
    firstName
    lastName
    role {
      en
      fr
    }
    bio {
      fr
      en
    }
    coverImage {
      url
      processed {
        small

      }
    }
    membership
    active
    draft
    lastUpdated
    domain
    role {
      en
      fr
    }
    contacts {
      type
      label
      value
    }
    status {
      en
      fr
    }
    mainProductions {
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
      type
      authors
      coverImage {
        url
        processed {
          small
          medium
        }
      }
      groupLabel {
        en
        fr
      }
      typeLabel {
        en
        fr
      }
    }
    mainActivities {
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
      startDate
      endDate
      name
      type
      coverImage {
        url
        processed {
          small
          medium
        }
      }
    }
    activities {
      name
      baseline {
        en
        fr
      }
      description {
        en
        fr
      }
      permalink {
        en
        fr
      }
      startDate
      endDate
      type
    }
    news {
      title {
        en
        fr
      }
      type
      description {
        en
        fr
      }
      permalink {
        en
        fr
      }
      startDate
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
  }
`;

export default function PeopleDetail({lang, person}) {
  // console.log(lang, person);

  const productions = person.mainProductions; // Sync mainProd
  const activities = person.mainActivities; // Sync mainActivities

  let domaine, titleLInkTeam, backTop, toggleNav;

  if (person.domain === 'tech' ) {
    if (lang === 'fr') {
      domaine = 'Technique';
    } else {
      domaine = 'Technical';
    }
  }
  if (person.domain === 'admin' ) {
    if (lang === 'fr') {
      domaine = 'Administratif';
    } else {
      domaine = 'Administration';
    }
  }
  if (person.domain === 'academic' ) {
    if (lang === 'fr') {
      domaine = 'Académique';
    } else {
      domaine = 'Academic';
    }
  }
  if (person.domain === 'Design' ) {
    domaine = "Design";
  }
  if (person.domain === 'pedagogy' ) {
    if (lang === 'fr') {
      domaine = 'Pédagogie';
    } else {
      domaine = 'Pedagogy';
    }
  }
  else {
    domaine = 'Domaine';
  }

  if (lang === 'fr') {
    titleLInkTeam = 'Aller à la page de l‘équipe du Médialab';
    backTop = 'Aller en haut de la page';
    toggleNav = 'Afficher ou masquer la navigation dans l‘article';
  } else {
    titleLInkTeam = 'Go to the medialab team page';
    backTop = 'Go to the top of page';
    toggleNav = 'Show or hide the navigation in the article';
  }


  

  return (
    <>

      <main id="main" role="main" aria-label={lang === "fr" ? "Présentation de" + person.firstName + person.lastName : person.firstName + person.lastName + "'s presentation" }>

      <input type="checkbox" id="toggle-nav" name="toggle-nav" value="toggle-nav" hidden />
      <label htmlFor="toggle-nav" title={toggleNav} arial-label={toggleNav}><span><Icons icon='arrow' /></span></label>

        <Nav lang={lang} data={person} order={['main', 'highlights', 'activities', 'productions', 'news']} />

        <header id="titre-sticky" aria-hidden="true">
          <div id="container-titre-sticky">
            <div id="logo-sticky"><a href="/"><Logo /></a></div>
            <p>
            <Link to="/people" className="link-page-team" title={titleLInkTeam}>
              <span>{lang === 'fr' ? "L'équipe du Medialab" : 'Medialab team'} </span>
            </Link>
            <span className="personne"><a href="#topbar" title={backTop}>{person.firstName} {person.lastName}</a></span>
          </p>
        </div>
        </header>

        <div className="main-container">

          <article id="biographie">
            <div id="container-biographie">
              <header>
                <figure>
                  <img src={person.coverImage ? person.coverImage.url : Img} alt={lang === 'fr' ? 'Photo de profil de ' + person.firstName + person.lastName : person.firstName + person.lastName + ' profil picture'} />
                </figure>
                <hgroup>
                  <h1 data-level-1="name" data-type="name">{person.firstName} {person.lastName}</h1>
                 {person.status && 
                   <p className="status" data-type="status" aria-label={lang === "fr" ? "Occupation actuelle " : "Present activitiies" }>
                      { lang === "fr" ? person.status.fr : person.status.en}
                    </p>
                  }
                </hgroup>
                <div className="bandeau">
                <p className="role" data-type="role" aria-label={lang === "fr" ? "Rôle au sein de l'equipe" : "Role within the team " }>{person.role[lang]}</p>
                    {/* <p data-type="domaine">{lang === "fr" ? "Domaine" + String.fromCharCode(8239) +":" : "Domain:"} {person.domain}</p> */}
                    <p data-type="membership" aria-label={lang === "fr" ? "Nature de la relation au Medialab" : "Nature of the relationship within Medialab"}>{templateMembership(person)}</p>
                </div>

                { person.contacts && person.contacts.length > 0 &&
                  <div className="contact">
                    <ul>
                    { person.contacts.map((contact, i) => (
                      <li key={i} data-type={contact.label}>
                        {contact.type === 'url' && contact.label !== 'CV' ?
                          <span><span className="label-contact">{contact.label}:</span> <a href={contact.value} target="_blank" rel="noopener" aria-label={lang === "fr" ? "Ouvrir cette page " + contact.value : "Open this " + contact.value +" page"}>{contact.value}</a></span> :
                            ( contact.label === 'Mail' ?
                              <p data-domain="@sciencepo.fr">{contact.label}: NEED_SUBSTRING</p> :
                                <a href={contact.value}>{contact.label}</a> ) }
                      </li>
                    ))}
                    </ul>
                  </div>}
              </header>

              <div className="biographie-content" aria-label={lang === "fr" ? "Biographie" : "Biography" } >
                {person.bio && person.bio[lang] ? <RawHtml html={person.bio[lang]} /> : null}
              </div>
            </div>


            <Highlights people={person} lang={lang} />
          </article>


          <aside id="all-aside">
            <ActivitesAssociees activities={person.activities} lang={lang} />
            <ProductionsAssociees productions={person.productions} lang={lang} />
            <ActuAssociees actu={person.news} lang={lang} />
          </aside>

        </div>





      </main>
    </>
  );
}
