import React from 'react';
import Link from '../helpers/Link';

import {compare, productionTypeToSchemaURL} from '../helpers/helpers.js';
import {I18N_TYPE_LABELS} from '../../i18n.js';

import ToolFilter from '../listings/fragments/ToolFilter';

import ImagePlaceholder from '../helpers/ImagePlaceholder';
import DateNews from '../helpers/DateNews.js';
import PageMeta from '../helpers/PageMeta.js';

const messagesMeta = {
  title: {
    fr: 'OUTILS | médialab Sciences Po',
    en: 'Tools | médialab Sciences Po',
  },
  description: {
    fr: "Le médialab produit, mobilise et enseigne l'usage de nombreux outils numériques libres dédiés à l'enquête équipée numériquement. Retrouvez sur cette page un annuaire des outils qui pourraient vous être utiles. Chaque page d'outil vous donne accès au code source, à la documentation et à des cas d'usages quand ils sont disponibles.",
    en: 'The medialab produces, mobilizes and teaches the use of numerous free digital tools dedicated to digitally equipped surveys. Find on this page a directory of tools that may be useful to you. Each tool page gives you access to source code, documentation and use cases when available.'
  }
};

const i18n = {
  fr: {
    externalTool: 'outil exterieure au médialab',
    internalTool: 'fait par le médialab'
  },
  en: {
    externalTool: 'external tool',
    internalTool: 'made by médialab'
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
                    if (tool.usages.length === 1)
                      usagesText = I18N_TYPE_LABELS.toolsUsages[lang][tool.usages[0]];
                    else {
                      const usages = tool.usages.slice();
                      const last = usages.pop();
                      usagesText = usages.map((usage) => I18N_TYPE_LABELS.toolsUsages[lang][usage]).join(', ') + joinText + last;
                    }
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
                            <div className="info-row">
                              {tool.usages && <p className="important"><span>{usagesText}</span></p>}
                            </div>
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
