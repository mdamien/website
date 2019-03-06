import React from 'react';
import {Link} from 'gatsby';

import FilterProduction from './fragments/pageListe/FilterProduction.js';
import RawHTML from './RawHtml.js';
import {format as formatDate, getYear, parseISO} from 'date-fns'
import {en, fr} from 'date-fns/locale'

/* import {templateMembership} from './helpers.js';  */
//import './scss/page_liste.scss';

const byYear = ([yearA], [yearB]) => yearB - yearA;

export default function ProductionListing({lang, list, group, types}) {
    const yearGroups = new Map();
    
    let accroche

    if (lang === 'fr') {
      accroche = "Issues des dynamiques de recherche du laboratoire combinant méthode, analyse et théorie, les productions du médialab constituent un panorama hétéroclite. Aux traditionnelles publications académiques s’ajoute un ensemble de réalisations techniques qui répondent à des problèmes de recherche récurrents. Récemment, les sites web et réalisations en situation se sont développés comme de nouvelles formes pour rendre compte des activités du laboratoire.";
    }
    else {
      accroche = "Description in english en une phrase de la catégorie production";
    }


    list.forEach(production => {
      const year = getYear(parseISO(production.date));
      if (Number.isNaN(year)) {
        return;
      }

      if (!yearGroups.has(year)) {
        yearGroups.set(year, []);
      }

      yearGroups.get(year).push(production);
    });
    let nbItem = 0;
    return (
      <>
        <FilterProduction lang={lang} />
        <section id="liste">
          <p className="accroche-titre-phone">{accroche}</p>
          <ul className="liste_objet" id="liste-productions">
            {/*-- en fonction du lien de page, doit renvoyer différentes listes: 
            si le lien de page = /productions, renvoie toutes les productions
            si lien de page = productions/publications, renvoie uniquement les p.groupLabel = publications
            si lien de page = productions/editionsweb, renvoie uniquement les p.groupLabel = editionsweb
            si lien de page = productions/tools, renvoie uniquement les p.groupLabel = tools
            si lien de page = productions/situations, renvoie uniquement les p.groupLabel = situations
            si lien de page = productions/media, renvoie uniquement les p.groupLabel = media */
            Array.from(yearGroups.entries()).sort(byYear).map(([year, yearList]) => (
              <>
                <li id={year === 2008 ? 'years-before-2009' : `year-${year}`} className="list-year">
                  <span>{year}</span>
                  <pre>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░</pre>
                </li>

                {yearList.map((p) => (
                  <>
                    <li data-item={nbItem} data-type={p.type} className={`list-item ${p.type}`}>
                      <Link to={`/productions/${p.slugs[p.slugs.length - 1]}`}>
                        <h1 data-level-1="title">{lang === 'fr' ? p.title.fr : p.title.en}</h1>
                        {p.authors && <h2 data-level-2="authors"><span>{p.authors}</span></h2>}
                        {p.date && <p className="date">{p.date}</p>}
                        {/* {p.date && <p className="date">{formatDate(p.date, 'dd MMMM yyyy', {locale: lang === "fr" ? fr : en})}</p>} */}
                        <p className="type">
                          {lang === 'fr' ? p.groupLabel.fr : p.groupLabel.en} - {lang === 'fr' ? p.typeLabel.fr : p.typeLabel.en}
                        </p>
                        <p className="go-to-object"><span>〉</span></p>
                      </Link>
                    </li>
                    <li className="item_accroche description" data-item-accroche={nbItem++}>
                      <Link to={`/productions/${p.slugs[p.slugs.length - 1]}`}>
                        <RawHTML html={lang === 'fr' ? p.description.fr : p.description.en} />
                      </Link>
                    </li>
                  </>
                ))}
              </>
            ))}
            <li className="item_accroche accroche-titre">Description en une phrase de la catégorie Production</li>
          </ul>
        </section>
      </>
   );
}
