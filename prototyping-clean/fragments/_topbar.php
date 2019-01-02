<header id="topbar">
	<input type="checkbox" id="toggle-menu" name="toggle-menu" value="visible" hidden>
	<label for="toggle-menu">
		<span class="span-nochecked"><?php include('assets/svg/menu-circle.svg'); ?></span>
		<span class="span-checked"><?php include('assets/svg/close-circle.svg'); ?></span>
	</label>


	<div id="topbar-content">
		<div id="logo-medialab">
			<a href="#">
			<?php include('assets/svg/logo_medialab_draft.svg'); ?>
			</a>
		</div>
		<nav id="nav-option">
			<ul id="nav-objet">

	              	<li data-type="actualite"><a href="page_listing_publication.php">Actualités</a></li>

	              	<li data-type="production"><a href="page_listing_publication.php">Productions</a></li>

	              	<li data-type="activite"><a href="page_listing_publication.php">Activités</a></li>

			</ul>
			<ul id="nav-institution">
				<li><a href="#">Le Médialab</a></li>
				<li><a href="#">L'équipe</a></li>
			</ul>
			<ul id="nav-archive">
				<li><a href="#">Archives</a></li>
			</ul>
		</nav>

		<div id="langue" class="menu langue">
			<p><span>FR</span><span> | </span><span>EN</span></p>
		</div>
	</div>
</header>
