import React from 'react';
import {Link} from 'gatsby';


const ActivitesAssociees = ({lang, related, activities}) => {

  // Si aucune activitée liée, retourne null
  if (!activities || activities.length === 0)
    return null;

  let accroche;
  if (lang === 'fr') {
    accroche = related.fr + String.fromCharCode(8239) + ':';
  }
  else {
    accroche = related.en + ':';
  }

  // Placeholder
  return (
    <aside className="container elements-associes-block" id="activities">
      <h1><span data-icon="activite" /> {accroche} </h1>

      <div className="contenu">
        <ul className="liste_objet">
          {activities.map(a => (
            <li key={a.permalink.fr} data-type="activite" className="item">
              <Link to={a.permalink[lang]} className="accroche">
                <h1 data-level-2="baseline">{a.baseline && (a.baseline[lang] || a.baseline.fr || a.baseline.en)}</h1>
                <h2 data-level-2="name">{a.name}</h2>
                <p className="period">[{a.startDate} - {a.endDate}]</p>
                <p className="type">{a.type}</p>
              </Link>
              <a href="" className="complement">
                <h2 data-level-="description"><span>[{a.startDate} - {a.endDate}]</span>{a.description && (a.description[lang] || a.description.fr || a.description.en)}</h2>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ActivitesAssociees;
