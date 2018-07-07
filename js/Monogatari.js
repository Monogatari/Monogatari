/* global Artemis */
/* global pJSDom */
/* global require */

const { $_, $_ready, Space, Platform, Preload } = Artemis;

const Storage = new Space ();

class Monogatari {


	static string (key) {
		return Monogatari._translations[Monogatari.preference ('Language')][key];
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

	static actions (id, settings = null) {
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
			Storage.update ('Settings', Monogatari._preferences);
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
			Storage.update ('Settings', Monogatari._preferences);
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

	///////////////


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

			// Start by loading the image assets
			for (const key in Monogatari.assets ('scenes')) {
				promises.push (Preload.image ('img/scenes/' + Monogatari.asset ('scenes', key)).finally (() => {
					$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
				}));
				assetCount += 1;
			}

			for (const key in Monogatari.assets ('images')) {
				promises.push (Preload.image ('img/' + Monogatari.asset ('images', key)).finally (() => {
					$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
				}));
				assetCount += 1;
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
						promises.push (Preload.image ('img/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Side !== 'undefined') {
					for (const image of Object.values (character.Side)) {
						promises.push (Preload.image ('img/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Face !== 'undefined') {
					promises.push (Preload.image ('img/characters/' + directory + character.Face).finally (() => {
						$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
					}));
					assetCount += 1;
				}
			}

			// Load the audio assets
			for (const key in Monogatari.assets ('music')) {
				promises.push (Preload.file ('audio/music/' + Monogatari.asset ('music', key)).finally (() => {
					$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
				}));
				assetCount += 1;
			}

			for (const key in Monogatari.assets ('voice')) {
				promises.push (Preload.file ('audio/voice/' + Monogatari.asset ('voice', key)).finally (() => {
					$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
				}));
				assetCount += 1;
			}

			for (const key in Monogatari.assets ('sound')) {
				promises.push (Preload.file ('audio/sound/' + Monogatari.asset ('sound', key)).finally (() => {
					$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
				}));
				assetCount += 1;
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
		if (typeof Monogatari.assets ('scenes', data.Engine.Scene) !== 'undefined') {

			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='img/scenes/${Monogatari.assets ('scenes', data.Engine.Scene)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='img/scenes/${Monogatari.assets ('scenes', data.Engine.Scene)}' alt=''>
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

		if (typeof Monogatari.assets ('scenes', data.Engine.Scene) !== 'undefined') {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--3 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<img src='img/scenes/${Monogatari.assets ('scenes', data.Engine.Scene)}' alt=''>
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

		Storage.keys ().then ((keys) => {
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
					Storage.get (savedData[i]).then ((slot) => {
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

		return Storage.keys ().then ((keys) => {
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
				promises.push(Storage.get (label).then ((slot) => {
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
		return Storage.keys ().then ((keys) => {
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
		if (globals.playing) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			Monogatari.getMaxSlotId ().then ((max) => {
				Storage.set (Monogatari.setting ('SaveLabel') + (max + 1) , {
					'Name': name,
					'Date': Monogatari.niceDateTime (),
					'Engine': Monogatari.settings (),
					'Show': show,
					'Label': Monogatari.setting ('Label'),
					'Storage': Monogatari.storage ()
				}).then (({key, value}) => {
					Monogatari.addSlot (max + 1, value);
					document.body.style.cursor = 'auto';
				});
			});
		}
	}

	static autoSave (id, slot) {
		if (globals.playing) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			const name = Monogatari.niceDateTime ();

			Storage.set (slot, {
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
		if (globals.block) {
			document.body.style.cursor = 'wait';

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = '';
			$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
				show += element.outerHTML.replace(/"/g, '\'') + ',';
			});

			// Get the name of the Slot if it exists or use the current date.
			Storage.get (slot).then ((data) => {
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

				Storage.set (slot, {
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

	static niceDateTime () {
		return new Date ().toLocaleString ();
	}

	static stopParticles () {
		try {
			if (typeof pJSDom === 'object') {
				if (pJSDom.length > 0) {
					for (let i = 0; i < pJSDom.length; i++) {
						if (typeof pJSDom[i].pJS !== 'undefined') {
							cancelAnimationFrame (pJSDom[i].pJS.fn.drawAnimFrame);
							pJSDom.shift ();
						}
					}
				}
			}
		} catch (e) {
			console.error ('An error ocurred while trying to stop particle system.');
		}

		Monogatari.setting ('Particles', '');
		$_('#particles-js').html ('');
	}

	static hideCentered () {
		$_('[data-ui="centered"]').remove ();
		$_('[data-ui="text"]').show ();
	}

	// Assert the result of a function
	static assertAsync (callable, args = null) {
		globals.block = true;
		return new Promise (function (resolve, reject) {
			const result = callable.apply(null, args);
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
			&& !globals.block) {
			return true;
		} else {
			return false;
		}
	}

	static playAmbient () {
		if (Monogatari.setting ('MenuMusic') !== '') {
			Monogatari.ambientPlayer.setAttribute ('loop', '');

			if (typeof Monogatari.assets ('music', Monogatari.setting ('MenuMusic')) !== 'undefined') {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.assets ('music', Monogatari.setting ('MenuMusic')));
			} else {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.setting ('MenuMusic'));
			}
			Monogatari.ambientPlayer.play();
		}
	}

	// Stop any playing music or sound
	static silence () {
		for (let i = 0; i < document.getElementsByTagName ('audio').length; i++) {
			const v = document.getElementsByTagName ('audio');
			if (!v[i].paused && typeof v[i].src != 'undefined' && v[i].src != '') {
				v[i].pause();
				v[i].currentTime = 0;
			}
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

	static stopVideo () {
		Monogatari.videoPlayer.pause ();
		Monogatari.videoPlayer.currentTime = 0;
		Monogatari.videoPlayer.setAttribute ('src', '');
		$_('[data-component="video"]').removeClass ('active');
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

			try {
				window.$ = window.jQuery = require ('./js/jquery.min.js');
			} catch (e) {
				console.warn ('jQuery could not be loaded.');
			}

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

				if (typeof Monogatari.preference ('Resolution') != 'undefined') {
					Monogatari.changeWindowResolution (Monogatari.preference ('Resolution'));
				}
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

	/////////////////

	static setup () {
		// Set the initial settings if they don't exist or load them.
		Storage.get ('Settings').then ((local_settings) => {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, local_settings);
		}).catch (() => {
			Storage.set ('Settings', Monogatari._preferences);
		});

		if (typeof Typed === 'undefined') {
			console.error ('Typed library not found, dialogs will not be shown.');
		}

		// Set the startLabel property, which will be used when the game is reset.
		Monogatari.setting ('startLabel', Monogatari.setting ('Label'));

		// Register service worker
		if (Monogatari.setting ('ServiceWorkers')) {
			if (!Platform.electron () && !Platform.cordova () && Platform.serviceWorkers ()) {
				navigator.serviceWorker.register ('./../service-worker.js');
			} else {
				console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
			}
		}
	}

	/**
	 * Every event listener should be binded in this function.
	 */
	static bind () {
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
		$_('[data-menu]').on ('click', '[data-action="back"]:not(#game)', (event) => {
			event.stopPropagation ();
			$_('section').hide ();
			if (globals.playing) {
				$_('#game').show ();
			} else {
				$_('[data-menu="main"]').show ();
			}
		});

		// Save to slot when a slot is pressed.
		$_('[data-menu="save"]').on ('click', 'figcaption, img, small', function () {
			globals.overwriteSlot = $_(this).parent ().data ('save');
			Storage.get (Monogatari.setting ('SaveLabel') + globals.overwriteSlot).then ((data) => {
				if (typeof data.Name !== 'undefined') {
					$_('[data-notice="slot-overwrite"] input').value (data.Name);
				} else {
					$_('[data-notice="slot-overwrite"] input').value (data.Date);
				}
				$_('[data-notice="slot-overwrite"]').addClass ('modal--active');
			});
		});

		$_('[data-menu="save"], [data-menu="load"]').on ('click', '[data-delete]', function () {
			globals.deleteSlot = $_(this).data ('delete');
			Storage.get (Monogatari.setting ('SaveLabel') + globals.deleteSlot).then ((data) => {
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
			Storage.set ('Settings', Monogatari.preferences ());
		});

		$_('[data-action="set-text-speed"]').on ('change mouseover', function () {
			const value =  Monogatari.setting ('maxTextSpeed') - parseInt($_(this).value());
			typedConfiguration.typeSpeed = value;
			Monogatari.preference ('TextSpeed', value);
		});

		$_("[data-action='set-auto-play-speed']").on("change mouseover", function () {
			const value = Monogatari.setting ('maxAutoPlaySpeed') - parseInt($_(this).value());
			Monogatari.preference ('AutoPlaySpeed', value);
		});
	}

	static init () {
		Monogatari.setup ();
		Monogatari.bind ();

		// Set the initial language translations
		Monogatari.localize ();

		// Set the game language or hide the option if the game is not multilingual
		if (Monogatari.setting ('MultiLanguage')) {
			globals.game = Monogatari.script (Monogatari.preference ('Language'));
			$_('[data-action="set-language"]').value (Monogatari.preference ('Language'));
			Monogatari.localize ();
		} else {
			globals.game = Monogatari.script ();
			console.log (Monogatari.script ());
			$_('[data-settings="language"]').hide ();
		}

		// Set the label in which the game will start
		globals.label = globals.game[Monogatari.setting ('Label')];

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

		Monogatari.setSlots();

		if (Monogatari.setting ('AutoSave') != 0 && typeof Monogatari.setting ('AutoSave') === 'number') {
			setInterval(function () {
				Monogatari.autoSave (globals.currentAutoSaveSlot, Monogatari.setting ('AutoSaveLabel') + globals.currentAutoSaveSlot);

				if (globals.currentAutoSaveSlot === Monogatari.setting ('Slots')) {
					globals.currentAutoSaveSlot = 1;
				} else {
					globals.currentAutoSaveSlot += 1;
				}
				Monogatari.setAutoSlots ();

			}, Monogatari.setting ('AutoSave') * 60000);
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"]').hide ();
		}

		// Play the main menu song
		Monogatari.playAmbient();
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

const globals = {
	label: '',
	game: {},
	textObject: null,
	autoPlay: null,
	deleteSlot: null,
	overwriteSlot: null,
	block: false,
	playing: false,
	finishedTyping: true,
	currentAutoSaveSlot: 1,
	typedConfiguration: {
		strings: [],
		typeSpeed: Monogatari.preference ('TextSpeed'),
		fadeOut: true,
		loop: false,
		showCursor: false,
		contentType: 'html',
		preStringTyped: function () {
			globals.finishedTyping = false;
		},
		onStringTyped: function () {
			if (globals.autoPlay !== null) {
				globals.autoPlay = setTimeout (function () {
					if (Monogatari.canProceed() && globals.finishedTyping) {
						Monogatari.hideCentered();
						shutUp();
						next ();
					}
				}, Monogatari.preference ('AutoPlaySpeed') * 1000);
			}

			globals.finishedTyping = true;
		},
		onDestroy () {
			globals.finishedTyping = true;
		}
	}
};