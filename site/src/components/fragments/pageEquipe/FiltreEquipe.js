import React from 'react';
/*import {graphql} from 'gatsby';
import {Link} from 'gatsby';*/

const FiltreEquipe = () => {
	return (
		<>
			<h1 className="type_title" id="activite_title">Membres</h1>

			<input type="checkbox" className="toggle-filtre-phone" id="toggle-filtre-phone" name="toggle-filtre-phone" value="visible" hidden />
			<label className="toggle-filtre-phone filtre_title" for="toggle-filtre-phone" title="Découvrir les options de filtrage">
				<p>Filtre<span>⋀</span>	</p>
			</label>
			
			<input type="checkbox" id="filtre_statut_actif" name="filtre_statut_actif" value="statut_actif" hidden checked />
			<label className="filtre_equipe filtre_statut checkbox-medialab checkbox-parent-medialab" for="filtre_statut_actif">Actives</label>

			<input type="checkbox" id="filtre_statut_passif" name="filtre_statut_passif" value="statut_passif" hidden />
			<label className="filtre_equipe filtre_statut checkbox-medialab checkbox-parent-medialab" for="filtre_statut_passif">Passées</label>


			<h2 className="filtre_domaine_title">Filtrer par domaine</h2>

			<input type="checkbox" id="domaine_academique" name="domaine_academique" value="academique" hidden />
			<label className="filtre_equipe filtre_domaine checkbox-medialab checkbox-parent-medialab" for="domaine_academique">Académique</label>

			<input type="checkbox" id="domaine_technique" name="domaine_technique" value="technique" hidden />
			<label className="filtre_equipe filtre_domaine checkbox-medialab checkbox-parent-medialab" for="domaine_technique">Technique</label>

			<input type="checkbox" id="domaine_design" name="domaine_design" value="design" hidden />
			<label className="filtre_equipe filtre_domaine checkbox-medialab checkbox-parent-medialab" for="domaine_design">Design</label>

			<input type="checkbox" id="domaine_pedagogie" name="domaine_pedagogie" value="pedagogie" hidden />
			<label className="filtre_equipe filtre_domaine checkbox-medialab checkbox-parent-medialab" for="domaine_pedagogie">Pédagogie</label>

			<input type="checkbox" id="domaine_administratif" name="domaine_administratif" value="administratif" hidden />
			<label className="filtre_equipe filtre_domaine checkbox-medialab checkbox-parent-medialab" for="domaine_administratif">Administratif</label>

			<h2 className="filtre_membre_title">Filtrer par appartenance</h2>

			<input type="checkbox" id="filtre_membre" name="filtre_membre" value="membre" hidden />
			<label className="filtre_equipe filtre_membre checkbox-medialab checkbox-parent-medialab" for="filtre_membre">Membres</label>

			<input type="checkbox" id="filtre_non_membre" name="filtre_non_membre" value="non_membre" hidden />
			<label className="filtre_equipe filtre_membre checkbox-medialab checkbox-parent-medialab" for="filtre_non_membre">Associés</label>	
		</>
	);
}

export default FiltreEquipe;
