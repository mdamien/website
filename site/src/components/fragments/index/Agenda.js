import React from 'react';
import {Link} from 'gatsby';
import format from 'date-fns/format';
import {getDay} from 'date-fns';
import {getDate} from 'date-fns';
import {getMonth} from 'date-fns';
import {getYear} from 'date-fns';
import {getHours} from 'date-fns';
import {en, fr} from 'date-fns/locale'


/*
Function Agenda
	InputButton -> Generer Input Button
	SetCssVar -> Determiner le nombre de jour et importer mixin SCSS ou CSS en fonction
	OneDay -> Retourne un HTML pour un Jour
		whichTimeCase -> Détermine Structure HTML à adopter
		WhichtimeLang -> Retourne une valeur pour une fonction qui la traduction de la date

	return -> Retourne l'ensemble des OneDay entourés d'element HTML dont les InputButton.

*/

export default function Agenda({rdv, lang}){

	let timeCase, timeLang;

	// Générer les bouttons de navigation Input
	const InputButton = () => {
	    let buttons = []

	    for (let i = 1; i < 7; i++) {
	    	buttons.push(
	      		<>
	      		<input type="radio" name="move-agenda" value="agenda_moving_left" id={`input_agenda_moving_left_${i}`} hidden />
	            <label className="agenda_moving_left" id={`agenda_moving_left_${i}`} for={`input_agenda_moving_left_${i}`}>
	                <span>〉</span>
	            </label>
	            </>
	    	)
	    }

	    return buttons;
	};

	function SetCssVar(rdv){
		// Déterminer le nombre d'évenement totaux à afficher
		const HowManyDays = rdv.lenght;

		// TO DO : Inclure var(--nbr-rdv) dans l'élément parent Section
		// TO DO : Importer une partie de la feuille de style scss parts/index/_agenda-desktop-slider.scss en fonction de ce nombre
	}

	/* L'agenda se pare de trois mise en page possible.
	Cette fonction détermine laquel est la plus pertinente pour chaque événement. */
	function whichTimeCase(OneDay){
	  if (getMonth(OneDay.startDate) === getMonth(OneDay.endDate) ){
	  	timeCase = "time-case3"; // Si plusieurs jours sur des mois différents (cas rare) case3
	  } else{
	    if(getDate(OneDay.startDate) - getDate(OneDay.endDate) === 0 )
	      timeCase = "time-case1"; // si une seule journée case 1;
	    else
	      timeCase = "time-case2"; // sinon indique plusieurs jours sur le même mois
	  }
	}

	/* Cette fonction est peut être supperflu.
	Elle est destinée à remplir le champ {locale: timeLang} afin de determiner
	une traduction de la date */
	function WhichtimeLang(lang){
       	if(lang === "fr"){
    		return "fr" ;
		} else {
    		return "en" ;
    	};
	}
 	console.log(rdv);

	return (
		<>
		<section id="agenda">
			<h1>{lang === "fr" ? "Les rendez-vous " : "The agenda"} </h1>

			<div id="agenda-container">

	            <InputButton />

	            <div className="agenda_moving_left" id="agenda_moving_left_cache"></div>

	            <input type="radio" name="move-agenda" value="agenda_moving_right" id="input_agenda_moving_right" hidden />
	            <label className="agenda_moving_right" id="agenda_moving_right" for="input_agenda_moving_right">
	                <span>〈〈</span>
	            </label>

	            <input type="radio" name="move-agenda" value="agenda_moving_right" id="input_agenda_moving_right_1" hidden />
	            <label className="agenda_moving_right" id="agenda_moving_right_1" for="input_agenda_moving_right_1">
	                <span>〈</span>
	            </label>

				<div id="agenda-contenu" data-attribute="agenda">
					<>
	                <article className="past" data-count="2">

						<p>{lang === "fr" ?
							("Voir les rendez-vous déjà passés dans " + <Link to="/news">Actualités</Link>) :
							("Have a look to past appoitement in actuality " + <Link to="/en/news">Actuality</Link>)
							}
						</p>

	                </article>
					{rdv.map((OneDay, i) =>
						<>

					 	{whichTimeCase(OneDay)}
					 	{WhichtimeLang(lang)}

						<article key={i}>
					        <p className="year-main">{getYear(OneDay.endDate)} </p>

							{ OneDay.external && (OneDay.external === true) ?
								<p className="external" data-external="yes">
									<span className="out">↑</span>
									<span className="tip">{ lang === "fr" ? "Cet evenement est externe au Médialab" : "This event is external to Medialab" }</span>
								</p> : ""
							}

					        <time className={`time ${timeCase}`} data-time="">
					            <Link to={OneDay.permalink[lang]}>

					            	{timeCase === "time-case1" && <span className="week">{format(getDay(OneDay.startDate), 'dddd', {locale: fr} )}</span> }
					            	{timeCase === "time-case1" && <span className="day">{getDay(OneDay.startDate)}</span>}

					            	{timeCase !== "time-case1" && // if note case 1
					                    <>
					                    <span className="start">
					                    <span className="day">{getDay(OneDay.startDate)}</span>
					                     {timeCase === "time-case3" && <span className="month">{getMonth(OneDay.startDate)} </span> }
					                    </span>
					                    <span className="between">⇥ </span>
					                    </>
					            	}
					            	{timeCase === "time-case1" && <span className="month">{format(getMonth(OneDay.endDate), 'MMMM', {locale: timeLang} )}</span> }
					            	{timeCase !== "time-case1" &&  // if note case 1
					                    <span className="end">
					                    	<span className="day">{getDay(OneDay.endDate)}</span>
					                        <span className="month">{getMonth(OneDay.endDate)}</span>
					                    </span>
					            	}
					                <span className="year">{getYear(OneDay.endDate)} </span>
					            </Link>
					        </time>

					        <h1 data-level-1="title">
					        	<Link to={OneDay.permalink[lang]}>
					        		{lang === "fr" ? OneDay.title.fr : OneDay.title.en }
					        	</Link>
					        </h1>
					        <h2 data-level-1="label">
					        	<Link to={OneDay.permalink[lang]}>
					        		{ OneDay.label && (lang === "fr" ? OneDay.label.fr : OneDay.label.en ) }
					        	</Link>
					        </h2>

					        { timeCase === "time-case1" ? <p className="hours">{"◷ " + getHours(OneDay.startDate) + " ⇥ " + getHours(OneDay.startDate)}</p> : "" }
					        <p className="place">{"✻ " + OneDay.place}</p>

						</article>
						</>
						)}
					</>
				</div>
			</div>
		</section>
		</>
  	);
}
