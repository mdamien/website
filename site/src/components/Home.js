import React from 'react';

import {graphql} from 'gatsby';
import {Link} from 'gatsby';

//import Slideshow from './fragments/index/Slideshow.js';
//import Now from './fragments/index/Now.js';
//import Agenda from './fragments/index/Agenda.js';
//import Flux from './fragments/index/Flux.js';

/*import RawHtml from './RawHtml';*/

//import './scss/index.scss';


export default function Home({lang, grid, slider, rdv}) {
  console.log(grid, slider, rdv);

  return (
  	<>
  	{/*<Slideshow slider={slider} />*/}
  	<main>
		<section id="introduction">
			<h1>Le médialab</h1>
			<p>
				Laboratoire de recherche interdisciplinaire, le médialab est un lieu de conception, de développement et d'expérimentation de méthodes numériques hybrides pour nourrir des questions scientifiques ancrées dans le périmètre des Sciences humaines et sociales.
				<a href="#">En savoir plus</a>
			</p>
		</section>
		{/*<Now />*/}
		{/*<Agenda  rdv={rdv} lang={lang} />*/}
		<section id="follow">
			<p>Vous pouvez suivre les activité du Medialab sur <a href="https://twitter.com/medialab_scpo" title="twitter">⟐</a> ou sur <a href="https://github.com/medialab" title="Github">⊶</a></p>
		</section>
		{/*<Flux />*/}
  	</main>
  	</>
  );
}
