import React from 'react';
import {graphql} from 'gatsby';
import {Link} from 'gatsby';

import PublicationsAssocies from './fragments/pages/PublicationsAssocies.js';
import FichiersAssocies from './fragments/pages/FichiersAssocies.js';
import Nav from './fragments/Nav.js';

import RawHtml from './RawHtml';
import {templateMembership} from './helpers.js';
import './scss/page_personne.scss';

import Img from './assets/images/sample/D-Cardon-bis.jpg';

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
    membership
    active
    draft
    lastUpdated
    domain
    role{
      en
      fr
    }
    contacts{
      label
      value
    }
    status {
      en
      fr
    }
  }
`;

/*let translated.body = null

if (lang === 'en') {
  translated.body = <span>Medialab's team</span>
} else {
  translated.body =
}*/

export default function PeopleDetail({lang, person}) {
  console.log(lang, person);

  const bio = person.bio;

  return (
    <>
      <Nav />
      <main id="main-personne">
        <p className="titre-sticky">
          <Link to="/people">
            <span>{lang === "fr" ? "L'équipe du Medialab" : "Medialab team"} </span>
          </Link>
          <span className="personne">{person.lastname} {person.firstName}</span>
        </p>
        <article id="biographie">
          <figure><img src={Img}  alt="caption"/></figure>
          <header>
            <h1 data-level-1="name" data-type="name">{person.lastName} {person.firstName}</h1>
            <h2 data-level-2="role" data-type="role">{lang === "fr" ? person.role.fr : person.role.en}</h2>
            <p data-type="domaine">{lang === "fr" ? "Domaine" + String.fromCharCode(8239) +":" : "Domain:"} {person.domain}</p>
            <p data-type="statut">{templateMembership(person)}</p>
            <p data-type="activite">{person.status && (lang === "fr" ? person.status.fr : person.status.en)}</p>
            <ul className="contact">
              ${person.contacts.map(contact => <li data-type={contact.label}>
                <Link to={contact.value}>{contact.label}</Link>
                </li>)}
              {/*<li data-type="email"><Link to="/">Mail</Link></li>
              <li data-type="Twitter"><Link to="/">Twitter</Link></li>
              <li data-type="Git"><Link to="/">Git</Link></li>*/}
            </ul>
          </header>
          <div className="biographie-contenu">
            {person.bio && (lang === "fr" ? person.bio.fr && <RawHtml html={bio.fr} />  : person.bio.en && <RawHtml html={bio.en} />)}          
            {/*bio && bio.fr && <RawHtml html={bio.fr} />*/}
          </div>
        </article>
        <PublicationsAssocies person={person} />
        <FichiersAssocies />
      </main>
    </>

  );
}
