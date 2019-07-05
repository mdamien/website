import React from 'react';
import {Link} from 'gatsby';

import FilterNews from './fragments/FilterNews.js';
import DateNews from '../helpers/DateNews.js';
import TimeNews from '../helpers/TimeNews.js';
import ProcessedImage from '../helpers/ProcessedImage.js';
import {IsModel} from '../helpers/helpers.js';
import RawHTML from '../helpers/RawHtml.js';
import {format as formatDate, getYear, parseISO} from 'date-fns';

import LanguageFallback from '../helpers/LanguageFallback.js';

const byYear = ([yearA], [yearB]) => yearB - yearA;

export default function NewsListing({lang, list}) {
	// console.log(lang, list);
	const yearGroups = new Map();


	let accroche;

	if (lang === 'fr') {
		accroche = 'Description en une phrase de la catégorie actualité';
	}
	else {
		accroche = 'Description in english en une phrase de la catégorie actualité';
	}

	list.forEach(news => {
    const year = getYear(parseISO(news.startDate));
		if (Number.isNaN(year)) {
			return;
		}

		if (!yearGroups.has(year)) {
			yearGroups.set(year, []);
		}

		yearGroups.get(year).push(news);
  });
  let nbNews = 0;
  return (
    <>
    <main role="main" aria-describedby="aria-accroche">
      <FilterNews lang={lang} years={Array.from(yearGroups.keys()).sort(byYear)} />
      <section className="main-filters">
      </section>

      <section id="liste" className="main-container">

        <ul className="liste_objet" id="liste-news">
          {Array.from(yearGroups.entries()).sort(byYear).map(([year, yearNews], index) => (
            <React.Fragment key={index}>
              <li id={`year-${year}`} className="list-year">
                {/* <span>{year}</span> */}
              </li>
              {yearNews.map((news, i) => (
                <React.Fragment key={i}>
                  <li data-item={nbNews} data-type={news.type} className={`list-item ${news.type}`}>
                    <Link to={news.permalink[lang]}>

                    <div className="image-pre" aria-hidden="true">
                      <ProcessedImage size="medium" image={news.coverImage && news.coverImage.processed.medium} />
                    </div>
                    <div className="bandeau">
                      <p data-icon="news" className="type-news">{IsModel(news.type, lang)}</p>
                      <p className="label-news"><LanguageFallback lang={lang} translatedAttribute={news.label} /></p>
                      <div>
                        <DateNews startDate={news.startDate} endDate={news.endDate} lang={lang} />
                        <TimeNews startDate={news.startDate} endDate={news.endDate} />
                        </div>
                    </div>
                    <hgroup>
                      <h1 data-level-1="baseline" >
                        <LanguageFallback lang={lang} translatedAttribute={news.title} />
                      </h1>
                    </hgroup>
                    <div className="accroche">
                      <p className="accroche-paragraphe">
                        <LanguageFallback lang={lang} translatedAttribute={news.description} />
                      </p>
                    </div>

                    </Link>
                  </li>
                </React.Fragment>
            ))}
            </React.Fragment>
        ))}
        </ul>
      </section>
    </main>
    </>
	);
}
