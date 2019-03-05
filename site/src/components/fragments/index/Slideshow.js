import React from 'react';
import {Link} from 'gatsby';

import ProcessedImage from '../../ProcessedImage.js'; 

let a, z;
a = 3;
z = 1;

// Ici Nous composons un article du caroussel. 
const BuildingSlides = (slide, lang) => { 
	return (
		<article className="transition" data-type={slide.model}>
			<Link to={slide.slugs}>
				<div className="image-pre">
					{/*slide.coverImage.processed*/}
					<ProcessedImage size="large" image="" />  
				</div>
				<div className="image-pre-phone">
					{/*slide.coverImage.processed*/}
					<ProcessedImage size="medium" image=""  />
				</div>
			</Link>
			<div className="contenu-slide">
				<Link to={slide.model + "/" + slide.slugs}>
					<div className="nomenclature">
						<p className="type">{slide.type && (lang === "fr" ? slide.type.fr : slide.type.en)}</p>
						{/* Sur cette derniere ligne ? Comment trouver le sous-type ?*/} 
						{/* <p className="sous-type"><a href="#">Communication</a></p> */} 
	 				</div>

					{/* If Activité */}
					{slide.model === "activities" ? 
					<>
					<h1 data-level-1="baseline">{slide.baseline && (lang === "fr" ? slide.baseline.fr : slide.baseline.en)}</h1>
					<h2 data-level-2="name">{slide.name}</h2> 
					</>
					: "" }				

					{/* If Production */}
					{slide.model === "productions" ? 
					<>
					<h1 data-level-1="title">{slide.title && (lang === "fr" ? slide.title.fr : slide.title.en)}</h1>
					<h2 data-level-2="author" className="author">
						<ul>
						{(slide.people || []).map(p => <li key={p.id}>{p.firstName} {p.lastName}</li>)}
						</ul>
					</h2>
					</> 
					: "" }	

					{/* if News */}
					{slide.model === "news" ?
						<> 
						<h1 data-level-1="title">{slide.title && (lang === "fr" ? slide.title.fr : slide.title.en)}</h1>
						<time className="time">{slide.startDate && slide.startDate} - {slide.endDate && slide.endDate}</time>
						<h2 data-level-2="label">{slide.label && (lang === "fr" ? slide.label.fr : slide.label.en)}</h2>
						</> 
						: "" }	
					
					{/* Default */}
					<p className="description">{slide.description && (lang === "fr" ? slide.description.fr : slide.description.en)}</p>					
					<p className="more">En savoir plus</p>
				</Link>
			</div>
		</article>
	);
}

// Ici nous composons l'ensemble du caroussel
const Slideshow = ({slider, lang}) => {

	return (
		<>
		<section className="slideshow" id="slideshow">
			{slider.map((s, index) => 
				<>	
				{ index === 0 ? ( a = "3",  z = "2" ) :
					index === 1 ? ( a = "1",  z = "3" ) :
						index === 3 ? ( a = "2",  z = "4" ) : "" }

				<input type="radio" name="ss1" id={`ss1-item-${index + 1}`} className="slideshow--bullet" checked="checked" />
				<label className="slideshow--bullet-label" for={`ss1-item-${index + 1}`}>
					{s.model === "activities" ? 
						s.baseline && (lang === "fr" ? <h1 data-level-1="baseline">s.baseline.fr</h1> : <h1 data-level-1="baseline">s.baseline.en</h1>)
						: 
						s.title && (lang === "fr" ? <h1 data-level-1="title">s.title.fr</h1> : <h1 data-level-1="title">s.title.en</h1>)
					}	
				</label>
				{/* Content Below */}
				<div className="slideshow--item">
					<BuildingSlides slide={s} lang={lang} />
					<label for={`ss1-item-${a}`} className="slideshow--nav slideshow--nav-previous">{lang === "fr" ? "Aller à la slide " + {a} : "Go to slide " + {a} }</label>
					<label for={`ss1-item-${z}`} className="slideshow--nav slideshow--nav-next">{lang === "fr" ? "Aller à la slide " + {z} : "Go to slide " + {z} }</label>
				</div>
				</>
			)}
			<hr/>
		</section>
		</>
  	);
}

export default Slideshow;
