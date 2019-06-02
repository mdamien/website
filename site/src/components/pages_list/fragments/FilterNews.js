import React from 'react';
/*import {graphql} from 'gatsby';*/ 
//import {Link} from 'gatsby';
import { Icons } from '../../helpers/Icons.js';
import { SearchInput } from '../../helpers/SearchInput.js';


const MAX_NB_FILTER_ITEMS = 12;

const FilterNews = ({lang, years}) => {

  let title, yearTitle, filters, event, post, notice, typeNews, filtersAlt, filtresTitle, closeAlt;
  years = years.sort().reverse();
  if (lang === 'fr') {
    title = 'Actualités';
    yearTitle = 'Aller à l\'année…';
    filters = 'Filtres';
    typeNews = "Type d'actualités";
    event = 'Rendez-vous';
    post = 'Chroniques';
    notice = 'Annonces';
    filtersAlt = 'Afficher les filtres de la page';
    filtresTitle = "Filtres des actualités";
    closeAlt = "Revenir aux actualités";
  }
  else {
    title = 'News';
    yearTitle = 'Go to year…';
    filters = 'Filters';
    typeNews = "News‘ type";    
    event = 'Events';
    post = 'Posts';
    notice = 'Notices';
    filtersAlt = 'Show page filters';
    filtresTitle = "Filters of news";
    closeAlt = "Back to news";
  }
  let suppYears = false;

  if (years.length > MAX_NB_FILTER_ITEMS) {
    suppYears = years[MAX_NB_FILTER_ITEMS - 1];
    years = years.slice(0, MAX_NB_FILTER_ITEMS - 1);
  }

  return (
    <>
      <h1 className="type_title" data-icon="actualite"><a href="#year-2019">{title}</a></h1>

      <input type="radio" id="radio-phone-filters" name="radio-phone" value="filters" hidden />
      <label htmlFor="radio-phone-filters" title={filtersAlt} arial-label={filtersAlt}><Icons icon='search-filter' /></label>

      <input type="radio" id="radio-phone-close" name="radio-phone" value="close" hidden />
      <label htmlFor="radio-phone-close" title={closeAlt} arial-label={closeAlt}>✕</label>
      



      <input type="checkbox" id="filtre-actu_event" name="filtre-actu_event" className="input_filtre-actu" value="event" hidden />
      <input type="checkbox" id="filtre-actu_post" name="filtre-actu_post" className="input_filtre-actu" value="post" hidden />
      <input type="checkbox" id="filtre-actu_notice" name="filtre-actu_notice" className="input_filtre-actu" value="notice" hidden />
    
      <aside className="aside-filters">

        <h1 class="aside-title">{filtresTitle}</h1>

        <SearchInput lang={lang}/>


        <div className="go-to-year">
        <input type="checkbox" id="checkbox_filtre_year" name="radio_filtre-actu" value="year" hidden />
        <label htmlFor="checkbox_filtre_year"><span>〉</span></label>
          <p>{ yearTitle } <span className="current-year">{years[0]}</span></p>          
          <ul>
            {years.map(y => (
              <li key={`year-${y}`} ><a href={`#year-${y}`}>{y}</a></li>
            ))}
            { suppYears &&
              <li key={`filter-years-before-${suppYears}`}><a href={`#year-${suppYears}`} >&le; {suppYears}</a></li>
            }
          </ul>
        </div>  

        <div className="filter-group">
          <h1>Filtrer par type </h1>
          <label id="filtre-actu_event_label" className="filtre-actu checkbox-medialab"  htmlFor="filtre-actu_event">{event}</label>
          <label id="filtre-actu_post_label" className="filtre-actu checkbox-medialab"  htmlFor="filtre-actu_post">{post}</label>
          <label id="filtre-actu_notice_label" className="filtre-actu checkbox-medialab"  htmlFor="filtre-actu_notice">{notice}</label>
        </div>

      </aside>

    </>
  );
};

export default FilterNews;

