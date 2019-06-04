import React from 'react';
import {Link} from 'gatsby';
import DateNews from '../../../helpers/DateNews.js';
import TimeNews from '../../../helpers/TimeNews.js';
import {format as formatDate, getYear, parseISO} from 'date-fns';
import { Icons } from '../../../helpers/Icons.js';

export default function Agenda({rdv, lang}) {




	return (
  <>
    <section id="agenda" /* style={nbRdv} */>
    <>
    <h1>{ lang === "fr" ? "Rendez-vous" : "Meeting"}</h1>
    <input type="checkbox" name="checkbox_flux" id="checkbox_agenda" hidden />
    <label className="responsive-flux" htmlFor="checkbox_agenda">
      <span><Icons icon='arrow' /></span>
    </label> 
      <div id="agenda-content">

        {rdv.map((event, i) =>
          (<React.Fragment key={i}>

            <article>
            <Link to={event.permalink[lang]}>

              <aside className="divers">
                <p className="label" data-icon="news">{ event.label && (lang === 'fr' ? event.label.fr : event.label.en) }</p>
                <DateNews startDate={event.startDate} endDate={event.endDate} lang={lang} />
                {event.isInternal && <p className="internal" aria-label="evenement interne au medialab" title={lang === 'fr' ? "Cet évenement est organisé par le Medialab" : "The event is hosted by Medialab"} >⌂</p>}
              </aside>


              <h1 data-level-1="title">{lang === 'fr' ? event.title.fr : event.title.en }</h1>

              <aside className="details">
                <TimeNews startDate={event.startDate} endDate={event.endDate} />
                { event.place && <p className="place">{event.place}</p> }
              </aside>

            </Link>
            </article>

          </React.Fragment>)
				)}
      </div>
    </>
    </section>
  </>
  	);
}
