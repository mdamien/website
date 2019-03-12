import React from 'react';
import {Link} from 'gatsby';


const ActivitesAssociees = ({ lang, related, activities }) => {

  // Si aucune activitée liée, retourne null
  if (!activities || activities.length === 0)
    return null;

  let accroche;
  if (lang === "fr") {
      accroche =  related.fr + String.fromCharCode(8239) +":";
  } else {
      accroche = related.en + ":";
  }

  return (
    <aside className="container elements-associes-block" id="activites-associees">
      <h1><span data-icon="activite"></span> {accroche} </h1>

      <div className="contenu">
        <ul className="liste_objet">
          {activities.map(a => (
            <li key={a.id} data-type="activite" className="item">
              <Link to={a.permalink[lang]}>
                <h1 data-level-="baseline">{lang === 'fr' ? a.baseline.fr : a.baseline.en}</h1>
                <h2 data-level-="name">{lang === 'fr' ? a.name : a.name}</h2>
                <p className="type">{a.type}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default ActivitesAssociees;
