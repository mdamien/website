import React from 'react';
import Link from '../helpers/Link';

import {compare, composeText, productionTypeToSchemaURL} from '../helpers/helpers.js';
import {I18N_TYPE_LABELS} from '../../i18n.js';

import ToolFilter from '../listings/fragments/ToolFilter';

import ImagePlaceholder from '../helpers/ImagePlaceholder';
import DateNews from '../helpers/DateNews.js';
import PageMeta from '../helpers/PageMeta.js';

const messagesMeta = {
  title: {
    fr: 'Outils | médialab Sciences Po',
    en: 'Tools | médialab Sciences Po',
  },
  description: {
    fr: "Le médialab produit, mobilise et enseigne l'usage de nombreux outils numériques libres dédiés à l'enquête. Chaque outil listé sur cette page donne accès au code source, à la documentation et à des cas d'usages quand ils sont disponibles.",
    en: 'The medialab produces, mobilizes and teaches the use of numerous free digital tools dedicated to research. Each tool listed in this page gives access to its source code, documentation and use cases when available.'
  }
};

const i18n = {
  fr: {
    externalTool: 'recommandé par le médialab',
    internalTool: 'fait par le médialab'
  },
  en: {
    externalTool: 'recommended by the médialab',
    internalTool: 'made by the médialab'
  }
};

export default function ToolListing({lang, list}) {

  const nbItem = 0;
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const joinText = lang === 'fr' ? ' et ' : ' and ';

  const toolsSorted = list.slice().sort((
    {external: aEx, status: aStatus, title: aTitle},
    {external: bEx, status: bStatus, title: bTitle}
  ) => {
    const aTitleLower = (aTitle[lang] && aTitle[lang].toLowerCase()) || (aTitle[otherLang] && aTitle[otherLang].toLowerCase()),
          bTitleLower = (bTitle[lang] && bTitle[lang].toLowerCase()) || (bTitle[otherLang] && bTitle[otherLang].toLowerCase());
    return compare(!!aEx, !!bEx) ||
      -compare(aStatus || '0', bStatus || '0') ||
      compare(aTitleLower, bTitleLower);
  });

  return (
    <>
      <PageMeta
        title={messagesMeta.title[lang]}
        description={messagesMeta.description[lang]}
        lang={lang} />
      <main role="main" aria-describedby="aria-accroche">
        <ToolFilter lang={lang} />
        <section className="main-filters" />

        <section id="liste" className="main-container">
          <ul className="liste_objet list-grid-layout" id="liste-tools">
            {
              toolsSorted
              .map((tool, index) => {
                  let usagesText;
                  let usagesClass;
                  if (tool.usages && tool.usages.length) {
                    usagesText = composeText(tool.usages, joinText, I18N_TYPE_LABELS.toolsUsages[lang]);
                    usagesClass = tool.usages.join(' ');
                  }
                  return (
                    <li
                      key={index}
                      itemScope
                      itemType={productionTypeToSchemaURL(tool.type)}
                      data-item={nbItem}
                      data-type={tool.type}
                      className={`tool-portrait list-item ${tool.audience} ${tool.status} ${usagesClass}`} >
                      <Link to={tool.permalink[lang]}>
                        <figure className="left-column">
                          {tool.coverImage ?
                            <img
                              itemProp="image"
                              src={tool.coverImage.url} />
                            : <ImagePlaceholder type="production" alt={tool.title[lang] || tool.title[otherLang]} />
                          }
                        </figure>
                        <div className="right-column">
                          <div className="header">
                            <h1 itemProp="name" data-level-1="title">{tool.title[lang] || tool.title[otherLang]}</h1>
                            <h2>{tool.description && (tool.description[lang] || tool.description[otherLang])}</h2>
                          </div>
                          <div className="footer">
                            {tool.usages &&
                              <div className="info-row">
                                <p className="important"><span>{usagesText}</span></p>
                              </div>
                            }
                            <div className="info-row">
                              <p className="subtype-production subtype-origin"><span>{tool.external ? i18n[lang].externalTool : i18n[lang].internalTool}</span></p>
                              <DateNews startDateSchemaProp="datePublished" startDate={tool.date} lang={lang} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                }
              )
            }
          </ul>
        </section>
      </main>
    </>
  );
}
