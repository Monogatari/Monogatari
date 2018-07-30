import { $_, Space, Platform, Preload, Util, FileSystem } from '@aegis-framework/artemis';
import { FancyError } from './FancyError';

class Monogatari {


	/**
	 * @static onStart - This is the main onStart function, it acts as an event
	 * listerner when the game is started. This function will call its action
	 * counterparts.
	 *
	 * @return {Promise} - The promise is resolved if all action's onStart function
	 * was resolved and is rejected if any were rejected.
	 */
	static onStart () {
		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.onStart ());
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.onStart ());
		}
		return Promise.all (promises);
	}

	/**
	 * @static onLoad - This is the main onStart function, it acts as an event
	 * listerner when a game is loaded. This function will call its action
	 * counterparts so that each action is able to run any operations needed
	 * when a game is loaded such as restoring their state.
	 *
	 * @return {Promise} - The promise is resolved is all action's onLoad function
	 * was resolved and is rejected if any were rejected.
	 */
	static onLoad () {
		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.onLoad ());
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.onLoad ());
		}
		return Promise.all (promises);
	}

	/**
	 * @static width - Determines the real width of the Monogatari element, pretty
	 * useful when dealing with canvas or other things that require specific measurements.
	 *
	 * @return {number} - Computed Width of the element
	 */
	static width () {
		return  parseInt (getComputedStyle($_(Monogatari.selector).get (0)).width.replace ('px', ''));
	}

	/**
	 * @static height - Determines the real height of the Monogatari element, pretty
	 * useful when dealing with canvas or other things that require specific measurements.
	 *
	 * @return {number} - Computed Width of the element
	 */
	static height () {
		return getComputedStyle($_(Monogatari.selector).get (0)).height.replace ('px', '');
	}

	/**
	 * @static string - Gets the translation of a string. This is of course limited
	 * to the translations defined for eeach language and string using the translation
	 * function.
	 *
	 * @param  {string} key - The key of the string whose translation is needed
	 * @return {string} - String translation in the current language given the
	 * user's preferences.
	 */
	static string (key) {
		if (typeof Monogatari._translations[Monogatari.preference ('Language')] !== 'undefined') {
			if (typeof Monogatari._translations[Monogatari.preference ('Language')][key] !== 'undefined') {
				return Monogatari._translations[Monogatari.preference ('Language')][key];
			} else {
				FancyError.show (
					`Translation for string "${key}" could not be found`,
					'Monogatari attempted to find a translation for the current language set in the preferences but there was none.',
					{
						'String Not Found': key,
						'Language': Monogatari.preference ('Language'),
						'Found in these elements': $_(`[data-string="${key}"]`).collection,
						'You may have meant one of these': Object.keys (Monogatari._translations[Monogatari.preference ('Language')]),
						'Help': {
							'_': 'Please check that this string has been correctly defined in your translations. A translation is defined as follows:',
							'_1': `
								<pre>
									<code class='language-javascript'>
									Monogatari.translation ("YourLanguage", {
										"SomeString": "Your Translation"
									});
									</code>
								</pre>
							`,
							'_2': 'You may also want to check if the [data-string] property of the HTML elements above is correct or if they have a typo.',
							'Documentation': '<a href="https://monogatari.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
						}
					}
				);
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

	/**
	 * @static history - Simple function to access, create and modify history
	 * objects. Each history is a simple arrray.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * history object will be updated with (i.e. Object.assign) or a string to access
	 * a specific history. If a string is given and that history does not exists,
	 * this method will create it for us.
	 *
	 * @return {type} - If the parameter passed was a string, this function will
	 * return the history associated with that name. If no argument was passed,
	 * it will return the whole history object containing all histories.
	 */
	static history (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				if (typeof Monogatari._history[object] === 'undefined') {
					Monogatari._history[object] = [];
				}
				return Monogatari._history[object];
			} else {
				Monogatari._history = Object.assign ({}, Monogatari._history, object);
			}
		} else {
			return Monogatari._history;
		}
	}

	/**
	 * @static state - Simple function to access, create and state variables.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * state object will be updated with (i.e. Object.assign) or a string to access
	 * a specific state variable.
	 *
	 * @return {type} - If the parameter passed was a string, this function will
	 * return the variable associated with that name. If no argument was passed,
	 * it will return the whole state object containing all variables.
	 */
	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Monogatari._state[object];
			} else {
				Monogatari._state = Object.assign ({}, Monogatari._state, object);
			}
		} else {
			return Monogatari._state;
		}
	}

	/**
	 * @static registerAction - Register an Action to the actions list. All actions
	 * should be registered before calling the init () method so their Mounting
	 * cycle is done correctly.
	 *
	 * @param  {Action} action - Action to register. Remember each action must
	 * have an unique ID.
	 */
	static registerAction (action) {
		Monogatari._actions.push (action);
	}

	/**
	 * @static unregisterAction - Removes an action from the actions list. Any
	 * action you want to remove should be removed before calling the init ()
	 * method so that their Mounting cycle is not executed.
	 *
	 * @param  {string} action - ID of the Action to unregister. Remember each action must
	 * have an unique ID.
	 */
	static unregisterAction (action) {
		Monogatari._actions = Monogatari._actions.filter ((a) => !(a instanceof action));
	}

	/**
	 * @static actions - Returns the list of registered Actions.
	 *
	 * @return {Action[]} - List of registered Actions
	 */
	static actions () {
		return Monogatari._actions;
	}

	/**
	 * @static action - Access to an specific action class
	 *
	 * @param  {string} id - ID of the action you want to access to.
	 * @return {Action} - Returns the action that matches the given ID
	 */
	static action (id) {
		return Monogatari._actions.find ((a) => a.id === id);
	}

	/**
	 * @static registerComponent - Register a Component to the components list.
	 * All components should be registered before calling the init () method so
	 * their Mounting cycle is done correctly.
	 *
	 * @param  {Component} component - Component to register. Remember each
	 * component must have an unique ID.
	 */
	static registerComponent (component) {
		Monogatari._components.push (component);
	}

	/**
	 * @static unregisterComponent - Removes a component from the components list.
	 * Any component you want to remove should be removed before calling the
	 * init () method so that their Mounting cycle is not executed.
	 *
	 * @param  {string} component - ID of the Component to unregister. Remember
	 * each component must have an unique ID.
	 */
	static unregisterComponent (component) {
		Monogatari._components = Monogatari._actions.filter ((c) => !(c instanceof component));
	}

	/**
	 * @static components - Returns the list of registered Components.
	 *
	 * @return {Component[]} - List of registered Components
	 */
	static components () {
		return Monogatari._components;
	}

	/**
	 * @static component - Access to an specific component class
	 *
	 * @param  {string} id - ID of the component you want to access to.
	 * @return {Component} - Returns the component that matches the given ID
	 */
	static component (id) {
		return Monogatari._components.find ((a) => a._id === id);
	}

	/**
	 * @static assets - Simple function to modify and access the assets object,
	 * all declared assets such as audio, videos and images should be registered
	 * in these objects.
	 *
	 * @param  {string} [type = null] - Assets
	 * @param  {Object} [object = null] description
	 * @return {Object} - If the
	 */
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

	static translations (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Monogatari._translations[object];
			} else {
				Monogatari._translations = Object.assign ({}, Monogatari._translations, object);
			}
		} else {
			return Monogatari._translations;
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
			if (typeof object === 'string') {
				return Monogatari._storage[object];
			} else {
				Monogatari._storage = Object.assign ({}, Monogatari._storage, object);
			}
		} else {
			return Monogatari._storage;
		}
	}

	static script (object = null) {
		if (typeof object === 'object' && object !== null) {
			Monogatari._script = Object.assign ({}, Monogatari._script, object);
		} else if (typeof object === 'string') {
			if (Monogatari.setting ('MultiLanguage') === true) {
				return Monogatari._script[Monogatari.preference ('Language')][object];
			} else {
				return Monogatari._script[object];
			}
		} else {
			if (Monogatari.setting ('MultiLanguage') === true) {
				return Monogatari._script[Monogatari.preference ('Language')];
			} else {
				return Monogatari._script;
			}
		}
	}

	static label (key = null, language = null, value = null) {
		if (typeof language === 'string' && value !== null) {
			if (typeof Monogatari._script[language] !== 'object') {
				Monogatari._script[language] = {};
			}
			Monogatari._script[language][key] = value;
		} else if (typeof language === 'object' && language !== null && value === null) {
			if (typeof Monogatari._script[key] !== 'object') {
				Monogatari._script[key] = [];
			}
			Monogatari._script[key] = language;
		} else if (typeof language === 'string' && value === null) {
			return Monogatari._script[language][key];
		} else if (key !== null) {
			return Monogatari._script[key];
		} else {
			return Monogatari.script (Monogatari.state ('label'));
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

		$_(`${Monogatari.selector} [data-string]`).each ((element) => {
			const string_translation = Monogatari.string ($_(element).data ('string'));

			// Check if the translation actually exists and is not empty before
			// replacing the text.
			if (typeof string_translation !== 'undefined' && string_translation !== '') {
				$_(element).text (string_translation);
			}
		});
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
		if (Monogatari.setting ('Preload') && !Platform.electron () && !Platform.cordova () && location.protocol.indexOf ('file') < 0) {

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

	static translate (statement) {
		const matches = statement.match (/_\(\S+\)/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('_(', '').replace (')', '').split ('.');
				let data = Monogatari.translations (Monogatari.preference ('Language'))[path[0]];

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}
		}
		return statement;
	}

	static replaceVariables (statement) {
		statement = Monogatari.translate (statement);
		const matches = statement.match (/{{\S+}}/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('{{', '').replace ('}}', '').split ('.');

				let data = Monogatari.storage (path[0]);

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}
		}
		return statement;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static addSlot (i, data) {
		const name = data.name ? data.name : data.date;

		$_('[data-menu="load"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();
		$_('[data-menu="save"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();
		const slot = `${Monogatari.setting ('SaveLabel')}_${i}`;
		if (typeof Monogatari.asset ('scenes', data.image) !== 'undefined') {


			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete='${slot}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2'>
					<button class='fas fa-times' data-delete='${slot}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);

		} else {
			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete="${slot}"></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2'>
					<button class='fas fa-times' data-delete="${slot}"></button>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);
		}
	}

	static addAutoSlot (i, data) {
		const name = data.name ? data.name : data.date;

		$_('[data-menu="load"] [data-ui="slots"] [data-string="NoAutoSavedGames"]').remove ();
		const slot = `${Monogatari.setting ('AutoSaveLabel')}_${i}`;

		if (typeof Monogatari.asset ('scenes', data.image ) !== 'undefined') {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete="${Monogatari.setting ('AutoSaveLabel')}_${i}"></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete="${slot}"></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		}
	}


	// Get's the highest number currently available as a slot id (Save_{?})
	static getMaxSlotId (prefix = 'SaveLabel') {
		return Monogatari.Storage.keys ().then ((keys) => {
			let max = 1;
			for (const saveKey of keys) {
				if (saveKey.indexOf (Monogatari.setting (prefix)) === 0) {
					const number = parseInt(saveKey.split (Monogatari.setting (prefix) + '_')[1]);
					if (number > max) {
						max = number;
					}
				}
			}
			return max;
		});
	}

	static saveTo (prefix = 'SaveLabel', id = null, name = null) {
		// Check if the player is actually playing
		if (Monogatari.global ('playing')) {
			const date = Monogatari.niceDateTime ();

			if (name === null || name.trim () === '') {
				name = date;
			}
			return Monogatari.getMaxSlotId (prefix).then ((max) => {

				if (id === null) {
					id = max + 1;
				}

				return Monogatari.Storage.set (`${Monogatari.setting (prefix)}_${id}`, {
					name,
					date,
					image: Monogatari.state ('scene').split (' ')[1],
					game: Monogatari.object ()
				});
			});
		}
	}

	static loadFromSlot (slot) {
		document.body.style.cursor = 'wait';
		Monogatari.global ('playing', true);

		Monogatari.resetGame ().then (() => {
			$_('section').hide();
			$_('#game').show();

			// TODO: Add compatibility for old save slots
			Monogatari.Storage.get (slot).then ((data) => {
				// Check if an older save format was used
				if (typeof data.Engine !== 'undefined') {

					Monogatari.state ({
						step: data.Engine.Step,
						label: data.Engine.Label,
						scene: `show scene ${data.Engine.Scene}`,
					});

					if (data.Engine.Song !== '' && typeof data.Engine.Song !== 'undefined') {
						Monogatari.state ({
							music: `${data.Engine.Song}`,
						});
					}

					if (data.Engine.Sound !== '' && typeof data.Engine.Sound !== 'undefined') {
						Monogatari.state ({
							sound: `${data.Engine.Sound}`,
						});
					}

					if (data.Engine.Particles !== '' && typeof data.Engine.Particles !== 'undefined') {
						Monogatari.state ({
							particles: `show particles ${data.Engine.Particles}`
						});
					}

					if (data.Show !== '' && typeof data.Show !== 'undefined') {
						const show = data.Show.split (',');
						for (const element of show) {
							if (element.trim () !== '') {
								const div = document.createElement ('div');
								div.innerHTML =  element;
								const item = $_(div.firstChild);
								if (element.indexOf ('data-character') > -1) {
									Monogatari.state ('characters').push (`show character ${item.data ('character')} ${item.data ('sprite')} ${item.get (0).className}`);
								} else if (element.indexOf ('data-image') > -1) {
									Monogatari.state ('characters').push (`show image ${item.data ('image')} ${item.get (0).className}`);
								}
							}

						}
					}

					Monogatari.history ({
						music: data.Engine.MusicHistory,
						sound: data.Engine.SoundHistory,
						image: data.Engine.ImageHistory,
						character: data.Engine.CharacterHistory,
						scene: data.Engine.SceneHistory.map ((scene) => {
							return `show scene ${scene}`;
						}),
						sceneElements: data.Engine.SceneElements,
						particle: data.Engine.ParticlesHistory.map ((particles) => {
							return `show particles ${particles}`;
						}),
					});
					Monogatari.storage (data.Storage);

				} else {
					const { state, history, storage } = data.game;
					Monogatari.state (state);
					Monogatari.history (history);
					Monogatari.storage (storage);
				}
				const promises = [];
				for (const action of Monogatari.actions ()) {
					promises.push (action.onLoad ());
				}

				Promise.all (promises).then (() => {
					$_('#game').show ();
					Monogatari.run(Monogatari.label ()[Monogatari.state ('step')]);
					document.body.style.cursor = 'auto';
				});
			});
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
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.canProceed ());
		}

		if ($_('#game').isVisible ()
			&& !$_('[data-component="modal"]').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises);
	}

	static canRevert () {
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.canRevert ());
		}

		if ($_('#game').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises);
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

	static resetGame () {

		$_('[data-component="modal"]').removeClass ('modal--active');

		// Stop autoplay
		Monogatari.autoPlay (false);

		// Reset Storage
		Monogatari.storage (JSON.parse(Monogatari.global ('storageStructure')));

		// Reset Conditions
		Monogatari.state ({
			step: 0,
			label: Monogatari.setting ('Label')
		});

		Monogatari.global ('block', false);

		// Reset History
		for (const history of Object.keys (Monogatari._history)) {
			Monogatari._history[history] = [];
		}

		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.reset ());
		}
		return Promise.all (promises);
	}

	static next () {
		Monogatari.state ({
			step: Monogatari.state ('step') + 1
		});
		// Clear the Stack using a Time Out instead of calling the function
		// directly, preventing an Overflow
		setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);
	}

	// Start game automatically withouth going trough the main menu
	static showMainMenu () {
		if (!Monogatari.setting ('ShowMenu')) {
			Monogatari.stopAmbient ();
			Monogatari.global ('playing', true);
			$_('section').hide ();
			$_('#game').show ();
			Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		} else {
			$_('[data-menu="main"]').show ();
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//

	static autoPlay (enable) {
		if (enable === true) {
			const interval = Monogatari.preference ('AutoPlaySpeed') * 1000;
			let expected = Date.now () + interval;

			Monogatari.global ('_AutoPlayTimer', () => {
				const now = Date.now () - expected; // the drift (positive for overshooting)
				if (now > interval) {
					// something really bad happened. Maybe the browser (tab) was inactive?
					// possibly special handling to avoid futile "catch up" run
				}
				Monogatari.canProceed ().then (() => {
					Monogatari.next ();
					expected += interval;
					setTimeout (Monogatari.global ('_AutoPlayTimer'), Math.max (0, interval - now)); // take into account drift
				}).catch (() => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			});
			setTimeout (Monogatari.global ('_AutoPlayTimer'), interval);
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] [data-string]`).text (Monogatari.string ('Stop'));
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] .fa-play-circle`).replaceWith ('<span class="fas fa-stop-circle"></span>');
		} else {
			clearTimeout (Monogatari.global ('_AutoPlayTimer'));
			Monogatari.global ('_AutoPlayTimer', null);
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] [data-string]`).text (Monogatari.string ('AutoPlay'));
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] .fa-stop-circle`).replaceWith ('<span class="fas fa-play-circle"></span>');
		}
	}

	static object () {
		return {
			history: Monogatari.history (),
			state: Monogatari.state (),
			storage: Monogatari.storage ()
		};
	}

	// Function to execute the previous statement in the script.
	static revert () {

		if (Monogatari.state ('step') >= 1) {

			for (const action of Monogatari.actions ()) {
				let actionStatement = Monogatari.label ()[Monogatari.state ('step') - 1];
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
							return act.didRevert (). then ((shouldContinue) => {
								Monogatari.state ({
									step: Monogatari.state ('step') - 1
								});
								if (shouldContinue === true) {
									// Clear the Stack using a Time Out instead
									// of calling the function directly, preventing
									// an Overflow
									setTimeout (Monogatari.revert, 0);
								}
							});
						});
					}).catch ((e) => {
						if (typeof e === 'object' || typeof e === 'string') {
							console.error (e);
						}
						// Clear the Stack using a Time Out instead of calling
						// the function directly, preventing an Overflow
						setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);
					});
				}
			}
		} else {
			// Clear the Stack using a Time Out instead of calling
			// the function directly, preventing an Overflow
			setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);
		}
		return Promise.reject ();
	}

	static run (statement, advance) {

		if (statement === null) {
			return Promise.reject ();
		}

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
						return Monogatari.next ();
					}
				});
			}

			if (matches === true) {
				const act = new action (actionStatement);
				act._setStatement (statement);
				act.setContext (Monogatari);

				return act.willApply ().then (() => {
					return act.apply (advance).then (() => {
						return act.didApply ().then ((shouldContinue) => {
							if (shouldContinue === true && advance === true) {
								Monogatari.next ();
							}
						});
					});
				});
			}
		}
	}

	static setup (selector) {

		$_(selector).html (Monogatari._html);

		// Set the initial settings if they don't exist or load them.
		Monogatari.Storage.get ('Settings').then ((local_settings) => {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, local_settings);
		}).catch (() => {
			Monogatari.Storage.set ('Settings', Monogatari._preferences);
		});

		// Register service worker
		if (Monogatari.setting ('ServiceWorkers')) {
			if (!Platform.electron () && !Platform.cordova () && Platform.serviceWorkers ()) {
				// TODO: There's a place in hell for this quick fix, the splitting
				// of the sw file is just preventing parcel from tryng to bundle it.
				navigator.serviceWorker.register ('service-worker' + '.js');
			} else {
				console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
			}
		}

		Monogatari.global ('storageStructure', JSON.stringify(Monogatari.storage ()));

		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.setup (selector));
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.setup (selector));
		}
		return Promise.all (promises);
	}

	/**
	 * Every event listener should be binded in this function.
	 */
	static bind (selector) {

		// Add the orientation checker in case that a specific orientation was
		// defined.
		if (Monogatari.setting ('Orientation') !== 'any' && Platform.mobile ()) {

			// Set the event listener for device orientation so we can display a message
			window.addEventListener ('orientationchange', () => {
				if (Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_(`${selector} [data-notice="orientation"]`).addClass ('modal--active');
				} else {
					$_(`${selector} [data-notice="orientation"]`).removeClass ('modal--active');
				}
			}, false);
		}

		// Add event listener for back buttons. If the player is plaing, the back
		// button will return to the game, if its not playing, then it'll return
		// to the main menu.
		$_(`${selector} [data-menu]`).on ('click', '[data-action="back"]:not(#game), [data-action="back"]:not(#game) *', () => {
			$_(`${selector} section`).hide ();
			if (Monogatari.global ('playing')) {
				$_(`${selector} #game`).show ();
			} else {
				$_(`${selector} [data-menu="main"]`).show ();
			}
		});

		$_(`${selector} [data-action], [data-action] *`).click (function (event) {
			event.stopPropagation ();

			switch ($_(this).data('action')) {

				case 'open-menu':
					$_(`${selector} section`).hide();

					if ($_(this).data('open') == 'save') {
						$_(`${selector} [data-menu="save"] [data-input="slotName"]`).value (Monogatari.niceDateTime ());
					}
					$_(`${selector} [data-menu="${$_(this).data('open')}"]`).show();

					break;

				case 'start':
					Monogatari.stopAmbient();
					Monogatari.global ('playing', true);

					Monogatari.onStart ().then (() => {
						$_(`${selector} section`).hide();
						$_(`${selector} #game`).show();
						Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
					});
					break;

				case 'close':
					$_(`${selector} [data-ui="${$_(this).data('close')}"]`).removeClass('active');
					break;

				case 'dismiss-notice':
					$_(`${selector} [data-notice]`).removeClass('modal--active');
					break;

				case 'distraction-free':
					if ($_(this).hasClass('fa-eye')) {
						$_(this).removeClass('fa-eye');
						$_(this).addClass('fa-eye-slash');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Show'));
						$_(`${selector} [data-ui="quick-menu"]`).addClass ('transparent');
						$_(`${selector} [data-ui="text"]`).hide();
						Monogatari.global ('distraction-free', true);
					} else if ($_(this).hasClass('fa-eye-slash')) {
						$_(this).removeClass('fa-eye-slash');
						$_(this).addClass('fa-eye');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Hide'));
						$_(`${selector} [data-ui="quick-menu"]`).removeClass ('transparent');
						$_(`${selector} [data-ui="text"]`).show();
						Monogatari.global ('distraction-free', false);
					} else if ($_(this).text () === Monogatari.string ('Show')) {
						$_(this).text (Monogatari.string('Hide'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye-slash');
						$_(this).parent ().find ('.fas').addClass ('fa-eye');
						$_(`${selector} [data-ui="quick-menu"]`).removeClass ('transparent');
						$_(`${selector} [data-ui="text"]`).show ();
						Monogatari.global ('distraction-free', false);
					} else if ($_(this).text () === Monogatari.string ('Hide')) {
						$_(this).text (Monogatari.string ('Show'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye');
						$_(this).parent ().find ('.fas').addClass ('fa-eye-slash');
						$_(`${selector} [data-ui="quick-menu"]`).addClass ('transparent');
						$_(`${selector} [data-ui="text"]`).hide ();
						Monogatari.global ('distraction-free', true);
					}
					break;
			}
			return false;
		});

		$_(`${selector} [data-action="auto-play"], ${selector} [data-action="auto-play"] *`).click(function () {
			Monogatari.autoPlay (Monogatari.global ('_AutoPlayTimer') === null);
		});

		$_(document).keyup ((e) => {
			if (e.target.tagName.toLowerCase () != 'input') {
				switch (e.which) {

					// Escape Key
					case 27:
						if ($_(`${selector} #game`).isVisible ()) {
							$_(`${selector} #game`).hide ();
							$_(`${selector} [data-menu="settings"]`).show();
						} else if ($_(`${selector} [data-menu="settings"]`).isVisible () && Monogatari.global ('playing')) {
							$_(`${selector} [data-menu="settings"]`).hide ();
							$_(`${selector} #game`).show ();
						}
						break;

					// Spacebar and Right Arrow
					case 32:
					case 39:
						Monogatari.canProceed ().then (() => {
							Monogatari.next ();
						}).catch (() => {
							// An action waiting for user interaction or something else
							// is blocking the game.
						});
						break;

					// Left Arrow
					case 37:
						Monogatari.revert ().catch (() => {
							// The game could not be reverted, either because an
							// action prevented it or because there are no statements
							// left to revert to.
						});
						break;

					// H Key
					case 72:
						event.stopPropagation();
						if ($_(`${selector} [data-action="distraction-free"]`).hasClass ('fa-eye')) {
							$_(`${selector} [data-action="distraction-free"]`).removeClass ('fa-eye');
							$_(`${selector} [data-action="distraction-free"]`).addClass ('fa-eye-slash');
							$_(`${selector} [data-ui="text"]`).hide ();
							Monogatari.global ('distraction-free', true);
						} else if ($_(`${selector} [data-action="distraction-free"]`).hasClass ('fa-eye-slash')) {
							$_(`${selector} [data-action="distraction-free"]`).removeClass ('fa-eye-slash');
							$_(`${selector} [data-action="distraction-free"]`).addClass ('fa-eye');
							$_(`${selector} [data-ui="text"]`).show ();
							Monogatari.global ('distraction-free', false);
						}
						break;

					// Exit this handler for other keys to run normally
					default:
						return;
				}
			}

			e.preventDefault();
		});

		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.bind (selector));
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.bind (selector));
		}
		return Promise.all (promises);
	}

	static init (selector = '#monogatari') {
		Monogatari.selector = selector;
		FancyError.init ();

		Monogatari.setup (selector).then (() => {
			Monogatari.bind (selector).then (() => {

				// Set the initial language translations
				Monogatari.localize ();

				// Set the label in which the game will start
				Monogatari.state ({
					label: Monogatari.setting ('Label')
				});

				// Check if the orientation is correct, if it's not, show the warning
				// message so the player will rotate its device.
				if (Platform.mobile () && Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_(`${selector} [data-notice="orientation"]`).addClass ('modal--active');
				}

				// Set all the dynamic backgrounds of the data-background property
				$_(`${selector} [data-background]`).each ((element) => {
					const background = $_(element).data ('background');
					if (background.indexOf ('.') > -1) {
						$_(element).style ('background', `url('${background}') center / cover no-repeat`);
					} else {
						$_(element).style ('background', background);
					}
				});

				Monogatari.preload ().then(() => {
					$_(`${selector} [data-menu="loading"]`).fadeOut (400, () => {
						$_(`${selector} [data-menu="loading"]`).hide ();
					});
				}).catch ((e) => {
					console.error (e);
				}).finally (() => {
					Monogatari.showMainMenu ();
				});

				for (const component of Monogatari.components ()) {
					component.init (selector);
				}

				for (const action of Monogatari.actions ()) {
					action.init (selector);
				}

				// Play the main menu song
				Monogatari.playAmbient();
			});
		});
	}
}

Monogatari._actions = [];
Monogatari._components = [];
Monogatari._translations = {};
Monogatari._script = {};
Monogatari._characters = {};
Monogatari._storage = {};

Monogatari._state = {
	step: 0,
	label: 'Start'
};

Monogatari._history = {
	image: [],
	character: [],
	scene: [],
	label: []
};

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

	// Change to true for a MultiLanguage Game.
	'MultiLanguage': false,

	// Music for the Main Menu.
	'MenuMusic': '',

	// Prefix for the Save Slots in Local Storage.
	'SaveLabel': 'Save',
	'AutoSaveLabel': 'AutoSave',

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
	autoPlay: null,
	'distraction-free': false,
	deleteSlot: null,
	overwriteSlot: null,
	block: false,
	playing: false,
	currentAutoSaveSlot: 1,
	_AutoPlayTimer: null
});

Monogatari.Storage = new Space ();

Monogatari._html = `
	<!-- Notice messages -->
	<div data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>

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
`;

export { Monogatari };
