import React from 'react';
import {Link, withPrefix} from 'gatsby';

import Logo from '../assets/svg/logo_medialab.svg';

const getRelatedElements = (relatedElements, object) => {
	return relatedElements.filter(({exist}) => {
		return !(typeof exist === 'function') || exist(object);
	});
}


export default function Nav({lang, object={}, related=[]}) {
	//Je pense que nous n'avons pas assez de donnée dans le CMS pour mener à bien cette fonction
	// Néanmoins la logique serait :  Si et seulement si il existe une Image Générée créer cet élément
	// Cet élément est composé d'une image lambda et de son corrolaire Image Générée
	let coverImage = null;
	if (object && object.cover) {
		coverImage = (
			<div>
				<img src={withPrefix(object.cover.file)} alt={object.cover.title} />
				<div class=".image-generator"></div>
			</div>
		);
	}


	return (<nav id="nav-inside-article">
			<div className="nav-inside-item">
				<Link to="#topbar">
					<Logo />
				</Link>
			</div>
			<div className="nav-inside-item" id="img-article">
				{coverImage}
			</div>
			{(getRelatedElements(related, object)).map(related => (
				<div className="nav-inside-item">
					<p>
						<a href={`#${related.id}`}>{related[ lang ]}</a>
					</p>
				</div>)
			)}
		</nav>
	);
}
