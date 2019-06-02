import React from 'react';
import {Link} from 'gatsby';
import DateNews from '../../../helpers/DateNews.js';

export default function git({github, lang}) {

  return (
    <>
      <section id="git">

        <h1>{lang ==="fr" ? "Le médialab sur " : "Medialab on" }<span data-icon="git"><a href="https://github.com/medialab">Github</a></span></h1>
        <input
        type="radio" name="radio_flux" id="radio_git"
        hidden />
        <label className="responsive-flux" htmlFor="radio_git">
          {lang ==="fr" ? "Le médialab sur " : "Medialab on" }<span data-icon="git"><a href="https://github.com/medialab">Github</a></span>
        </label>  


        {github.map(r =>
        (<article key={r.repo} className="git" data-type="git">
          <aside className="divers">
            <p className="label" data-icon="git">Git</p>
            <p className="language">{r.language}</p>       
          </aside>

          <a href={r.url} target="_blank" rel="noopener noreferrer">
            <h1 data-level-1="title">
              {r.repo}
            </h1>
          </a> 

          <p data-level-2="description" className="description"> 
            {r.description}
          </p>

          <aside className="details">
            <DateNews startDate={r.startDate} endDate={r.endDate} lang={lang}/>
            <p className="contribution">&nbsp;{r.count} contribution{r.count > 1 ? 's' : ''}</p>
            {r.authors &&
              <p className="contributors">
                {r.authors.map((a, i) => {
                  let sep = '';
                  if (i === r.authors.length - 2)
                    sep = lang === 'fr' ? ' et ' : ' and ';
                  else 
                    if ((i < r.authors.length - 2))
                      sep = ', ';
                  if (a.permalink)
                    return <Link key={a.slug} to={a.permalink[lang]}>{a.nickname + sep}</Link>;
                  else
                    return <a key={a.nickname} href={a.url} target="_blank" rel="noopener noreferrer">{a.nickname + sep}</a>;
                  })}

              </p>
            }     
          </aside>
        </article>)
        )}
      </section>
    </>
);
}
