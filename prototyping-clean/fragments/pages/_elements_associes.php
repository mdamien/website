<!-- Elements liées -->
<aside class="container" id="elements-associes">
    <h1>Éléments associés</h1>
    <input type="checkbox" id="filtre_equipe" class="filtre_objet"/>
    <label for="filtre_equipe">Équipe</label>
    <input type="checkbox" id="filtre_production" class="filtre_objet"/>
    <label for="filtre_production">Production</label>
	<input type="checkbox" id="filtre_activite" class="filtre_objet"/>
	<label for="filtre_activite">Activité</label>
	
    <div class="contenu">

        <!-- if type=people -->
        <article data-type="people" class="people">
            <div class="nomenclature">
                <p class="type"><a href="#linkPageEquipe">Équipe du médialab</a></p>
            </div>
            <div class="image-pre">
                <a href="#linkObjet">
                    <?php include('assets/images/patterns/pattern-1.html'); ?>
                </a>

                <figure>
                    <a href="#linkObjet">
                        <img src="assets/images/sample/d-cardon-200x200.jpg" alt="Portrait de Dominique Cardon" />
                    </a>
                </figure>
            </div>

            <hgroup>
                <a href="#linkObjet">
                    <h1 data-level-1="name">Dominique Cardon</h1>
                    <h2 data-level-2="role">Directeur du médialab</h2>
                    <!-- <p>associé.e au médialab</p> -->

                    <p class="more"><a href="#linkObjet">En savoir plus</a></p>
                </a>
            </hgroup>
        </article>

        <!-- if type=actualite -->
        <article data-type="activite" class="activite">
            <div class="nomenclature">
                <p class="type">Activité</p>
                <p class="sous-type"><a href="#">Pédagogie</a></p>
            </div>
            <div class="image-pre">
                <?php include('assets/images/sample_txt/naturpradi_xs.html'); ?>
            </div>
            <hgroup><a href="#">
                    <h1 data-level-1="baseline">Marchés financiers : que sont les “bonnes” relations sociales
                        d’échange?</h1>
                    <h2 data-level-2="name">How not to be a bad trader.</h2>
                    <p class="more"><a href="#">En savoir plus</a></p>
                </a></hgroup>
        </article>


        <article data-type="production" class="production">
            <div class="nomenclature">
                <p class="type">Production</p>
                <p class="sous-type"><a href="#">Communication</a></p>
            </div>
            <div class="image-pre">
                <?php include('assets/images/sample_txt/naturpradi_xs.html'); ?>
            </div>
            <hgroup><a href="#">
                    <h1 data-level-1="title">Hyperlink is not dead!</h1>
                    <h2 data-level-2="author" class="author">
                        <span>Benjamin Ooghe-Tabanou</span>
                        <span>Guillaume Plique</span>
                        <span>Mathieu Jacomy</span>
                        <span>Paul Girard</span>
                    </h2>
                    <p class="more"><a href="#">En savoir plus</a></p>
                </a></hgroup>
        </article>

        <!-- if type=people -->
        <article data-type="people" class="people">
            <div class="nomenclature">
                <p class="type"><a href="#linkPageEquipe">Équipe du médialab</a></p>
            </div>
            <div class="image-pre">
                <a href="#linkObjet">
                    <?php include('assets/images/patterns/pattern-1.html'); ?>
                </a>

                <figure>
                    <a href="#linkObjet">
                        <img src="assets/images/sample/d-cardon-200x200.jpg" alt="Portrait de Dominique Cardon" />
                    </a>
                </figure>
            </div>

            <hgroup>
                <a href="#linkObjet">
                    <h1 data-level-1="name">Dominique Cardon</h1>
                    <h2 data-level-2="role">Directeur du médialab</h2>
                    <!-- <p>associé.e au médialab</p> -->

                    <p class="more"><a href="#linkObjet">En savoir plus</a></p>
                </a>
            </hgroup>
        </article>

        <!-- if type=people -->
        <article data-type="people" class="people">
            <div class="nomenclature">
                <p class="type"><a href="#linkPageEquipe">Équipe du médialab</a></p>
            </div>
            <div class="image-pre">
                <a href="#linkObjet">
                    <?php include('assets/images/patterns/pattern-1.html'); ?>
                </a>

                <figure>
                    <a href="#linkObjet">
                        <img src="assets/images/sample/d-cardon-200x200.jpg" alt="Portrait de Dominique Cardon" />
                    </a>
                </figure>
            </div>

            <hgroup>
                <a href="#linkObjet">
                    <h1 data-level-1="name">Dominique Cardon</h1>
                    <h2 data-level-2="role">Directeur du médialab</h2>
                    <!-- <p>associé.e au médialab</p> -->

                    <p class="more"><a href="#linkObjet">En savoir plus</a></p>
                </a>
            </hgroup>
        </article>

        <article data-type="actualite">
            <div class="nomenclature">
                <p class="type">Actualité</p>
                <p class="sous-type"><a href="#">Rendez-vous</a></p>
            </div>
            <div class="image-pre">
                <?php include('assets/images/sample_txt/fabrique_loi_xs.html'); ?>
            </div>
            <hgroup><a href="#">
                    <h1 data-level-1="title">Rencontre avec George Micheal</h1>
                    <!--si rendez-vous--><time class="time">25 décembre / 18h - 20H</time>
                    <h2 data-level-2="label">Dans le cadre du séminaire "Merry Christmas"</h2>
                    <p class="more"><a href="#">En savoir plus</a></p>
                </a></hgroup>
        </article>


        <article data-type="activite" class="activite">
            <div class="nomenclature">
                <p class="type">Activité</p>
                <p class="sous-type"><a href="#">Pédagogie</a></p>
            </div>
            <div class="image-pre">
                <?php include('assets/images/sample_txt/naturpradi_xs.html'); ?>
            </div>
            <hgroup><a href="#">
                    <h1 data-level-1="baseline">Marchés financiers : que sont les “bonnes” relations sociales
                        d’échange?</h1>
                    <h2 data-level-2="name">How not to be a bad trader.</h2>
                    <p class="more"><a href="#">En savoir plus</a></p>
                </a></hgroup>
        </article>

    </div>
</aside>