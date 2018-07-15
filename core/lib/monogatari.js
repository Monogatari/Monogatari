
/* global require */

import { $_, Space, Platform, Preload, Util, FileSystem } from '@aegis-framework/artemis';
import { FancyError } from './FancyError';

const HTML = `
	<!-- Notice messages -->
	<div data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>

	<div data-notice="slot-deletion" class="modal">
		<div class="row spaced">
			<p data-string="SlotDeletion" class="col xs12 m12 l12 xl12">Are you sure you want to delete this slot?</p>
			<p class="col xs12 m12 l12 xl12"><small></small></p>
			<div class="col xs12 m12 l12 xl12">
				<button data-action="delete-slot" data-string="Delete">Delete</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>

	<div data-notice="slot-overwrite" class="modal">
		<div class="row spaced">
			<p data-string="SlotOverwrite" class="col xs12 m12 l12 xl12">Are you sure you want to overwrite this slot?</p>
			<input type="text" name="name" class="margin-1 col xs12 m12 l12 xl12" required>
			<div class="col xs12 m12 l12 xl12">
				<button data-action="overwrite-slot" data-string="Delete">Overwrite</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>

	<!--Game Screen -->
	<section id="game" class="unselectable">
		<div id="particles-js" data-ui="particles"></div>
		<div id="background" data-ui="background"></div>
		<div id='components'>
			<audio type="audio/mpeg" data-component="music"></audio>
			<audio type="audio/mpeg" data-component="voice"></audio>
			<audio type="audio/mpeg" data-component="sound"></audio>
			<div class="video-wrapper text--center vertical middle" data-component="video" data-ui="video-player">
				<video type="video/mp4" data-ui="player" controls="true"></video>
				<button data-action="close-video" data-string="Close">Close</button>
			</div>
		</div>

		<div data-ui="choices" class="vertical text--center middle"></div>
		<div data-ui="text">
			<img data-ui="face" alt="">
			<span data-ui="who"></span>
			<p data-ui="say"></p>
		</div>
		<div data-ui="quick-menu" class="text--right">
			<span data-action="back"><span class="fas fa-arrow-left"></span> <span data-string="Back">Back</span></span>
			<span data-action="distraction-free"><span class="fas fa-eye" data-action="distraction-free"></span> <span data-string="Hide" data-action="distraction-free">Hide</span></span>
			<span data-action="auto-play"><span class="fas fa-play-circle" data-action="auto-play"></span> <span data-string="AutoPlay" data-action="auto-play">Auto</span></span>
			<span data-action="open-menu" data-open="save"><span class="fas fa-save" data-action="open-menu" data-open="save"></span> <span data-string="Save" data-action="open-menu" data-open="save">Save</span></span>
			<span data-action="open-menu" data-open="load"><span class="fas fa-undo" data-action="open-menu" data-open="load"></span> <span data-string="Load" data-action="open-menu" data-open="load">Load</span></span>
			<span data-action="open-menu" data-open="settings"><span class="fas fa-cog" data-action="open-menu" data-open="settings"></span> <span data-string="Settings" data-action="open-menu" data-open="settings">Settings</span></span>
			<span data-action="end"><span class="fas fa-times-circle" data-action="end"></span> <span data-string="Quit" data-action="end">Quit</span></span>
		</div>
	</section>

	<!-- Loading Screen -->
	<section data-menu="loading">
		<div class="middle">
			<h2 data-string="Loading">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100"></progress>
			<small data-string="LoadingMessage">Wait while the assets are loaded.</small>
		</div>
	</section>

	<!-- Main Screen -->
	<section data-menu="main">
		<audio type="audio/mpeg" data-component="ambient"></audio>

		<div class="vertical vertical--right text--right bottom animated bounceIn" data-ui="inner-menu">
			<button data-action="start" data-string="Start">Start</button>
			<button data-action="open-menu" data-open="load" data-string="Load">Load</button>
			<button data-action="open-menu" data-open="settings" data-string="Settings">Settings</button>
			<button data-action="open-menu" data-open="help" data-string="Help">Help</button>
		</div>
	</section>

	<!-- Save Screen -->
	<section data-menu="save">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<div class="horizontal horizontal--center">
			<input type="text" placeholder="Save Slot Name" data-input="slotName" required>
			<button data-string="Save" data-action="save">Save</button>
		</div>
		<div data-ui="slots" class="row row--spaced padded"></div>
	</section>

	<!-- Load Screen -->
	<section data-menu="load">
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

	<!-- Settings Screen -->
	<section data-menu="settings" class="text--center">
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
					<div class="horizontal">
						<select data-action="set-language">
								<option value="English">English</option>
								<option value="Español">Español</option>
								<option value="Français">Français</option>
								<option value="日本語">日本語</option>
								<option value="Nederlands">Nederlands</option>
							</select>
						<span class="fa fa-unsorted" data-select="set-language"></span>
					</div>

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

	<!--Help Screen -->
	<section data-menu="help">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Help">Help</h2>
		<div class="text--left padded">
			<p data-string="AdvanceHelp">To advance through the game, click anywhere on the game screen or press the space key.</p>
			<h3 data-string="QuickButtons">Quick Menu Buttons</h3>
			<p><span class="fas fa-arrow-left"></span> <span data-string="BackButton">Back.</span></p>
			<p><span class="fas fa-eye"></span> <span data-string="HideButton">Hide Text.</span></p>
			<p><span class="fas fa-save"></span> <span data-string="SaveButon">Open the Save Screen.</span></p>
			<p><span class="fas fa-undo"></span> <span data-string="LoadButton">Open the Load Screen.</span></p>
			<p><span class="fas fa-cog"></span> <span data-string="SettingsButton">Open the Settings Screen.</span></p>
			<p><span class="fas fa-times-circle"></span> <span data-string="QuitButton">Quit Game.</span></p>
		</div>
	</section>
`;

class Monogatari {

	static width () {
		return getComputedStyle($_(Monogatari.selector).get (0)).width.replace ('px', '');
	}

	static height () {
		return getComputedStyle($_(Monogatari.selector).get (0)).height.replace ('px', '');
	}

	static string (key) {
		if (typeof Monogatari._translations[Monogatari.preference ('Language')] !== 'undefined') {
			if (typeof Monogatari._translations[Monogatari.preference ('Language')][key] !== 'undefined') {

			} else {
				return Monogatari._translations[Monogatari.preference ('Language')][key];
			}
		} else {
			FancyError.show (
				'Language could not be found',
				`Monogatari attempted to translate the UI using the current language set in the preferences but no translations could be found
				for it.`,
				{
					'Problematic Language': Monogatari.preference ('Language'),
					'You may have meant one of these': Object.keys (Monogatari._translations),
					'Help': {
						'_': 'Please check if you have defined correctly the translations for this language, translations are defined as follows:',
						'_1': `
							<pre>
								<code class='language-javascript'>
								Monogatari.translation ("YourLanguage", {
									"SomeString": "Your Translation"
								});
								</code>
							</pre>
						`,
						'_2': 'You may also want to check if the value of your language selector is right:',
						'_3': `
							<pre>
								<code class='language-markup'>
								${$_('[data-action="set-language"]').value ()}
								</code>
							</pre>
						`,
						'Documentation': '<a href="https://monogatari.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
					}
				}
			);
		}
	}

	static registerAction (action) {
		Monogatari._actions.push (action);
	}

	static unregisterAction (action) {
		Monogatari._actions = Monogatari._actions.filter ((a) => !(a instanceof action));
	}

	static registerComponent (component) {
		Monogatari._components.push (component);
	}

	static unregisterComponent (component) {
		Monogatari._components = Monogatari._actions.filter ((c) => !(c instanceof component));
	}

	static actions () {
		return Monogatari._actions;
	}

	static action (id, settings = null) {
		if (settings !== null) {
			Monogatari._actions.find ((a) => a.id === id).settings = Object.assign ({}, Monogatari._actions.find ((a) => a.id === id).settings, settings);
		} else {
			return Monogatari._actions.find ((a) => a.id === id);
		}
	}

	static assets (type = null, object = null) {
		if (type !== null && object !== null) {
			if (typeof Monogatari._assets[type] !== 'undefined') {
				Monogatari._assets[type] = Object.assign ({}, Monogatari._assets[type], object);
			} else {
				Monogatari._assets[type] = object;
			}
		} else if (type !== null) {
			if (typeof type === 'string') {
				return Monogatari._assets[type];
			} else if (typeof type === 'object') {
				Monogatari._assets = Object.assign ({}, Monogatari._assets, object);
			}
		} else {
			return Monogatari._assets;
		}
	}

	static asset (type, name, value = null) {
		if (typeof Monogatari._assets[type] !== 'undefined') {
			if (value !== null) {
				Monogatari._assets[type][name] = value;
			} else {
				return Monogatari._assets[type][name];
			}
		} else {
			console.error (`Tried to interact with a non-existing asset type ${type}.`);
		}
	}

	static characters (object = null) {
		if (object !== null) {
			Monogatari._characters = Object.assign ({}, Monogatari._characters, object);
		} else {
			return Monogatari._characters;
		}
	}

	static character (id, object = null) {
		if (object !== null) {
			if (typeof Monogatari._characters[id] !== 'undefined') {
				Monogatari._characters[id] = Object.assign ({}, Monogatari._characters[id], object);
			} else {
				Monogatari._characters[id] = object;
			}
		} else {
			return Monogatari._characters[id];
		}
	}

	static translation (language, strings) {
		if (typeof Monogatari._translations[language] !== 'undefined') {
			Monogatari._translations[language] = Object.assign ({}, Monogatari._translations[language], strings);
		} else {
			Monogatari._translations[language] = strings;
		}
	}

	static setting (key, value = null) {
		if (value !== null) {
			Monogatari._settings[key] = value;
		} else {
			if (typeof Monogatari._settings[key] !== 'undefined') {
				return Monogatari._settings[key];
			} else {
				console.error (`Tried to access non existent setting with name '${key}'.`);
			}
		}
	}

	static settings (object = null) {
		if (object !== null) {
			Monogatari._settings = Object.assign ({}, Monogatari._settings, object);
		} else {
			return Monogatari._settings;
		}
	}

	static preference (key, value = null) {
		if (value !== null) {
			Monogatari._preferences[key] = value;
			Monogatari.Storage.update ('Settings', Monogatari._preferences);
		} else {
			if (typeof Monogatari._preferences[key] !== 'undefined') {
				return Monogatari._preferences[key];
			} else {
				console.error (`Tried to access non existent preference with name '${key}'.`);
			}
		}
	}

	static preferences (object = null) {
		if (object !== null) {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, object);
			Monogatari.Storage.update ('Settings', Monogatari._preferences);
		} else {
			return Monogatari._preferences;
		}
	}

	static status (object = null) {
		if (object !== null) {
			Monogatari._status = Object.assign ({}, Monogatari._status, object);
		} else {
			return Monogatari._status;
		}
	}

	static storage (object = null) {
		if (object !== null) {
			Monogatari._storage = Object.assign ({}, Monogatari._storage, object);
		} else {
			return Monogatari._storage;
		}
	}

	static script (object = null) {
		if (typeof object === 'object' && object !== null) {
			Monogatari._script = Object.assign ({}, Monogatari._script, object);
		} else if (typeof object === 'string') {
			return Monogatari._script[object];
		} else {
			return Monogatari._script;
		}
	}

	static label (key, language = null, value = null) {
		if (typeof language === 'string' && value !== null) {
			if (typeof Monogatari._script[language] !== 'object') {
				Monogatari._script[language] = {};
			}
			Monogatari._script[language][key] = value;
		} else if (typeof language === 'object' && value === null) {
			if (typeof Monogatari._script[key] !== 'object') {
				Monogatari._script[key] = [];
			}
			Monogatari._script[key] = language;
		} else if (typeof language === 'string' && value === null) {
			return Monogatari._script[language][key];
		} else {
			return Monogatari._script[key];
		}
	}

	static fn (name, { apply = () => true, revert = () => true }) {
		if (typeof apply !== 'function' && typeof revert !== 'function') {
			return Monogatari._functions [name];
		} else {
			Monogatari._functions [name] = {
				apply,
				revert
			};
		}
	}

	static globals (object = null) {
		if (object !== null) {
			Monogatari._globals = Object.assign ({}, Monogatari._globals, object);
		} else {
			return Monogatari._globals;
		}
	}

	static global (key, value) {
		if (typeof value !== 'undefined') {
			Monogatari._globals[key] = value;
		} else {
			return Monogatari._globals[key];
		}
	}

	/**
	 * Localize every element with a data-string property using the translations
	 * available. If no translation is found for the current language, the current
	 * text of the element will be kept.
	 */
	static localize () {

		$_('[data-string]').each ((element) => {
			const string_translation = Monogatari.string ($_(element).data ('string'));

			// Check if the translation actually exists and is not empty before
			//replacing the text.
			if (typeof string_translation !== 'undefined' && string_translation !== '') {
				$_(element).text (string_translation);
			}
		});
		Monogatari.setSlots ();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Preload game assets
	 */
	static preload () {
		const promises = [];
		let assetCount = 0;

		// Check if asset preloading is enabled. Preloading will not be done in
		// electron or cordova since the assets are expected to be available
		// locally.
		if (Monogatari.setting ('Preload') && !Platform.electron () && !Platform.cordova ()) {

			// Show loading screen
			$_('[data-menu="loading"]').show ();

			for (const category of Object.keys (Monogatari.assets ())) {
				for (const asset of Object.values (Monogatari.assets (category))) {
					if (FileSystem.isImage (asset)) {
						promises.push (Preload.image (`assets/${category}/${asset}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					} else {
						promises.push (Preload.file (`assets/${category}/${asset}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}
			}

			for (const character in Monogatari.characters ()) {
				let directory = '';

				// Check if the character has a directory defined where its images
				// are located
				if (typeof character.Directory !== 'undefined') {
					directory = character.Directory + '/';
				}

				if (typeof character.Images !== 'undefined') {
					for (const image of Object.values (character.Images)) {
						promises.push (Preload.image ('assets/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Side !== 'undefined') {
					for (const image of Object.values (character.Side)) {
						promises.push (Preload.image ('assets/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Face !== 'undefined') {
					promises.push (Preload.image ('assets/characters/' + directory + character.Face).finally (() => {
						$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
					}));
					assetCount += 1;
				}
			}

			$_('[data-ui="load-progress"]').attribute ('max', assetCount);
			return Promise.all (promises);
		} else {
			return Promise.resolve ();
		}
	}

	static replaceVariables (statement) {
		const matches = statement.match (/{{\S+}}/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('{{', '').replace ('}}', '').split ('.');

				let data = Monogatari.storage ()[path[0]];

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}
		}
		return statement;
	}

	static addSlot (i, data) {
		const name = data.Name ? data.Name : data.Date;
		if (typeof Monogatari.asset ('scenes', data.Engine.Scene) !== 'undefined') {

			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.Engine.Scene)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.Engine.Scene)}' alt=''>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);

		} else {
			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);
		}
	}

	static addAutoSlot (i, data) {
		const name = data.Name ? data.Name : data.Date;

		if (typeof Monogatari.asset ('scenes', data.Engine.Scene) !== 'undefined') {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.Engine.Scene)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		}
	}

	static setAutoSlots () {
		if (!window.localStorage) {
			return false;
		}

		const element = $_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]');

		element.html ('');

		Monogatari.Storage.keys ().then ((keys) => {
			const savedData = keys.filter ((key) => {
				return key.indexOf (Monogatari.setting ('AutoSaveLabel')) === 0;
			}).sort ((a, b) => {
				const aNumber = parseInt (a.split (Monogatari.setting ('AutoSaveLabel'))[1]);
				const bNumber = parseInt (b.split (Monogatari.setting ('AutoSaveLabel'))[1]);

				if (aNumber > bNumber) {
					return 1;
				} else if (aNumber < bNumber) {
					return -1;
				} else {
					return 0;
				}
			});

			for (let i = 0; i < savedData.length; i++) {
				const label = savedData[i];
				if (label.indexOf (Monogatari.setting ('AutoSaveLabel')) === 0) {
					Monogatari.Storage.get (savedData[i]).then ((slot) => {
						const id = label.split (Monogatari.setting ('AutoSaveLabel'))[1];
						if (slot !== null && slot !== '') {
							Monogatari.addAutoSlot (id, slot);
						}
					});
				}
			}

			// Check if there are no Auto Saved games.
			if (element.html ().trim () === '') {
				element.html (`<p>${Monogatari.string ('NoAutoSavedGames')}</p>`);
			}
		});
	}

	// Create all save and load slots
	static setSlots () {
		if (!window.localStorage) {
			return false;
		}

		$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').html ('');
		$_('[data-menu="save"] [data-ui="slots"]').html ('');

		$_('[data-menu="save"] [data-input="slotName"]').value (Monogatari.niceDateTime ());

		return Monogatari.Storage.keys ().then ((keys) => {
			const savedData = keys.filter ((key) => {
				return key.indexOf (Monogatari.setting ('SaveLabel')) === 0;
			}).sort ((a, b) => {
				const aNumber = parseInt (a.split (Monogatari.setting ('SaveLabel'))[1]);
				const bNumber = parseInt (b.split (Monogatari.setting ('SaveLabel'))[1]);

				if (aNumber > bNumber) {
					return 1;
				} else if (aNumber < bNumber) {
					return -1;
				} else {
					return 0;
				}
			});

			const promises = [];
			for (let i = 0; i < savedData.length; i++) {
				const label = savedData[i];
				promises.push(Monogatari.Storage.get (label).then ((slot) => {
					const id = label.split (Monogatari.setting ('SaveLabel'))[1];
					if (slot !== null && slot !== '') {
						Monogatari.addSlot (id, slot);
					}
				}));
			}

			return Promise.all (promises).then (() => {

				// Check if there are no Saved games.
				if ($_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').html ().trim() === '') {
					$_('[data-menu="save"] [data-ui="slots"]').html (`<p>${Monogatari.string ('NoSavedGames')}</p>`);
				}
				Monogatari.setAutoSlots ();
			});
		});
	}

	// Get's the highest number currently available as a slot id (Save_{?})
	static getMaxSlotId () {
		return Monogatari.Storage.keys ().then ((keys) => {
			let max = 1;
			for (const saveKey of keys) {
				if (saveKey.indexOf (Monogatari.setting ('SaveLabel')) === 0) {
					const number = parseInt(saveKey.split (Monogatari.setting ('SaveLabel'))[1]);
					if (number > max) {
						max = number;
					}
				}
			}
			return max;
		});
	}

	static newSave (name) {
		// Check if the player is actually playing
		if (Monogatari.global ('playing')) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			Monogatari.getMaxSlotId ().then ((max) => {
				Monogatari.Storage.set (Monogatari.setting ('SaveLabel') + (max + 1) , {
					'Name': name,
					'Date': Monogatari.niceDateTime (),
					'Engine': Monogatari.settings (),
					'Show': show,
					'Label': Monogatari.setting ('Label'),
					'Storage': Monogatari.storage ()
				}).then (({ value }) => {
					Monogatari.addSlot (max + 1, value);
					document.body.style.cursor = 'auto';
				});
			});
		}
	}

	static autoSave (id, slot) {
		if (Monogatari.global ('playing')) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			const name = Monogatari.niceDateTime ();

			Monogatari.Storage.set (slot, {
				'Name': name,
				'Date': name,
				'Engine': Monogatari.settings (),
				'Show': show,
				'Label': Monogatari.setting ('Label'),
				'Storage': Monogatari.storage ()
			}).then (() => {
				$_(`[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (name);
				$_(`[data-menu='save'] [data-ui='autoSaveSlots'] [data-ui='slots'] [data-save='${id}'] small`).text (name);
				document.body.style.cursor = 'auto';
			});
		}
	}

	static saveToSlot (id, slot, customName) {
		// Check if the player is actually playing
		if (Monogatari.global ('block')) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			// Get the name of the Slot if it exists or use the current date.
			Monogatari.Storage.get (slot).then ((data) => {
				let name;

				if (data !== null && data !== '') {
					data = JSON.parse (data);
					if (data.Name !== null && data.Name !== '' && typeof data.Name !== 'undefined') {
						name = data.Name;
					} else {
						name = Monogatari.niceDateTime ();
					}
				} else {
					name = Monogatari.niceDateTime ();
				}

				if (typeof customName !== 'undefined') {
					name = customName;
				}

				Monogatari.Storage.set (slot, {
					'Name': name,
					'Date': Monogatari.niceDateTime (),
					'Engine': Monogatari.settings (),
					'Show': show,
					'Label': Monogatari.setting ('Label'),
					'Storage': Monogatari.storage ()
				}).then (() => {
					$_(`[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (name);
					$_(`[data-menu='save'] [data-ui='slots'] [data-save='${id}'] small`).text (name);
					document.body.style.cursor = 'auto';
				});
			});
		}
	}

	static loadFromSlot (slot) {
		document.body.style.cursor = 'wait';
		Monogatari.global ('playing', true);

		Monogatari.resetGame ();

		$_('section').hide();
		$_('#game').show();
		Monogatari.Storage.get (slot).then ((data) => {
			Monogatari.settings ({
				'Label': data.Engine.Label,
				'Song': data.Engine.Song,
				'Sound': data.Engine.Sound,
				'Scene': data.Engine.Scene,
				'Particles': data.Engine.Particles,
				'Step': data.Engine.Step,
				'MusicHistory': data.Engine.MusicHistory,
				'SoundHistory': data.Engine.SoundHistory,
				'ImageHistory': data.Engine.ImageHistory,
				'CharacterHistory': data.Engine.CharacterHistory,
				'SceneHistory': data.Engine.SceneHistory,
				'SceneElementsHistory': data.Engine.SceneElementsHistory,
				'ParticlesHistory': data.Engine.ParticlesHistory
			});
			Monogatari.storage (Object.assign({}, JSON.parse(Monogatari.global ('storageStructure')), data.Storage));

			Monogatari.global ('label', Monogatari.global ('game')[data.Label]);

			for (const i in data.Show.split(',')) {
				if (data.Show.split(',')[i].trim() != '') {
					$_('#game').append(data.Show.split(',')[i]);
				}
			}

			$_('[data-ui="background"]').fadeOut(200, function () {

				if (typeof Monogatari.asset ('scenes', data.Engine.Scene) !== 'undefined') {
					$_('[data-ui="background"]').style('background', 'url(assets/scenes/' + Monogatari.asset ('scenes', data.Engine.Scene) + ') center / cover no-repeat');
				} else {
					$_('[data-ui="background"]').style('background', data.Engine.Scene);
				}

				$_('[data-ui="background"]').fadeIn(200);
			});

			if (Monogatari.setting ('Song') !== '') {
				Monogatari.run (Monogatari.setting ('Song'), false);
			}

			if (Monogatari.setting ('Sound') != '') {
				Monogatari.run (Monogatari.setting ('Sound'), false);
			}

			if (Monogatari.setting ('Particles') !== '' && typeof Monogatari.setting ('Particles') === 'string') {
				Monogatari.run (Monogatari.setting ('Particles'), false);
			}

			$_('#game').show();
			Monogatari.run(Monogatari.global ('label')[Monogatari.setting ('Step')]);
			document.body.style.cursor = 'auto';
		});
	}

	static niceDateTime () {
		return new Date ().toLocaleString ();
	}

	// Assert the result of a function
	static assertAsync (callable, self = null, args = null) {
		Monogatari.global ('block', true);
		return new Promise (function (resolve, reject) {
			const result = callable.apply(self, args);
			// Check if the function returned a simple boolean
			// if the return value is true, the game will continue
			if (typeof result === 'boolean') {
				if (result) {
					resolve ();
				} else {
					reject ();
				}
			} else if (typeof result === 'object') {
				// Check if the result was a promise
				if (typeof result.then != 'undefined') {

					result.then(function (value) {
						if (typeof value === 'boolean') {
							if (value) {
								resolve ();
							} else {
								reject ();
							}
						}
					});
				} else {
					resolve ();
				}
			} else {
				reject ();
			}
		});
	}

	static canProceed () {
		if (!$_('[data-ui="choices"]').isVisible ()
			&& $_('#game').isVisible ()
			&& !$_('[data-component="modal"]').isVisible ()
			&& (
				$_('[data-ui="text"]').isVisible ()
				|| (
					!$_('[data-ui="text"]').isVisible ()
					&& $_('[data-ui="centered"]').isVisible ()
				)
			)
			&& !$_('[data-component="video"]').isVisible ()
			&& !Monogatari.global ('block')) {
			return true;
		} else {
			return false;
		}
	}

	static playAmbient () {
		if (Monogatari.setting ('MenuMusic') !== '') {
			Monogatari.ambientPlayer.setAttribute ('loop', '');

			if (typeof Monogatari.asset ('music', Monogatari.setting ('MenuMusic')) !== 'undefined') {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.asset ('music', Monogatari.setting ('MenuMusic')));
			} else {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.setting ('MenuMusic'));
			}
			Monogatari.ambientPlayer.play();
		}
	}

	// Stop the main menu's music
	static stopAmbient () {
		if (!Monogatari.ambientPlayer.paused) {
			Monogatari.ambientPlayer.pause ();
		}
	}

	// Stop the voice player
	static shutUp () {
		if (!Monogatari.voicePlayer.paused && typeof Monogatari.voicePlayer.src !== 'undefined' && Monogatari.voicePlayer.src != '') {
			Monogatari.voicePlayer.pause ();
			Monogatari.voicePlayer.currentTime = 0;
		}
	}

	static changeWindowResolution (resolution) {
		if (Platform.electron ()) {
			const remote = require ('electron').remote;
			const win = remote.getCurrentWindow ();
			const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
			if (resolution) {
				win.setResizable (true);

				if (resolution == 'fullscreen' && !win.isFullScreen () && win.isFullScreenable ()) {
					win.setFullScreen(true);
					Monogatari.preference ('Resolution', resolution);
				} else if (resolution.indexOf ('x') > -1) {
					win.setFullScreen (false);
					const size = resolution.split ('x');
					const chosenWidth = parseInt (size[0]);
					const chosenHeight = parseInt (size[1]);

					if (chosenWidth <= width && chosenHeight <= height) {
						win.setSize(chosenWidth, chosenHeight, true);
						Monogatari.preference ('Resolution', resolution);
					}
				}
				win.setResizable (false);
			}
		}
	}

	static electronSetup () {
		// Set the electron quit handler.
		if (Platform.electron ()) {
			const remote = require ('electron').remote;
			const win = remote.getCurrentWindow ();

			$_('[data-action="set-resolution"]').value (Monogatari.preference ('Resolution'));

			window.addEventListener ('beforeunload', (event) => {
				event.preventDefault ();
				$_('[data-notice="exit"]').addClass ('modal--active');
			});

			if (!win.isResizable ()) {
				const aspectRatio = Monogatari.setting ('AspectRatio').split (':');
				const aspectRatioWidth = parseInt (aspectRatio[0]);
				const aspectRatioHeight = parseInt (aspectRatio[1]);
				win.setResizable (true);
				const minSize = win.getMinimumSize ();
				const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
				win.setResizable (false);

				for (let i = 0; i < 488; i+=8) {
					const calculatedWidth = aspectRatioWidth * i;
					const calculatedHeight = aspectRatioHeight * i;

					if (calculatedWidth >= minSize[0] && calculatedHeight >= minSize[1] && calculatedWidth <= width && calculatedHeight <= height) {
						$_('[data-action="set-resolution"]').append(`<option value="${calculatedWidth}x${calculatedHeight}">${Monogatari.string ('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
					}
				}

				$_('[data-action="set-resolution"]').append(`<option value="fullscreen">${Monogatari.string ('FullScreen')}</option>`);

				Monogatari.changeWindowResolution (Monogatari.preference ('Resolution'));
				$_('[data-action="set-resolution"]').change(function () {
					const size = $_(this).value ();
					Monogatari.changeWindowResolution (size);
				});
			} else {
				$_('[data-settings="resolution"]').hide ();
			}

		} else {
			$_('[data-platform="electron"]').hide ();
		}
	}

	static whipeText () {
		if (Monogatari.global ('textObject') !== null) {
			Monogatari.global ('textObject').destroy ();
		}
		$_('[data-ui="who"]').html ('');
		$_('[data-ui="say"]').html ('');
	}

	static hideGameElements () {
		// Hide in-game elements
		$_('[data-ui="choices"]').hide ();
		$_('[data-ui="choices"]').html ('');

		$_('[data-component="modal"]').removeClass ('modal--active');
		$_('[data-ui="messages"]').removeClass ('modal--active');
		$_('[data-component="video"]').removeClass ('modal--active');

		$_('[data-ui="centered"]').remove ();
		$_('#game [data-character]').remove ();
		$_('#game [data-image]').remove ();

		$_('[data-ui="input"] [data-ui="warning"]').text ('');

		$_('[data-ui="background"]').style ('background', 'initial');
		Monogatari.whipeText ();
	}

	static resetGame () {

		for (const action of Monogatari.actions ()) {
			action.reset ();
		}

		Monogatari.hideGameElements();

		clearInterval (Monogatari.global ('autoPlay'));
		Monogatari.global ('autoPlay', null);

		$_('[data-action="auto-play"].fa').removeClass ('fa-stop-circle');
		$_('[data-action="auto-play"].fa').addClass ('fa-play-circle');

		// Reset Storage
		Monogatari.storage (JSON.parse(Monogatari.global ('storageStructure')));

		// Reset Conditions
		Monogatari.setting ('Label', Monogatari.setting ('startLabel'));
		Monogatari.global ('label', Monogatari.global ('game')[Monogatari.setting ('Label')]);
		Monogatari.setting ('Step', 0);

		// Reset History
		Monogatari.setting ('MusicHistory', []);
		Monogatari.setting ('SoundHistory', []);
		Monogatari.setting ('ImageHistory', []);
		Monogatari.setting ('CharacterHistory', []);
		Monogatari.setting ('SceneHistory', []);
		Monogatari.setting ('SceneElementsHistory', []);
		Monogatari.setting ('ParticlesHistory', []);

		// Reset other States
		Monogatari.setting ('Sound', '');
		Monogatari.setting ('Song', '');
		Monogatari.setting ('Particles', '');
		Monogatari.setting ('Scene', '');
	}

	static next () {
		Monogatari.setting ('Step', Monogatari.setting ('Step') + 1);
		Monogatari.run (Monogatari.global ('label')[Monogatari.setting ('Step')]);
	}

	// Start game automatically withouth going trough the main menu
	static showMainMenu () {
		if (!Monogatari.setting ('ShowMenu')) {
			Monogatari.stopAmbient ();
			Monogatari.global ('playing', true);
			$_('section').hide ();
			$_('#game').show ();
			Monogatari.run (Monogatari.global ('label')[Monogatari.setting ('Step')]);
		} else {
			$_('[data-menu="main"]').show ();
		}
	}

	static continue () {
		if (Monogatari.canProceed ()) {
			if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {
				const str = Monogatari.global ('textObject').strings [0];
				const element = $_(Monogatari.global ('textObject').el).data ('ui');
				Monogatari.global ('textObject').destroy ();
				if (element == 'centered') {
					$_('[data-ui="centered"]').html (str);
				} else {
					$_('[data-ui="say"]').html (str);
				}
				Monogatari.global ('finishedTyping', true);
			} else {
				Monogatari.action ('Centered').hide();
				Monogatari.shutUp();
				Monogatari.next ();
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Function to execute the previous statement in the script.
	static revert () {

		Monogatari.action ('Centered').hide ();
		Monogatari.shutUp ();


		if (Monogatari.setting ('Step') >= 1) {

			let flag = true;
			while (Monogatari.setting ('Step') > 0 && flag) {
				for (const action of Monogatari.actions ()) {
					let actionStatement = Monogatari.global ('label')[Monogatari.setting ('Step') - 1];
					let matches = false;

					if (typeof actionStatement === 'string') {
						actionStatement = actionStatement.split (' ');
						matches = action.matchString (actionStatement);
					} else if (typeof actionStatement === 'object') {
						matches = action.matchObject (actionStatement);
					}

					if (matches === true) {
						const act = new action (actionStatement);
						act.setContext (Monogatari);

						return act.willRevert ().then (() => {
							return act.revert ().then (() => {
								return act.didRevert (). then (() => {
									Monogatari.setting ('Step', Monogatari.setting ('Step') - 1);
								});
							});
						}).catch (() => {
							flag = false;
						});
					}
				}
			}
		}
	}

	static run (statement, advance) {

		if (typeof advance !== 'boolean') {
			advance = true;
		}

		for (const action of Monogatari.actions ()) {
			let actionStatement = statement;
			let matches = false;

			if (typeof statement === 'string') {
				actionStatement = Monogatari.replaceVariables (statement).split (' ');
				matches = action.matchString (actionStatement);
			} else if (typeof statement === 'object') {
				matches = action.matchObject (statement);
			} else if (typeof actionStatement === 'function') {
				Monogatari.global ('block', true);
				return Util.callAsync (actionStatement, Monogatari).finally (() => {
					Monogatari.global ('block', false);
					if (advance) {
						Monogatari.next ();
					}
				});
			}

			if (matches === true) {
				const act = new action (actionStatement);
				act.setContext (Monogatari);

				return act.willApply ().then (() => {
					return act.apply (advance).then (() => {
						return act.didApply ();
					});
				});
			}
		}
	}

	static setup (selector) {

		$_(selector).html (HTML);
		// Set the initial settings if they don't exist or load them.
		Monogatari.Storage.get ('Settings').then ((local_settings) => {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, local_settings);
		}).catch (() => {
			Monogatari.Storage.set ('Settings', Monogatari._preferences);
		});

		// Set the startLabel property, which will be used when the game is reset.
		Monogatari.setting ('startLabel', Monogatari.setting ('Label'));

		// Register service worker
		if (Monogatari.setting ('ServiceWorkers')) {
			if (!Platform.electron () && !Platform.cordova () && Platform.serviceWorkers ()) {
				//navigator.serviceWorker.register ('./../service-worker.js');
			} else {
				console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
			}
		}

		Monogatari.global ('storageStructure', JSON.stringify(Monogatari.storage ()));

		for (const action of Monogatari.actions ()) {
			action.setup (selector);
		}
	}

	/**
	 * Every event listener should be binded in this function.
	 */
	static bind (selector) {
		// Fix for select labels
		$_('[data-select]').click (function () {
			const e = document.createEvent ('MouseEvents');
			e.initMouseEvent ('mousedown');
			$_(`[data-action='${$_(this).data ('select')}']`).get (0). dispatchEvent (e);
		});

		// Bind Language select so that every time a language is selected, the
		// ui and game get correctly localized.
		$_('[data-action="set-language"]').change (function () {
			Monogatari.setting ('Language', $_(this).value ());
			Monogatari.localize ();
		});

		// Add the orientation checker in case that a specific orientation was
		// defined.
		if (Monogatari.setting ('Orientation') !== 'any' && Platform.mobile ()) {

			// Set the event listener for device orientation so we can display a message
			window.addEventListener ('orientationchange', () => {
				if (Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_('[data-notice="orientation"]').addClass ('modal--active');
				} else {
					$_('[data-notice="orientation"]').removeClass ('modal--active');
				}
			}, false);
		}

		// Add event listener for back buttons. If the player is plaing, the back
		// button will return to the game, if its not playing, then it'll return
		// to the main menu.
		$_('[data-menu]').on ('click', '[data-action="back"]:not(#game), [data-action="back"]:not(#game) *', () => {
			//event.stopPropagation ();
			$_('section').hide ();
			if (Monogatari.global ('playing')) {
				$_('#game').show ();
			} else {
				$_('[data-menu="main"]').show ();
			}
		});

		// Save to slot when a slot is pressed.
		$_('[data-menu="save"]').on ('click', 'figcaption, img, small', function () {
			Monogatari.global ('overwriteSlot', $_(this).parent ().data ('save'));
			Monogatari.Storage.get (Monogatari.setting ('SaveLabel') + Monogatari.global ('overwriteSlot')).then ((data) => {
				if (typeof data.Name !== 'undefined') {
					$_('[data-notice="slot-overwrite"] input').value (data.Name);
				} else {
					$_('[data-notice="slot-overwrite"] input').value (data.Date);
				}
				$_('[data-notice="slot-overwrite"]').addClass ('modal--active');
			});
		});

		$_('[data-menu="save"], [data-menu="load"]').on ('click', '[data-delete]', function () {
			Monogatari.global ('deleteSlot', $_(this).data ('delete'));
			Monogatari.Storage.get (Monogatari.setting ('SaveLabel') + Monogatari.global ('deleteSlot')).then ((data) => {
				if (typeof data.Name !== 'undefined') {
					$_('[data-notice="slot-deletion"] small').text (data.Name);
				} else {
					$_('[data-notice="slot-deletion"] small').text (data.Date);
				}

				$_('[data-notice="slot-deletion"]').addClass ('modal--active');
			});
		});

		Monogatari.ambientPlayer = document.querySelector ('[data-component="ambient"]');
		Monogatari.musicPlayer = document.querySelector ('[data-component="music"]');
		Monogatari.soundPlayer = document.querySelector ('[data-component="sound"]');
		Monogatari.videoPlayer = document.querySelector ('[data-ui="player"]');
		Monogatari.voicePlayer = document.querySelector ('[data-component="voice"]');

		// Volume bars listeners
		$_('[data-action="set-volume"]').on ('change mouseover', function () {
			const v = document.querySelector (`[data-component='${$_(this).data('target')}']`);
			const value = $_(this).value();

			switch ($_(this).data('target')) {
				case 'music':
					Monogatari.ambientPlayer.volume = value;
					v.volume = value;
					Monogatari.preference ('Volume').Music = value;
					break;

				case 'voice':
					v.volume = value;
					Monogatari.preference ('Volume').Voice = value;
					break;

				case 'sound':
					v.volume = value;
					Monogatari.preference ('Volume').Sound = value;
					break;
			}
			Monogatari.Storage.set ('Settings', Monogatari.preferences ());
		});

		$_('[data-action="set-text-speed"]').on ('change mouseover', function () {
			const value =  Monogatari.setting ('maxTextSpeed') - parseInt($_(this).value());
			Monogatari.global ('typedConfiguration').typeSpeed = value;
			Monogatari.preference ('TextSpeed', value);
		});

		$_('[data-action="set-auto-play-speed"]').on ('change mouseover', function () {
			const value = Monogatari.setting ('maxAutoPlaySpeed') - parseInt($_(this).value());
			Monogatari.preference ('AutoPlaySpeed', value);
		});

		// Language select listener
		$_('[data-action="set-language"]').change (() => {
			Monogatari.global ('game', Monogatari.script (Monogatari.preference ('Language')));
			Monogatari.global ('label', Monogatari.global ('game')[Monogatari.setting ('Label')]);
		});

		$_('#game [data-ui="quick-menu"], #game [data-ui="quick-menu"] *').click ((event) => {
			// Clicked Child
			event.stopPropagation ();
		});

		$_('body').on('click', '[data-do]', function () {
			Monogatari.action ('Centered').hide ();
			Monogatari.shutUp ();
			if ($_(this).data('do') != 'null' && $_(this).data('do') != '') {
				try {
					$_('[data-ui="choices"]').hide ();
					$_('[data-ui="choices"]').html ('');
					Monogatari.run ($_(this).data ('do'), false);
				} catch (e) {
					console.error('An error ocurred while trying to execute the choice\'s action.\n' + e);
				}
			}
		});

		$_('#game').click (function () {
			Monogatari.continue ();
		});

		$_('[data-action], [data-action] *').click(function () {

			switch ($_(this).data('action')) {

				case 'open-menu':
					$_('section').hide();

					if ($_(this).data('open') == 'save') {
						$_('[data-menu="save"] [data-input="slotName"]').value (Monogatari.niceDateTime ());
					}

					$_('[data-menu="' + $_(this).data('open') + '"]').show();

					break;

				case 'start':
					Monogatari.stopAmbient();
					Monogatari.global ('playing', true);
					$_('section').hide();
					$_('#game').show();
					Monogatari.run (Monogatari.global ('label')[Monogatari.setting ('Step')]);
					break;

				case 'close':
					$_('[data-ui="' + $_(this).data('close') + '"]').removeClass('active');
					break;

				case 'dismiss-notice':
					$_('[data-notice]').removeClass('modal--active');
					break;

				case 'distraction-free':
					if ($_(this).hasClass('fa-eye')) {
						$_(this).removeClass('fa-eye');
						$_(this).addClass('fa-eye-slash');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Show'));
						$_('[data-ui="quick-menu"]').addClass ('transparent');
						$_('[data-ui="text"]').hide();
					} else if ($_(this).hasClass('fa-eye-slash')) {
						$_(this).removeClass('fa-eye-slash');
						$_(this).addClass('fa-eye');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Hide'));
						$_('[data-ui="quick-menu"]').removeClass ('transparent');
						$_('[data-ui="text"]').show();
					} else if ($_(this).text () === Monogatari.string ('Show')) {
						$_(this).text (Monogatari.string('Hide'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye-slash');
						$_(this).parent ().find ('.fas').addClass ('fa-eye');
						$_('[data-ui="quick-menu"]').removeClass ('transparent');
						$_('[data-ui="text"]').show ();
					} else if ($_(this).text () === Monogatari.string ('Hide')) {
						$_(this).text (Monogatari.string ('Show'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye');
						$_(this).parent ().find ('.fas').addClass ('fa-eye-slash');
						$_('[data-ui="quick-menu"]').addClass ('transparent');
						$_('[data-ui="text"]').hide ();
					}
					break;

				case 'auto-play':
					if ($_(this).hasClass('fa-play-circle')) {
						$_(this).removeClass('fa-play-circle');
						$_(this).addClass('fa-stop-circle');
						Monogatari.global ('autoPlay', setTimeout (function () {
							if (Monogatari.canProceed() && Monogatari.global ('finishedTyping')) {
								Monogatari.action ('Centered').hide();
								Monogatari.shutUp();
								Monogatari.next ();
							}
						}, Monogatari.preference ('AutoPlaySpeed') * 1000));
					} else if ($_(this).hasClass('fa-stop-circle')) {
						$_(this).removeClass('fa-stop-circle');
						$_(this).addClass('fa-play-circle');
						clearTimeout (Monogatari.global ('autoPlay'));
						Monogatari.global ('autoPlay', null);
					} else if ($_(this).text () === Monogatari.string ('AutoPlay')) {
						$_(this).text (Monogatari.string('Stop'));
						Monogatari.global ('autoPlay', setTimeout(function () {
							if (Monogatari.canProceed() && Monogatari.global ('finishedTyping')) {
								Monogatari.action ('Centered').hide();
								Monogatari.shutUp();
								Monogatari.next ();
							}
						}, Monogatari.preference ('AutoPlaySpeed') * 1000));
					} else if ($_(this).text () === Monogatari.string ('Stop')) {
						$_(this).text (Monogatari.string ('AutoPlay'));
						clearTimeout (Monogatari.global ('autoPlay'));
						Monogatari.global ('autoPlay', null);
					}
					break;

				case 'save':
					var slotName = $_('[data-menu="save"] [data-input="slotName"]').value ().trim ();
					if (slotName !== '') {
						Monogatari.newSave (slotName);
					}
					break;

				case 'delete-slot':
					Monogatari.Storage.remove (Monogatari.setting ('SaveLabel') + Monogatari.global ('deleteSlot'));
					$_(`[data-load-slot="${Monogatari.global ('deleteSlot')}"], [data-save="${Monogatari.global ('deleteSlot')}"]`).remove ();
					Monogatari.global ('deleteSlot', null);
					$_('[data-notice="slot-deletion"]').removeClass ('modal--active');
					break;

				case 'overwrite-slot':
					var customName = $_('[data-notice="slot-overwrite"] input').value ().trim ();
					if (customName !== '') {
						Monogatari.saveToSlot (Monogatari.global ('overwriteSlot'), Monogatari.setting ('SaveLabel') + Monogatari.global ('overwriteSlot'), customName);
						Monogatari.global ('overwriteSlot', null);
						$_('[data-notice="slot-overwrite"]').removeClass ('modal--active');
					}
					break;
			}
			return false;
		});

		$_('#game [data-action="back"], #game [data-action="back"] *').click ((event) => {
			event.stopPropagation ();
			if (Monogatari.canProceed ()) {
				Monogatari.revert ();
			}
		});

		/**
		 * ==========================
		 * In-Game Event Handlers
		 * ==========================
		 **/

		$_(document).keyup ((e) => {
			if (e.target.tagName.toLowerCase () != 'input') {
				switch (e.which) {

					// Escape Key
					case 27:
						if ($_('#game').isVisible ()) {
							$_('#game').hide ();
							$_('[data-menu="settings"]').show();
						} else if ($_('[data-menu="settings"]').isVisible () && Monogatari.global ('playing')) {
							$_('[data-menu="settings"]').hide ();
							$_('#game').show ();
						}
						break;

					// Spacebar and Right Arrow
					case 32:
					case 39:
						Monogatari.continue ();
						break;

					// Left Arrow
					case 37:
						Monogatari.revert ();
						break;

					// H Key
					case 72:
						event.stopPropagation();
						if ($_('[data-action="distraction-free"]').hasClass ('fa-eye')) {
							$_('[data-action="distraction-free"]').removeClass ('fa-eye');
							$_('[data-action="distraction-free"]').addClass ('fa-eye-slash');
							$_('[data-ui="text"]').hide ();
						} else if ($_('[data-action="distraction-free"]').hasClass ('fa-eye-slash')) {
							$_('[data-action="distraction-free"]').removeClass ('fa-eye-slash');
							$_('[data-action="distraction-free"]').addClass ('fa-eye');
							$_('[data-ui="text"]').show ();
						}
						break;

					// Exit this handler for other keys to run normally
					default:
						return;
				}
			}

			e.preventDefault();
		});

		// Load a saved game slot when it is pressed
		$_('[data-menu="load"] [data-ui="saveSlots"]').on ('click', 'figcaption, img', function () {
			Monogatari.loadFromSlot (Monogatari.setting ('SaveLabel') + $_(this).parent().data('loadSlot'));
		});

		// Load an autosaved game slot when it is pressed
		$_('[data-menu="load"] [data-ui="autoSaveSlots"]').on ('click', 'figcaption, img', function () {
			Monogatari.loadFromSlot (Monogatari.setting ('AutoSaveLabel') + $_(this).parent().data('loadSlot'));
		});

		for (const action of Monogatari.actions ()) {
			action.bind (selector);
		}
	}

	static init (selector = '#monogatari') {
		Monogatari.selector = selector;
		FancyError.init ();

		Monogatari.setup (selector);
		Monogatari.bind (selector);

		// Set the game language or hide the option if the game is not multilingual
		if (Monogatari.setting ('MultiLanguage')) {
			Monogatari.global ('game', Monogatari.script (Monogatari.preference ('Language')));
			$_('[data-action="set-language"]').value (Monogatari.preference ('Language'));
		} else {
			Monogatari.global ('game', Monogatari.script ());
			$_('[data-settings="language"]').hide ();
		}

		// Set the initial language translations
		Monogatari.localize ();

		// Set the label in which the game will start
		Monogatari.global ('label', Monogatari.global ('game')[Monogatari.setting ('Label')]);

		// Check if the orientation is correct, if it's not, show the warning
		// message so the player will rotate its device.
		if (Platform.mobile () && Platform.orientation () !== Monogatari.setting ('Orientation')) {
			$_('[data-notice="orientation"]').addClass ('modal--active');
		}

		// Set all the dynamic backgrounds of the data-background property
		$_('[data-background]').each ((element) => {
			const background = $_(element).data ('background');
			if (background.indexOf ('.') > -1) {
				$_(element).style ('background', `url('${background}') center / cover no-repeat`);
			} else {
				$_(element).style ('background', background);
			}
		});

		// Disable audio settings in iOS since they are not supported
		if (Platform.mobile ('iOS')) {
			// iOS handles the volume using the system volume, therefore there is now way to
			// handle each of the sound sources individually and as such, this is disabled.
			$_('[data-settings="audio"]').html (`<p>${Monogatari.string ('iOSAudioWarning')}</p>`);
		}

		// Disable the load and save slots in case Local Storage is not supported.
		if (!window.localStorage) {
			$_('[data-ui="slots"]').html (`<p>${Monogatari.string ('LocalStorageWarning')}</p>`);
		}

		Monogatari.electronSetup ();

		// Remove the Text Speed setting if the type animation was disabled
		if (Monogatari.setting ('TypeAnimation') === false) {
			$_('[data-settings="text-speed"]').hide ();
		}

		Monogatari.setting ('maxTextSpeed', parseInt ($_('[data-action="set-text-speed"]').property ('max')));
		Monogatari.setting ('maxAutoPlaySpeed', parseInt ($_('[data-action="set-auto-play-speed"]').property ('max')));

		// Set the volume of all the media components
		Monogatari.musicPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.ambientPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.voicePlayer.volume = Monogatari.preference ('Volume').Voice;
		Monogatari.soundPlayer.volume = Monogatari.preference ('Volume').Sound;
		document.querySelector ('[data-target="music"]').value = Monogatari.preference ('Volume').Music;
		document.querySelector ('[data-target="voice"]').value = Monogatari.preference ('Volume').Voice;
		document.querySelector ('[data-target="sound"]').value = Monogatari.preference ('Volume').Sound;

		document.querySelector('[data-action="set-text-speed"]').value = Monogatari.preference ('TextSpeed');
		document.querySelector('[data-action="set-auto-play-speed"]').value = Monogatari.preference ('AutoPlaySpeed');

		Monogatari.preload ().then(() => {
			$_('[data-menu="loading"]').fadeOut (400, () => {
				$_('[data-menu="loading"]').hide ();
			});
		}).catch ((e) => {
			console.error (e);
		}).finally (() => {
			Monogatari.showMainMenu ();
		});

		Monogatari.setSlots();

		if (Monogatari.setting ('AutoSave') != 0 && typeof Monogatari.setting ('AutoSave') === 'number') {
			setInterval(function () {
				Monogatari.autoSave (Monogatari.global ('currentAutoSaveSlot'), Monogatari.setting ('AutoSaveLabel') + Monogatari.global ('currentAutoSaveSlot'));

				if (Monogatari.global ('currentAutoSaveSlot') === Monogatari.setting ('Slots')) {
					Monogatari.global ('currentAutoSaveSlot', 1);
				} else {
					Monogatari.global ('currentAutoSaveSlot', Monogatari.global ('currentAutoSaveSlot') + 1);
				}
				Monogatari.setAutoSlots ();

			}, Monogatari.setting ('AutoSave') * 60000);
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"]').hide ();
		}

		// Play the main menu song
		Monogatari.playAmbient();

		for (const action of Monogatari.actions ()) {
			action.init (selector);
		}
	}

}

Monogatari._actions = [];
Monogatari._components = [];
Monogatari._translations = {};
Monogatari._script = {};
Monogatari._characters = {};
Monogatari._storage = {};

Monogatari._globals = {

};

Monogatari._functions = {

};

Monogatari._status = {
	block: false,
	playing: false,
	finishedTyping: true
};

Monogatari._assets = {
	music: {},
	voice: {},
	sound: {},
	video: {},
	images: {},
	scenes: {}
};

Monogatari._settings = {

	// Initial Label *
	'Label': 'Start',

	// Number of AutoSave Slots
	'Slots': 10,

	// Current Media *
	'Song': '',
	'Sound': '',
	'Scene': '',
	'Particles': '',

	// Current Statement *.
	'Step': 0,

	// History for the previous function *.
	'MusicHistory': [],
	'SoundHistory': [],
	'ImageHistory': [],
	'CharacterHistory': [],
	'SceneHistory': [],
	'SceneElementsHistory': [],
	'ParticlesHistory': [],

	// Change to true for a MultiLanguage Game.
	'MultiLanguage': false,

	// Music for the Main Menu.
	'MenuMusic': '',

	// Prefix for the Save Slots in Local Storage.
	'SaveLabel': 'Save_',
	'AutoSaveLabel': 'AutoSave_',

	// Turn main menu on/off; Default: true *
	'ShowMenu': true,

	// Turn image preloading on/off, Default: true
	'Preload': true,

	// Time interval between autosaves (In Minutes). Default: 0 (Off)
	'AutoSave': 0,

	// Enable service workers; Default: true *
	'ServiceWorkers': true,

	// The Aspect Ratio your background images are on. This has no effect on
	// web deployed novels.
	'AspectRatio': '16:9',

	// Enables or disables the typing text animation for the whole game.
	'TypeAnimation': true,

	// Enables or disables the typing animation for the narrator.
	// If the previous property was set to false, the narrator won't shown
	// the animation even if this is set to true.
	'NarratorTypeAnimation': true,

	// Enables or disables the typing animation for the special centered
	// character. If the TypeAnimation property was set to false, the centered
	// character won't shown the animation even if this is set to true.
	'CenteredTypeAnimation': true,

	// Force some orientation on mobile devices. If this setting is set either
	// to portrait or landscape, a warning message will be displayed so the
	// player rotates its device.
	// Possible values: any, portrait or landscape.
	'Orientation': 'any'
};

Monogatari._preferences = {

	// Initial Language for Multilanguage Games or for the Default GUI Language.
	'Language': 'English',

	// Initial Volumes from 0.0 to 1.
	'Volume': {
		'Music': 1,
		'Voice': 1,
		'Sound': 1
	},

	// Initial resolution used for Electron, it must match the settings inside
	// the electron.js file. This has no effect on web deployed novels.
	'Resolution': '800x600',

	// Speed at which dialog text will appear
	'TextSpeed': 20,

	// Speed at which the Auto Play feature will show the next statement
	// It is measured in seconds and starts counting after the text is
	// completely displayed.
	'AutoPlaySpeed': 5
};

Monogatari.globals ({
	label: '',
	game: {},
	autoPlay: null,
	deleteSlot: null,
	overwriteSlot: null,
	block: false,
	playing: false,
	currentAutoSaveSlot: 1
});

Monogatari.Storage = new Space ();

export { Monogatari };