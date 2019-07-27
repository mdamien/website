import React from 'react';
import {Link} from 'gatsby';

import ProcessedImage from '../../helpers/ProcessedImage.js';
import {IsModel, ellipse} from '../../helpers/helpers.js';
import DateNews from '../../helpers/DateNews.js';
import TimeNews from '../../helpers/TimeNews.js';

// Ici nous composons l'ensemble du caroussel
const Slideshow = ({slider, lang}) => {

const otherLang = lang === 'fr' ? 'en' : 'fr';

  let slides = slider;
  // limiting number of slide to 5 maximum
  if (slider.length > 5)
    slides = slider.slice(0, 5);


	return (
  <section className="slideshow" id="slideshow" data-nbr-item={slides.length}>
    <div className="slideshow-container">
      {/* Bullet by default*/}
      <input
        type="radio" name="slide-bullet" id="slide-bullet-0"
        className="slideshow-bullet" hidden defaultChecked={slider.length > 1} />
      <label className="" htmlFor="slide-bullet-0" aria-hidden="true" />
      {slides.length > 1 && slides.map((slide, index) =>
        (<React.Fragment key={index}>
          <input
            type="radio" name="slide-bullet" id={`slide-bullet-${index + 1}`}
            className="slideshow-bullet" hidden />
        </React.Fragment>)
        )}

      <div className="slideshow-inner">
        {slides.map((slide, index) =>
          (<React.Fragment key={index}>
            {/* Content */}
            <div className="slideshow-item" data-item={ index + 1 } aria-label={lang === "fr" ? "Pages misent en avant" : "Spotlighted pages" }>
              <article data-type={slide.model}>
                <Link to={slide.data.permalink[lang]}>
                  <div className="image-pre" aria-hidden="true">
                    <ProcessedImage size="large" image={slide.data.coverImage && slide.data.coverImage.processed.large} data={slide.data}/>
                  </div>
                  <div className="image-pre-phone" aria-hidden="true">
                    <ProcessedImage size="medium" image={slide.data.coverImage && slide.data.coverImage.processed.medium} data={slide.data}/>
                  </div>
                </Link>
                <div className="contenu-slide" aria-label={lang === "fr" ? "Contenu" : "Content" }>
                  <Link to={slide.data.permalink[lang]}>

                    {/* if Activité */}
                    {slide.model === 'activities' && (
                      <>
                        <aside className="bandeau">
                          <p data-icon="activities" className="type">{IsModel(slide.model, lang)}</p>
                          <p className="title">{slide.data.name}</p>
                        </aside>
                        <h1 data-level-1="baseline" >{ellipse(slide.data.baseline[lang] || slide.data.baseline[otherLang], 65)}</h1>
                        <p className="accroche">
                          {slide.data.description && ellipse(slide.data.description[lang] || slide.data.description[otherLang], 160)}
                        </p>
                      </>
                    )}

                    {/* if Productions */}
                    {slide.model === 'productions' && (
                      <>
                        <aside className="bandeau">
                          <p data-icon="productions" className="type">{IsModel(slide.model, lang)}</p>
                          <p className="subtype-production"><span>{slide.data.typeLabel[lang]}</span></p>
                          <p className="date-production">{slide.data.date}</p>
                        </aside>
                        <h1 data-level-1="title">{ellipse(slide.data.title[lang] || slide.data.title[otherLang], 90)}</h1>
                        <h2 data-level-1="authors" className="authors">{ellipse(slide.data.authors, 110)}</h2>
                      </>
                    )}

                    {/* if News */}
                    {slide.model === 'news' && (
                      <>
                        <div className="bandeau">
                          <p data-icon="news" className="type">{IsModel(slide.model, lang)}</p>
                          {<p className="label-news"><span>{slide.data.label ? slide.data.label[lang] || slide.data.label[otherLang] : slide.data.typeLabel[lang] || slide.data.typeLabel[otherLang]}</span></p>}
                        </div>
                        <div className="date">
                          <DateNews startDate={slide.data.startDate} endDate={slide.data.endDate} lang={lang} />
                          <TimeNews startDate={slide.data.startDate} endDate={slide.data.endDate} />
                        </div>
                        <h1 data-level-1="baseline" >{ellipse(slide.data.title[lang] || slide.data.title[otherLang], 49)}</h1>

                        <p className="accroche">
                          {ellipse(slide.data.description[lang] || slide.data.description[otherLang], 170)}
                        </p>
                      </>
                    )}

                    {/* Default */}
                    <p className="more" aria-label={lang === "fr" ? "Ouvrir ce lien" : "Open this link" }>En savoir plus</p>
                  </Link>
                </div>
              </article>
            </div>
          </React.Fragment>)
        )}
      </div>

      {/* bullet pour controler le caroussel*/}
      <nav className="bullets-slide">
        { slides.length > 1 && slides.map((slide, index) => {
            return <label key={index + 1} className="slideshow-bullet-label" data-slide={index + 1} htmlFor={`slide-bullet-${index + 1}`} aria-label={`slide ${index + 1}`} />
          })}
      </nav>

      {/* label pour controler le caroussel*/}
      {slides.length > 1 && <nav className="slideshow-controls" aria-hidden="true">
        {
          slides.map((slide, index) =>
            (<React.Fragment key={index}>
              <label htmlFor={`slide-bullet-${index === 0 ? slides.length : index}`} className="slide_controls slide_controls-previous" alt={`${(lang === 'fr' ? 'Aller à la slide' : 'Go to slide')} ${index === 0 ? slides.length : index}`} />
              <label htmlFor={`slide-bullet-${(index === slides.length - 1) ? 1 : index + 2}`} className="slide_controls slide_controls-next" alt={`${(lang === 'fr' ? 'Aller à la slide' : 'Go to slide')} ${(index === slides.length - 1) ? 1 : index + 2}`} />
            </React.Fragment>)
          )
        }
        <span className="controls" aria-hidden="true" />
      </nav>
      }
    </div>
    <hr />
  </section>
  );
};

export default Slideshow;
