import React from 'react';
/*import {graphql} from 'gatsby';*/
import {Link} from 'gatsby';

import FiltreEquipe from './fragments/FiltreEquipe.js';
import {IsModel} from '../helpers/helpers.js';


import Img from '../assets/images/sample/default-people.png';

export default function PeopleListing({lang, list}) {
  // console.log(lang, list);

  var randomList = list.sort(randomiser);

  function randomiser(a, b) {  
    return 0.5 - Math.random();
  }

  const peopleFragment = (p) => (
    <React.Fragment key={p.permalink.fr}>
      <li
        data-item={p.id} data-domain={p.domain}
        data-active={p.active ? 'yes' : 'no'} data-member={p.membership === 'member' ? 'yes' : 'no'}
        className={(p.active ? 'active' : 'past') + "-" + (p.membership === 'member' ? 'member' : 'associate') + "-" + p.domain}>

        <Link to={p.permalink[lang]}>
          <figure><img src={p.coverImage ? p.coverImage.url : Img} alt={lang === 'fr' ? 'Photo de profil de ' + p.firstName + p.lastName : p.firstName + p.lastName + ' profil picture'} /></figure>
          <div className="description">
            <hgroup>
              <h1 data-level-1="name">{p.firstName} {p.lastName}</h1>
              {p.status && (
                (p.status[lang] && p.status[lang] !== '' && <p className="status">{p.status[lang]}</p>) ||
                (p.status[lang === 'fr' ? 'en' : 'fr'] && p.status[lang === 'fr' ? 'en' : 'fr'] !== '' && <p className="status">{p.status[lang === 'fr' ? 'en' : 'fr']}</p>)
                )
              }
            </hgroup>
            <div className="details">
              <p className="role">{lang === 'fr' ? p.role && p.role.fr : p.role && p.role.en}</p>
              <p className="details-statut">{p.membership === 'member' ? 'Membre' : 'Associé'}</p>
              <p className="domaine">{IsModel(p.domain, lang)}</p>
            </div>
          </div>
        </Link>
      </li>
    </React.Fragment>)

	return (
  <>
  <main>
    <FiltreEquipe lang={lang} />
    <section className="main-filters" />
    <section id="liste_equipe" className="main-container">

      <ul className="liste_equipe" id="liste_equipe_active">
        {randomList.filter(p => p.active).map(p => peopleFragment(p))}
        <li data-type="" className="list-item hack-item-grid" />
      </ul>

      <input type="checkbox" id="display-people-past" name="display-people-past" value="display-people-past" hidden/>
      <label htmlFor="display-people-past">Afficher les anciens membres <span>〉</span></label>

      <ul className="liste_equipe" id="liste_equipe_past">
        {randomList.filter(p => !p.active).map(p => peopleFragment(p))}
        <li data-type="" className="list-item hack-item-grid" />
      </ul>
    </section>
  </main>
  </>

	);
}
