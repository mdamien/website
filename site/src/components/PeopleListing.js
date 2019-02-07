import React from 'react';
/*import {graphql} from 'gatsby';*/
import {Link} from 'gatsby';

import FiltreEquipe from './fragments/pageEquipe/FiltreEquipe.js';

/*import RawHtml from './RawHtml';*/
import {templateMembership} from './helpers.js';
import './scss/page_equipe.scss';

export default function PeopleListing({lang, list}) {
	console.log(lang, list);

	return (
		<>
		<FiltreEquipe />
		<section id="liste">
		    <ul className="liste_equipe" id="liste_equipe">

			{list.map(p => (
	          	<li key={p.id} data-item={p.id} data-domaine={p.domain} data-statut={p.active} data-member={p.membership}>
				    <Link to={`/people/dominique-cardon`}>
		                <figure><img src="./assets/images/sample/D-Cardon-bis.jpg"  alt="caption"/></figure>
		                <hgroup>
						    <h1 data-level-1="name">{p.firstName} {p.lastName}</h1>
		                    <h2 data-level-2="role" data-type="role">{p.role && p.role.fr}</h2>
		                </hgroup>
		                <p data-type="activite">{p.status}</p>
		            </Link>
				</li>
	        ))}
			</ul>
		</section>
		</>
	);
}

/*		

${p.slugs[p.slugs.length - 1]}


<li data-item="" data-domaine="recherche" data-statut="actif" data-member="yes">
    <Link to="/people/dominique-cardon">
        <figure><img src="/assets/images/sample/D-Cardon-bis.jpg" /></figure>
        <hgroup>
		    <h1 data-level-1="name">Dominique Cardon</h1>
            <h2 data-level-2="role" data-type="role">Directeur du médialab</h2>
        </hgroup>
        <p data-type="activite">En ce moment, je chef et j'écris des papiers</p>
    </Link>
</li>*/