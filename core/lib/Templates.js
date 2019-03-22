import { Monogatari } from './../monogatari';
import moment from 'moment';

Monogatari.component ('MAIN_MENU').html (`
	<section data-screen="main">
		<audio type="audio/mpeg" data-component="ambient"></audio>

		<div class="vertical vertical--right text--right bottom animated bounceIn" data-ui="inner-menu">
			<button data-action="start" data-string="Start">Start</button>
			<button data-action="open-screen" data-open="load" data-string="Load">Load</button>
			<button data-action="open-screen" data-open="settings" data-string="Settings">Settings</button>
			<button data-action="open-screen" data-open="help" data-string="Help">Help</button>
		</div>
	</section>
`);

Monogatari.component ('ORIENTATION_WARNING').html (`
	<div data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>
`);

Monogatari.component ('CREDITS_MENU').html (`
	<section data-screen="credits">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
			<h2 data-string="Credits">Credits</h2>
		<div class="text--center padded" data-ui="credits"></div>
	</section>
`);

Monogatari.component ('CREDITS_MENU_ITEM').html ((section, content) => {
	let html = `<h3>${section}</h3><div>`;

	if (typeof content === 'string') {
		return `
			<p class='row row--spaced'>
				<span class="row__column row__column--phone--12">${content}</span>
			</p>`;
	}

	for (const key of Object.keys (content)) {
		if (key.indexOf ('_') === 0) {
			html += `<p class='row row--spaced'>
						<span class="row__column row__column--phone--12">${content[key]}</span>
					</p>`;
		} else {
			html += `<p class='row row--spaced'>
						<b class="row__column row__column--phone--6">${key}</b>
						<span class="row__column row__column--phone--6">${content[key]}</span>
					</p>`;
		}

	}
	html += '</div>';
	return html;
});

Monogatari.component ('GAME').html (`
	<section id="game" class="unselectable">
		<div id="particles-js" data-ui="particles"></div>
		<div id="background" data-ui="background"></div>
		<div id='components'>
			<div class="video-wrapper text--center vertical middle" data-component="video" data-ui="video-player">
				<video type="video/mp4" data-ui="player" controls="true"></video>
				<button data-action="close-video" data-string="Close">Close</button>
			</div>
		</div>


		<div data-ui="text">
			<img data-ui="face" alt="">
			<span data-ui="who"></span>
			<p data-ui="say"></p>
		</div>
		<div data-ui="quick-menu" class="text--right"></div>
	</section>
`);

Monogatari.component ('HELP_MENU').html (`
	<section data-screen="help">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Help">Help</h2>
		<div class="row row--spaced" data-content="help">
			<p data-string="AdvanceHelp" class="row__column--12">To advance through the game, left-click or tap anywhere on the game screen or press the space key</p>
			<div class="row__column--12 row__column--tablet--6 text--left row row--spaced">
				<div class="row__column--12">
					<h3 data-string="QuickMenu">Quick Menu</h3>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2 row" data-content="symbols">
						<span class="fas fa-arrow-left" data-content="icon"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="BackButton">Go back</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-eye"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="HideButton">Hide the text box</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="far fa-comments"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="DialogLogButton">Show the dialog log</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-play-circle"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="AutoPlayButton">Enable auto play</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-fast-forward"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SkipButton">Enter skip mode</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-save"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SaveButton">Open the Save Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-undo"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="LoadButton">Open the Load Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
				<div class="row__column--2" data-content="symbols">
					<span class="fas fa-cog"></span>
						</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SettingsButton">Open the Settings Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-times-circle"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="QuitButton">Quit Game</span>
					</div>
				</div>
			</div>
			<div class="row__column--12 row__column--tablet--6 text--left row row--spaced">
				<div class="row__column--12">
					<h3 data-string="KeyboardShortcuts">Keyboard Shortcuts</h3>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2 row" data-content="symbols">
						<span data-content="shortcut"><span class="fas fa-arrow-left" data-content="icon"></span></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="BackButton">Go Back</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">H</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="HideButton">Hide the text box</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">A</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="AutoPlayButton">Enable auto play</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">S</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SkipButton">Enter skip mode</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ S</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SaveButton">Open the Save Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ L</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="LoadButton">Open the Load Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">ESC</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SettingsButton">Open the Settings Screen.</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ Q</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="QuitButton">Quit Game</span>
					</div>
				</div>
			</div>
		</div>
	</section>
`);

Monogatari.component ('GALLERY').html (`
	<section data-screen="gallery">
		<div class='modal' data-ui="image-viewer">
			<figure></figure>
		</div>
		<button class='fas fa-arrow-left top left' data-action='back'></button>
		<h2 data-string='Gallery'>Gallery</h2>
		<div class='row row--spaced text--center' data-ui="gallery"></div>
	</section>
`);

Monogatari.component ('GALLERY_ITEM').html (image => {
	// Check if the image has been unlocked or not, if it hasn't then a
	// lock will be shown instead of the image.
	if (Monogatari.component ('GALLERY').state ('unlocked').includes (image)) {
		return `<figure class='md-depth-2 col xs6 s6 m4 l3 xl3' data-image='${image}' style='background-image: url('./img/gallery/${Monogatari.component ('GALLERY').images (image)}')'></figure>`;
	} else {
		return '<figure class="md-depth-2 column column--col xs6 s6 m4 l3 xl3"><span class="fa fa-lock"></span></figure>';
	}
});

Monogatari.component ('LOAD_MENU').html (`
	<section data-screen="load">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Load">Load</h2>
		<div data-ui="saveSlots">
			<h3 data-string="LoadSlots">Saved Games</h3>
			<div data-ui="slots" class="row row--spaced padded"></div>
		</div>
		<div data-ui="autoSaveSlots">
			<h3 data-string="LoadAutoSaveSlots">Auto Saved Games</h3>
			<div data-ui="slots" class="row row--spaced padded"></div>
		</div>
	</section>
`);

Monogatari.component ('SLOT').html ((slot, name, image, data) => {
	let background = '';

	if (image) {
		background = `url(${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').scenes}/${image})`;
	} else if (data.game.state.scene) {
		background = data.game.state.scene;

		if (background.indexOf (' with ') > -1) {
			background = Text.suffix ('show scene', Text.prefix (' with ', background));
		}
	}

	return `
		<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
			<button class='fas fa-times' data-delete='${slot}'></button>
			<small class='badge'>${name}</small>
			<div data-content="background" style="${image ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${moment (data.date).format ('MMMM Do YYYY, h:mm:ss a')}</figcaption>
		</figure>
	`;
});

Monogatari.component ('LOAD_SCREEN').html (`
	<section data-screen="loading">
		<div class="middle">
			<h2 data-string="Loading">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100"></progress>
			<small data-string="LoadingMessage">Wait while the assets are loaded.</small>
		</div>
	</section>
`);

Monogatari.component ('SAVE_MENU').html (`
	<section data-screen="save">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<div class="horizontal horizontal--center">
			<input type="text" placeholder="Save Slot Name" data-input="slotName" required>
			<button data-string="Save" data-action="save">Save</button>
		</div>
		<div data-ui="slots" class="row row--spaced padded"></div>
	</section>
`);

Monogatari.component ('SETTINGS_MENU').html (`
	<section data-screen="settings" class="text--center">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Settings">Settings</h2>
		<div class="row row--spaced padded text---center">
			<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">
				<div data-settings="audio" class="vertical vertical--center text--center">
					<h3 data-string="Audio">Audio</h3>
					<span data-string="Music">Music Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="music">
					<span data-string="Sound">Sound Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="sound">
					<span data-string="Voice">Voice Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="voice">
				</div>
			</div>

			<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">
				<div data-settings="text-speed">
					<h3 data-string="TextSpeed">Text Speed</h3>
					<input type="range" min="1" max="50" step="1" data-action="set-text-speed">
				</div>

				<div data-settings="auto-play-speed">
					<h3 data-string="AutoPlaySpeed">Auto Play Speed</h3>
					<input type="range" min="0" max="60" step="1" data-action="set-auto-play-speed">
				</div>
				<div data-settings="language">
					<h3 data-string="Language">Language</h3>
					<div class="horizontal horizontal--center"></div>
				</div>

				<div data-settings="resolution" data-platform="electron">
					<h3 data-string="Resolution">Resolution</h3>
					<div class="horizontal">
						<select data-action="set-resolution"></select>
						<span class="fas fa-sort" data-select="set-resolution"></span>
					</div>
				</div>
			</div>
		</div>
	</section>
`);

Monogatari.component ('MESSAGE').html ((title, subtitle, message) => `
	<div data-component="modal" data-ui="messages" class="middle">
		<div data-ui="message-content">
			<h3>${title}</h3>
			<p>${subtitle}</p>
			<p>${message}</p>
		</div>
		<div class="horizontal horizontal--center" data-ui="inner-menu">
			<button data-action="close" data-close="messages" data-string="Close">Close</button>
		</div>
	</div>
`);

Monogatari.component ('QUIT_WARNING').html (`
	<div data-notice="exit" class="modal">
		<div class="modal__content">
			<p data-string="Confirm">Do you want to quit</p>
			<div>
				<button data-action="quit" data-string="Quit">Quit</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>
`);

Monogatari.component ('TEXT_INPUT').html (message => `
	<form data-component="modal" data-ui="input" class="middle active">
		<p data-ui="input-message" class="block">${message}</p>
		<input type="text">
		<small data-ui="warning" class="block"></small>
		<div>
			<button data-action="submit" type='submit'>Ok</button>
		</div>
	<form>
`);