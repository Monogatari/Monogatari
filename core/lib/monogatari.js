import { $_, Space, SpaceAdapter, Platform, Preload, Util, FileSystem, Text, Debug, DebugLevel } from '@aegis-framework/artemis';
import moment from 'moment';
import mousetrap from 'mousetrap';
import { FancyError } from './FancyError';
import merge  from 'deeply';


/**
 * Every Monogatari Game is composed mainly of the following items:
 *
 * Actions: The list of capabilities a Monogatari script can run.
 *
 * Components: The list of screens and other HTML elements available in the game.
 *
 * State: The current state of the game, this simple object contains the current
 *        label and step as well as the things being shown or played by every action.
 *
 * History: Every action and even components may keep a history on what statements
 *			have been applied. The history is
 *
 * Assets: The list of different assets declared by the developer to use in throughout
 * 		   the game.
 *
 * Script: All the labels and statements that make up the story and gameplay.
 *
 * Characters: The list of characters that participate in the script of the game.
 *
 * Monogatari follows a 3-step life cycle:
 *
 * 1. Setup - All needed elements are added to the DOM and all variables get
 * 			  initialized. This first step is all about preparing all the needed
 * 			  elements.
 *
 * 2. Bind - Once the game has been setup, its time to bind all the necessary
 *           event listeners or perform more operations on the DOM.
 *
 * 3. Init - Finally, once the game was setup and it performed all the needed
 *           bindings, it may declare or modify variables that needed the HTML to
 *           be setup first or perform any other needed final operations. In this
 * 			 step, all needed elements will now be shown and the game will begin.
 *
 * @class Monogatari
 */
class Monogatari {


	/**
	 * @static onStart - This is the main onStart function, it acts as an event
	 * listener when the game is started. This function will call its action
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
	 * listener when a game is loaded. This function will call its action
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

	static debug () {

		return new Proxy (Debug, {
			apply (target, receiver, args) {
				console.log (target);
				if (typeof MonogatariDebug === 'object') {
					return Reflect.apply (target, receiver, args);
				}
			}
		});
	}

	/**
	 * @static string - Gets the translation of a string. This is of course limited
	 * to the translations defined for each language and string using the translation
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
	 * objects. Each history is a simple array.
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
				Monogatari._state = merge (Monogatari._state, object);
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
	 * @param  {string} [type = null] - The type of asset you are referring to
	 * @param  {Object} [object = null] - The key/value object to assign to that asset type
	 * @return {Object} - If this function is called with no arguments, the whole
	 * assets object will be returned.
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
			Monogatari._characters = merge (Monogatari._characters, object);
		} else {
			return Monogatari._characters;
		}
	}

	static character (id, object = null) {
		if (object !== null) {
			if (typeof Monogatari._characters[id] !== 'undefined') {
				Monogatari._characters[id] = merge (Monogatari._characters[id], object);
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
			Monogatari._settings = merge (Monogatari._settings, object);
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
			Monogatari._preferences = merge (Monogatari._preferences, object);
			if (Monogatari.Storage.configuration ().name === '') {
				Monogatari.setupStorage ();
			}
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
				Monogatari._storage = merge (Monogatari._storage, object);
			}
		} else {
			return Monogatari._storage;
		}
	}

	static script (object = null) {

		if (typeof object === 'object' && object !== null) {
			Monogatari._script = Object.assign ({}, Monogatari._script, object);
		} else {
			let script = Monogatari._script;

			if (Monogatari.setting ('MultiLanguage') === true) {
				if (!Object.keys (script).includes (Monogatari.preference ('Language'))) {
					// First check if the label exists in the current script
					FancyError.show (
						`Script Language "${Monogatari.preference ('Language')}" Was Not Found`,
						'Monogatari attempted to retrieve the script for this language but it does not exists',
						{
							'Language Not Found': Monogatari.preference ('Language'),
							'MultiLanguage Setting': 'The Multilanguage Setting is set to '+ Monogatari.setting ('MultiLanguage'),
							'You may have meant one of these': Object.keys (script),
							'Help': {
								'_': 'If your game is not a multilanguage game, change the setting on your options.js file',
								'_1': `
									<pre>
										<code class='language-javascript'>
										"MultiLanguage": false,
										</code>
									</pre>
								`,
								'_2': 'If your game is a multilanguage game, please check that the language label is correctly written on your script. Remember a multilanguage script looks like this:',
								'_3': `
									<pre>
										<code class='language-javascript'>
										Monogatari.script ({
											'English': {
												'Start': [
													'Hi, welcome to your first Visual Novel with Monogatari.'
												]
											},
											'Español': {
												'Start': [
													'Hola, bienvenido a tu primer Novela Visual con Monogatari.'
												]
											}
										});
										</code>
									</pre>
								`,
								'Documentation': '<a href="https://monogatari.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>',
								'_4': `If ${Monogatari.preference ('Language')} should not be the default language, you can change that preference on your options.js file.`,
								'_5': `
									<pre>
										<code class='language-javascript'>
										'Language': 'English',
										</code>
									</pre>
								`,

							}
						}
					);
				} else {
					script = script[Monogatari.preference ('Language')];
				}
			}

			if (typeof object === 'string') {
				script = script[object];
			}

			return script;
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
			return Monogatari.script (key);
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
			Monogatari._globals = merge (Monogatari._globals, object);
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

	static template (key, value) {
		if (typeof value !== 'undefined') {
			Monogatari._templates[key] = value;
		} else {
			return Monogatari._templates[key];
		}
	}

	static mediaPlayers (key, object = false) {
		if (typeof key === 'string') {
			if (object) {
				return Monogatari._mediaPlayers[key];
			} else {
				return Object.values (Monogatari._mediaPlayers[key]);
			}
		}
		return Monogatari._mediaPlayers;
	}

	static mediaPlayer (type, key, value) {
		if (typeof value === 'undefined') {
			return Monogatari.mediaPlayers (type, true)[key];
		} else {
			value.dataset.type = type;
			value.dataset.key = key;
			Monogatari._mediaPlayers[type][key] = value;
			return Monogatari._mediaPlayers[type][key];
		}
	}

	static removeMediaPlayer (type, key) {
		if (typeof key === 'undefined') {
			for (const mediaKey of Object.keys (Monogatari.mediaPlayers (type, true))) {
				Monogatari._mediaPlayers[type][mediaKey].pause ();
				Monogatari._mediaPlayers[type][mediaKey].setAttribute ('src', '');
				Monogatari._mediaPlayers[type][mediaKey].currentTime = 0;
				delete Monogatari._mediaPlayers[type][mediaKey];
			}
		} else {
			if (typeof Monogatari._mediaPlayers[type][key] !== 'undefined') {
				Monogatari._mediaPlayers[type][key].pause ();
				Monogatari._mediaPlayers[type][key].setAttribute ('src', '');
				Monogatari._mediaPlayers[type][key].currentTime = 0;
				delete Monogatari._mediaPlayers[type][key];
			}

		}
	}

	static temp (key, value) {
		if (typeof value !== 'undefined') {
			Monogatari._temp[key] = value;
		} else {
			const value = Monogatari._temp[key];
			delete Monogatari._temp[key];
			return value;
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
			$_('[data-screen="loading"]').show ();

			for (const category of Object.keys (Monogatari.assets ())) {
				for (const asset of Object.values (Monogatari.assets (category))) {
					const directory = `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath')[category]}`;
					if (FileSystem.isImage (asset)) {

						promises.push (Preload.image (`${directory}/${asset}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					} else {
						promises.push (Preload.file (`${directory}/${asset}`).finally (() => {
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
				directory = `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}`;

				if (typeof character.Images !== 'undefined') {
					for (const image of Object.values (character.Images)) {
						promises.push (Preload.image (`${directory}${image}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Side !== 'undefined') {
					for (const image of Object.values (character.Side)) {
						promises.push (Preload.image (`${directory}${image}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Face !== 'undefined') {
					promises.push (Preload.image (`${directory}${character.Face}`).finally (() => {
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

	/**
	 * @static translate - This method will try to translate parts of a string
	 * using the translation strings available. Any string containing a format
	 * like this one: "_(SomeKey)" will get that replaced with the translated
	 * string of that key.
	 *
	 * @param {string} statement - String to translate.
	 *
	 * @returns {string} - The translated string
	 */
	static translate (statement) {
		// Find all elements in the string that match the "_(key)" format
		const matches = statement.match (/_\(\S+\)/g);

		// Check if any matches were found, if not then no translation is needed
		if (matches !== null) {
			// Go through all the found matches so we can get the string it maps to
			for (const match of matches) {
				// Remove the _() from the key
				const path = match.replace ('_(', '').replace (')', '').split ('.');

				// Retrieve the string from the translations using the given key
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
		const matches = statement.match (/{{\S+?}}/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('{{', '').replace ('}}', '').split ('.');

				let data = Monogatari.storage (path[0]);

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}

			return Monogatari.replaceVariables (statement);
		}
		return statement;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static addSlot (i, data) {

		// Check if the slot has an older format
		if (typeof data.Engine !== 'undefined') {
			data.name = data.Name;
			data.date = data.Date;
			data.image = data.Engine.Scene;
		}

		const slot = `${Monogatari.setting ('SaveLabel')}_${i}`;
		const image  = Monogatari.asset ('scenes', data.image);


		const name = data.name ? data.name : data.date;

		$_('[data-screen="load"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();
		$_('[data-screen="save"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();

		$_('[data-screen="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (Monogatari.component ('SLOT').render (slot, name, image, data));
		$_('[data-screen="save"] [data-ui="slots"]').append (Monogatari.component ('SLOT').render (slot, name, image, data));
	}

	static addAutoSlot (i, data) {
		// Check if the slot has an older format
		if (typeof data.Engine !== 'undefined') {
			data.name = data.Name;
			data.date = data.Date;
			data.image = data.Engine.Scene;
		}

		const slot = `${Monogatari.setting ('AutoSaveLabel')}_${i}`;
		const image  = Monogatari.asset ('scenes', data.image);


		const name = data.name ? data.name : data.date;

		$_('[data-screen="load"] [data-ui="slots"] [data-string="NoAutoSavedGames"]').remove ();
		$_('[data-screen="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (Monogatari.component ('SLOT').render (slot, name, image, data));
	}

	// Gets the highest number currently available as a slot id (Save_{?})
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
			const date = moment ().format ();

			if (name === null || name.trim () === '') {
				name = date;
			}

			// We have to get the last ID available for the slots
			return Monogatari.getMaxSlotId (prefix).then ((max) => {

				// Make it the next one to the max
				if (id === null) {
					id = max + 1;
				}

				return Monogatari.Storage.set (`${Monogatari.setting (prefix)}_${id}`, {
					name,
					date,
					image: Monogatari.state ('scene').split (' ')[2],
					game: Monogatari.object ()
				});
			});
		}
	}

	/**
	 * @static loadFromSlot - Load a slot from the storage. This will recover the
	 * state of the game from what was saved in it.
	 *
	 * @param {string} slot - The key with which the slot was saved on the storage
	 */
	static loadFromSlot (slot) {
		document.body.style.cursor = 'wait';
		Monogatari.global ('playing', true);

		Monogatari.resetGame ().then (() => {
			$_(`${Monogatari.selector} [data-screen]`).hide();
			$_(`${Monogatari.selector} [data-screen="game"]`).show();

			Monogatari.Storage.get (slot).then ((data) => {
				// Check if an older save format was used so we can transform
				// that information into the new format
				if (typeof data.Engine !== 'undefined') {

					// Set the game state
					Monogatari.state ({
						step: data.Engine.Step,
						label: data.Engine.Label,
						scene: `show scene ${data.Engine.Scene}`,
					});

					// Retrieve if a song was playing so we can set it to the state
					if (data.Engine.Song !== '' && typeof data.Engine.Song !== 'undefined') {
						Monogatari.state ({
							music: [data.Engine.Song],
						});
					}

					// Retrieve if a sound was playing so we can set it to the state
					if (data.Engine.Sound !== '' && typeof data.Engine.Sound !== 'undefined') {
						Monogatari.state ({
							sound: [data.Engine.Sound],
						});
					}

					// Retrieve if particles were shown so we can set it to the state
					if (data.Engine.Particles !== '' && typeof data.Engine.Particles !== 'undefined') {
						Monogatari.state ({
							particles: `show particles ${data.Engine.Particles}`
						});
					}

					// Check if there are images to be shown
					if (data.Show !== '' && typeof data.Show !== 'undefined') {
						const show = data.Show.split (',');

						// For every image saved, add their element to the game
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

					// Set all the history variables with the ones from the old
					// format
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
					// If the new format is being used, things are a lot more simple
					const { state, history, storage } = data.game;
					Monogatari.state (state);
					Monogatari.history (history);
					Monogatari.storage (storage);
				}

				// Run the onLoad event of all the actions
				const promises = [];
				for (const action of Monogatari.actions ()) {
					promises.push (action.onLoad ());
				}

				Promise.all (promises).then (() => {
					// Finally show the game and start playing
					$_('[data-screen="game"]').show ();
					Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
					document.body.style.cursor = 'auto';
				});
			});
		});
	}

	/**
	 * @static assertAsync - This function will run any function asynchronously
	 * regardless of if the function to be run is async or not.
	 *
	 * @param {function} callable - The function to run
	 * @param {Object} [self=null] - The reference to `this` in the function
	 * @param {any[]} [args=null] - The arguments with which to call the function
	 * @returns {Promise} - Resolves if the function returned true and rejects if
	 * the function returned false.
	 */
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

	/**
	 * @static canProceed - Check if the game can proceed
	 *
	 * @returns {Promise} - Resolves if the game can proceed or reject if it
	 * can't proceed right now.
	 */
	static canProceed () {
		const promises = [];

		Monogatari.debug ().groupCollapsed ('canProceed Check');
		// Check action by action if they will allow the game to proceed
		for (const action of Monogatari.actions ()) {
			promises.push (action.canProceed ().then (() => {
				Monogatari.debug ().debug (`OK ${action.id}`);
			}).catch ((e) => {
				Monogatari.debug ().debug (`FAIL ${action.id}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}

		// Check if the game is visible, if it's not, then it probably is not
		// playing or is looking at some menu and thus the game should not
		// proceed. The game will not proceed if it's blocked or if the distraction
		// free mode is enabled.
		if ($_('[data-screen="game"]').isVisible ()
			&& !$_('[data-component="modal"]').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises).finally (() => {
			Monogatari.debug ().groupEnd ();
		});
	}

	/**
	 * @static canRevert - Check if the game can revert
	 *
	 * @returns {Promise} - Resolves if the game can be reverted or reject if it
	 * can't be reverted right now.
	 */
	static canRevert () {
		const promises = [];

		Monogatari.debug ().groupCollapsed ('canRevert Check');
		// Check action by action if they will allow the game to revert
		for (const action of Monogatari.actions ()) {
			promises.push (action.canRevert ().then (() => {
				Monogatari.debug ().debug (`OK ${action.id}`);
			}).catch ((e) => {
				Monogatari.debug ().debug (`FAIL ${action.id}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}

		// Check if the game is visible, if it's not, then it probably is not
		// playing or is looking at some menu and thus the game should not
		// revert. The game will not revert if it's blocked or if the distraction
		// free mode is enabled.
		if ($_('[data-screen="game"]').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises).finally (() => {
			Monogatari.debug ().groupEnd ();
		});
	}

	/**
	 * @static playAmbient - Play the main menu music using the key defined in the
	 * 'MainScreenMusic' property of the game settings.
	 */
	static playAmbient () {
		// Check if a menu music was defined
		if (Monogatari.setting ('MainScreenMusic') !== '') {

			// Make the ambient player loop
			Monogatari.ambientPlayer.setAttribute ('loop', '');

			// Check if the music was defined in the music assets object
			if (typeof Monogatari.asset ('music', Monogatari.setting ('MainScreenMusic')) !== 'undefined') {

				// Get the full path to the asset and set the src to the ambient player
				Monogatari.ambientPlayer.setAttribute('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').music}/${Monogatari.asset ('music', Monogatari.setting ('MainScreenMusic'))}`);

				// Play the music but catch any errors. Error catching is necessary
				// since some browsers like chrome, have added some protections to
				// avoid media from being autoplayed. Because of these protections,
				// the user needs to interact with the page first before the media
				// is able to play.
				Monogatari.ambientPlayer.play ().catch (() => {

					// Create a broadcast message
					const element = `
						<div data-ui="broadcast">
							<p data-string="AllowPlayback">${Monogatari.string ('AllowPlayback')}.</p>
						</div>
					`;

					// Add it to the main menu and game screens
					$_(`${Monogatari.selector} [data-screen='main']`).prepend (element);
					$_(`${Monogatari.selector} [data-screen="game"]`).prepend (element);

					// Try to play the media again once the element has been clicked
					// and remove it.
					$_(`${Monogatari.selector} [data-ui="broadcast"]`).click (() => {
						this.playAmbient ();
						$_(`${Monogatari.selector} [data-ui="broadcast"]`).remove ();
					});
				});
			} else {
				FancyError.show (
					`The music "${Monogatari.setting ('MainScreenMusic')}" is not defined.`,
					'Monogatari attempted to find a definition of a music asset but there was none.',
					{
						'Music Not Found': Monogatari.setting ('MainScreenMusic'),
						'You may have meant one of these': Object.keys (Monogatari.assets ('music')),
						'Help': {
							'_': 'Please check that you have correctly defined this music asset and wrote its name correctly in the `MainScreenMusic` variable',
							'_1': `
								<pre>
									<code class='language-javascript'>
									'MainScreenMusic': 'TheKeyToYourMusicAsset'
									</code>
								</pre>
							`,
						}
					}
				);
			}
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

		// Run the reset method of all the actions so each of them can reset
		// their own elements correctly
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.reset ());
		}
		return Promise.all (promises);
	}

	static next () {
		// Advance 1 step
		Monogatari.state ({
			step: Monogatari.state ('step') + 1
		});

		// Clear the Stack using a Time Out instead of calling the function
		// directly, preventing an Overflow
		setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);
	}

	static previous () {
		Monogatari.revert ().catch (() => {
			// The game could not be reverted, either because an
			// action prevented it or because there are no statements
			// left to revert to.
		});

	}

	// Start game automatically without going trough the main menu
	static showMainScreen () {
		if (!Monogatari.setting ('ShowMainScreen')) {
			Monogatari.stopAmbient ();
			Monogatari.global ('playing', true);
			$_(`${Monogatari.selector} [data-screen]`).hide ();
			$_(`${Monogatari.selector} [data-screen="game"]`).show ();
			Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		} else {
			// Play the main menu song
			Monogatari.playAmbient ();
			$_('[data-screen="main"]').show ();
		}
	}

	static showSplashScreen () {
		const labelName = Monogatari.setting ('SplashScreenLabel');
		if (typeof labelName === 'string' && labelName !== '') {
			const label = Monogatari.label (labelName);
			if (typeof label !== 'undefined') {
				Monogatari.state ({
					label: labelName
				});

				$_('[data-ui="quick-menu"]').hide ();
				$_(`${Monogatari.selector} [data-screen]`).hide ();
				$_(`${Monogatari.selector} [data-screen="game"]`).show ();
				Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
			} else {
				Monogatari.showMainScreen ();
			}
		} else {
			Monogatari.showMainScreen ();
		}
	}

	static keyboardShortcut (shortcut, callback) {
		mousetrap.bind (shortcut, (event) => {
			if (event.target.tagName.toLowerCase () != 'input') {
				event.preventDefault ();
				callback.call (null, event);
			}
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//

	/**
	 * @static autoPlay - Enable or disable the autoplay feature which allows the
	 * game to play itself (of sorts), it will go through the dialogs alone but
	 * will wait when user interaction is needed.
	 *
	 * @param {boolean} enable - Wether the auto play feature will be enabled (true)
	 * or disabled (false);
	 */
	static autoPlay (enable) {
		if (enable === true) {
			// The interval for autoplay speed is measured in minutes
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
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] [data-icon]`).replaceWith ('<span class="fas fa-stop-circle"></span>');
		} else {
			clearTimeout (Monogatari.global ('_AutoPlayTimer'));
			Monogatari.global ('_AutoPlayTimer', null);
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] [data-string]`).text (Monogatari.string ('AutoPlay'));
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="auto-play"] [data-icon]`).replaceWith ('<span class="fas fa-play-circle"></span>');
		}
	}

	/**
	 * @static distractionFree - Enable or disable the distraction free mode
	 * where the dialog box is hidden so that the player can look at the characters
	 * and background with no other elements on the way. A 'transparent' class
	 * is added to the quick menu when this mode is enabled.
	 */
	static distractionFree () {
		if (Monogatari.global ('playing')) {
			// Check if the distraction free is currently enabled
			if (Monogatari.global ('distraction-free') === true) {
				$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="distraction-free"] [data-string]`).text (Monogatari.string ('Hide'));
				$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="distraction-free"] [data-icon]`).replaceWith ('<span class="fas fa-eye"></span>');
				$_(`${Monogatari.selector} [data-ui="quick-menu"]`).removeClass ('transparent');
				$_(`${Monogatari.selector} [data-ui="text"]`).show ();
				Monogatari.global ('distraction-free', false);
			} else {
				$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="distraction-free"] [data-string]`).text (Monogatari.string ('Show'));
				$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="distraction-free"] [data-icon]`).replaceWith ('<span class="fas fa-eye-slash"></span>');
				$_(`${Monogatari.selector} [data-ui="quick-menu"]`).addClass ('transparent');
				$_(`${Monogatari.selector} [data-ui="text"]`).hide();
				Monogatari.global ('distraction-free', true);
			}
		}
	}

	/**
	 * @static object - Get all the relevant information of the game state
	 *
	 * @returns {Object} - An object containing the current histories, state and
	 * storage variables.
	 * @returns {Object} history - The full history object
	 * @returns {Object} state - The full state object
	 * @returns {Object} storage- The full storage object
	 */
	static object () {
		return {
			history: Monogatari.history (),
			state: Monogatari.state (),
			storage: Monogatari.storage ()
		};
	}

	/**
	 * @static revert - This is the function that allows to go back in the game
	 * by reverting the statements played.
	 *
	 * @returns {Promise} - Whether the game was able to go back or not
	 */
	static revert (statement = null, shouldAdvance = true) {

		Monogatari.debug ().groupCollapsed ('Revert Cycle');

		// Check if we have steps behind us to revert to. If there aren't, then
		// we can't revert since we are already at the first statement.
		let actionToRevert = null;

		if (statement !== null) {
			actionToRevert = statement;
		} else if (Monogatari.state ('step') >= 1) {
			actionToRevert = Monogatari.label ()[Monogatari.state ('step') - 1];
		} else {
			const jump = Monogatari.history ('jump').reverse ().find (o => {
				return o.destination.label === Monogatari.state ('label') && o.destination.step === 0;
			});

			if (typeof jump !== 'undefined') {
				Monogatari.state ({
					label: jump.source.label,
					step: jump.source.step
				});
				actionToRevert = Monogatari.label ()[Monogatari.state ('step')];
			}
		}

		Monogatari.debug ().debug ('Reverting Action', actionToRevert);

		if (actionToRevert !== null) {

			// Iterate over all the registered actions to find one that matches with
			// the statement to revert.
			for (const action of Monogatari.actions ()) {
				let actionStatement = actionToRevert;
				let matches = false;

				// Use the correct matching function (matchString or matchObject)
				// depending on the type of the current statement. If the statement
				// is a pure js function, it won't be reverted since we don't
				// know what to do to revert it.
				if (typeof actionStatement === 'string') {
					// Split the statement into an array using the space separations
					actionStatement = actionStatement.split (' ');

					// Check if it matches using the matchString method
					matches = action.matchString (actionStatement);
				} else if (typeof actionStatement === 'object') {
					// Check if it matches using the matchObject method
					matches = action.matchObject (actionStatement);
				}

				// Check if the statement matched any of the registered actions
				if (matches === true) {
					// Create an instance of the action and initialize it with the
					// current statement
					const act = new action (actionStatement);

					// The original statement is set just in case the action needs
					// access to it
					act._setStatement (actionStatement);

					// The current cycle is also set just in case the action needs to
					// know what cycle it's currently being performed.
					act._setCycle ('Revert');

					// Monogatari is set as the context of the action so that it can
					// access all its functionalities
					act.setContext (Monogatari);

					// Run the willRevert method of the action first. This method
					// is usually used to tell whether an action can be reverted
					// or not.
					return act.willRevert ().then (() => {
						Monogatari.debug ().debug ('Action Will Revert');
						// If it can be reverted, then run the revert method
						return act.revert ().then (() => {
							Monogatari.debug ().debug ('Action Reverting');
							// If the reversion was successful, run the didRevert
							// function. The action will return a boolean (shouldContinue)
							// specifying if the game should go ahead and revert
							// the previous statement as well or if it should
							// wait instead
							return act.didRevert ().then (({ advance, step }) => {
								Monogatari.debug ().debug ('Action Did Revert');
								// Since we reverted correctly, the step should
								// go back.
								if (step === true) {
									Monogatari.state ({
										step: Monogatari.state ('step') - 1
									});
								}

								// Revert the previous statement if the action
								// told us to.
								if (advance === true && shouldAdvance === true) {
									// Clear the Stack using a Time Out instead
									// of calling the function directly, preventing
									// an Overflow
									setTimeout (Monogatari.revert, 0);
								}

								Monogatari.debug ().trace ();
								Monogatari.debug ().groupEnd ();

							});
						});
					}).catch ((e) => {
						if (typeof e === 'object' || typeof e === 'string') {
							console.error (e);
						}
						// Clear the Stack using a Time Out instead of calling
						// the function directly, preventing an Overflow
						setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);

						Monogatari.debug ().trace ();
						Monogatari.debug ().groupEnd ();

						return Promise.resolve ();
					});
				}
			}
		} else {
			// Clear the Stack using a Time Out instead of calling
			// the function directly, preventing an Overflow
			setTimeout (Monogatari.run, 0, Monogatari.label ()[Monogatari.state ('step')]);
			Monogatari.debug ().trace ();
			Monogatari.debug ().groupEnd ();

			return Promise.resolve ();
		}
		Monogatari.debug ().trace ();
		Monogatari.debug ().groupEnd ();
		return Promise.reject ();
	}

	/**
	 * @static run - Run a specified statement.
	 *
	 * @param {string|Object|function} statement - The Monogatari statement to run
	 * @param {boolean} advance - Whether the game should advance or wait for user
	 * interaction. This parameter is mainly used to prevent the game from advancing
	 * when loading the game or performing some actions and we don't want them to
	 * affect the game flow.
	 *
	 * @returns {Promise} - Resolves if the statement was run correctly or rejects
	 * if it couldn't be run correctly.
	 */
	static run (statement, shouldAdvance = true) {
		Monogatari.debug ().groupCollapsed ('Run Cycle');

		// Don't allow null as a valid statement
		if (statement === null) {
			return Promise.reject ();
		}

		Monogatari.debug ().debug ('Running Action', statement);

		// Iterate over all the registered actions to find one that matches with
		// the statement to run.
		for (const action of Monogatari.actions ()) {
			let actionStatement = statement;
			let matches = false;

			// Use the correct matching function (matchString or matchObject)
			// depending on the type of the current statement. If the statement
			// is a function, it will simply be run.
			if (typeof statement === 'string') {
				// Split the statement into an array using the space separations
				actionStatement = Monogatari.replaceVariables (statement).split (' ');

				// Check if it matches using the matchString method
				matches = action.matchString (actionStatement);
			} else if (typeof statement === 'object') {
				// Check if it matches using the matchObject method
				matches = action.matchObject (statement);
			} else if (typeof actionStatement === 'function') {
				// Block the game while the function is being run
				Monogatari.global ('block', true);

				// Run the function asynchronously and after it has run, unblock
				// the game so it can continue.
				return Util.callAsync (actionStatement, Monogatari).finally (() => {
					Monogatari.global ('block', false);
					if (shouldAdvance) {
						return Monogatari.next ();
					}
				});
			}

			// Check if the statement matched any of the registered actions
			if (matches === true) {
				// Create an instance of the action and initialize it with the
				// current statement
				const act = new action (actionStatement);

				// The original statement is set just in case the action needs
				// access to it
				act._setStatement (statement);

				// The current cycle is also set just in case the action needs to
				// know what cycle it's currently being performed.
				act._setCycle ('Application');

				// Monogatari is set as the context of the action so that it can
				// access all its functionalities
				act.setContext (Monogatari);

				// Run the willApply method of the action first
				return act.willApply ().then (() => {
					Monogatari.debug ().debug ('Action Will Apply');

					// Run the apply method
					return act.apply (shouldAdvance).then (() => {
						Monogatari.debug ().debug ('Action Applying');

						// If everything has been run correctly, then run the
						// didApply method. The action will return a boolean
						// (shouldContinue) specifying if the game should run the
						// next statement right away or if it should wait instead
						return act.didApply ().then (({ advance }) => {
							Monogatari.debug ().debug ('Action Did Apply');
							if (advance === true && shouldAdvance === true) {
								Monogatari.debug ().debug ('Next action will be run right away');
								Monogatari.next ();
							}
							Monogatari.debug ().trace ();
							Monogatari.debug ().groupEnd ();
						});
					});
				}).catch (() => {
					Monogatari.debug ().trace ();
					Monogatari.debug ().groupEnd ();
				});
			}
		}
		Monogatari.debug ().trace ();
		Monogatari.debug ().groupEnd ();
	}

	static setup (selector) {
		// Set the initial settings if they don't exist or load them from the
		// Storage if they do.
		Monogatari.Storage.get ('Settings').then ((local_settings) => {
			Monogatari._preferences = merge (Monogatari._preferences, local_settings);
		}).catch (() => {
			Monogatari.Storage.set ('Settings', Monogatari._preferences);
		});

		// Register service worker. The service worker will save all requests into
		// the cache so the game loads more quickly and we can play offline. The
		// service worker will only be used if it was allowed by the settings and
		// if we are not running in a local platform such as electron or cordova
		// where the assets are expected to be available locally and thus don't
		// require being cached.
		if (Monogatari.setting ('ServiceWorkers')) {
			if (!Platform.electron () && !Platform.cordova () && Platform.serviceWorkers ()) {
				// TODO: There's a place in hell for this quick fix, the splitting
				// of the sw file is just preventing parcel from trying to bundle it
				// when building the core libraries.
				navigator.serviceWorker.register ('./../service-worker' + '.js').then ((registration) => {

					// Check if an update to the service worker was found
					registration.onupdatefound = () => {
						const worker = registration.installing;
						worker.onstatechange = () => {
							// Once the updated service worker has been installed,
							// show a notice to the players so that they reload the
							// page and get the latest content.
							if (worker.state === 'installed') {
								if (navigator.serviceWorker.controller) {
									const element = `
										<div data-ui="broadcast">
											<p data-string="NewContent">${Monogatari.string ('NewContent')}.</p>
										</div>
									`;
									$_(`${selector} [data-screen='main']`).prepend (element);
									$_(`${selector} [data-screen="game"]`).prepend (element);
									$_(`${selector} [data-ui="broadcast"]`).click (() => {
										$_(`${selector} [data-ui="broadcast"]`).remove ();
									});
								}
							}
						};
					};
				});
			} else {
				console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
			}
		}

		// Save the structure of the storage variable. The structure is saved as
		// a string so that we have a reference to how the storage was originally
		// and we can reset the storage when the game ends.
		Monogatari.global ('storageStructure', JSON.stringify(Monogatari.storage ()));

		// The open-screen action does exactly what it says, it takes the
		// data-screen property of the object it's in and then opens that
		// menu, meaning it hides everything else and shows that one.
		Monogatari.registerListener ('open-screen', {
			callback: (element) => {
				$_(`${Monogatari.selector} [data-screen]`).hide();

				if (element.data ('open') == 'save') {
					$_(`${Monogatari.selector} [data-screen="save"] [data-input="slotName"]`).value (moment ().format ('MMMM Do YYYY, h:mm:ss a'));
				}
				$_(`${Monogatari.selector} [data-screen="${element.data('open')}"]`).show ();
			}
		});

		// The start action starts the game so it shows the game screen
		// and the game starts
		Monogatari.registerListener ('start', {
			callback: () => {
				Monogatari.stopAmbient();
				Monogatari.global ('playing', true);

				Monogatari.onStart ().then (() => {
					$_(`${Monogatari.selector} [data-screen]`).hide ();
					$_('[data-ui="quick-menu"]').show ();
					$_(`${Monogatari.selector} [data-screen="game"]`).show ();

					// Check if the initial label exists
					if (Monogatari.label ()) {
						Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
					} else {

					}
				});
			}
		});

		// The close action removes the active class from the element it
		// points to.
		Monogatari.registerListener ('close', {
			callback: (element) => {
				$_(`${Monogatari.selector} [data-ui="${element.data('close')}"]`).removeClass('active');
				return true;
			}
		});

		Monogatari.registerListener ('dismiss-notice', {
			callback: () => {
				$_(`${Monogatari.selector} [data-notice]`).removeClass('modal--active');
			}
		});

		Monogatari.registerListener ('distraction-free', {
			keys: 'h',
			callback: () => {
				Monogatari.distractionFree ();
			}
		});

		Monogatari.registerListener ('skip', {
			keys: 's',
			callback: () => {
				if (Monogatari.global ('playing')) {
					if (Monogatari.global ('skip') !== null) {
						Monogatari.skip (false);
					} else {
						Monogatari.skip (true);
					}
				}
			}
		});

		// Add listener to the auto-play buttons, activating or deactivating the
		// auto-play feature
		Monogatari.registerListener ('auto-play', {
			callback: () => {
				Monogatari.autoPlay (Monogatari.global ('_AutoPlayTimer') === null);
			}
		});

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
	 * @static skip - Enable or disable the skip mode which is similar to auto
	 * play but simply skips fast through the game.
	 *
	 * @param {boolean} enable - Wether it should be enabled (true) or disabled (false)
	 */
	static skip (enable) {
		if (enable === true) {
			// Check if Skip was enabled on the settings, if it has a value greater
			// than 0, it represents the speed with which the game will skip through
			// statements. If it's lesser or equal to 0 then it's disabled.
			if (Monogatari.setting ('Skip') > 0) {

				$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="skip"] [data-icon]`).replaceWith ('<span class="far fa-play-circle"></span>');

				// Start the timeout with the time specified on the settings. We
				// save it on a global variable so that we can disable later.
				Monogatari.global ('skip', setTimeout (() => {
					Monogatari.canProceed ().then (() => {
						Monogatari.next ();
					}).catch (() => {
						// An action waiting for user interaction or something else
						// is blocking the game.
					});

					// Start all over again
					Monogatari.skip (true);
				}, Monogatari.setting ('Skip')));
			}
		} else {
			clearTimeout (Monogatari.global ('skip'));
			Monogatari.global ('skip', null);
			$_(`${Monogatari.selector} [data-ui="quick-menu"] [data-action="skip"] [data-icon]`).replaceWith ('<span class="fas fa-fast-forward"></span>');
		}
	}

	static registerListener (name, listener, replace = false) {
		listener.name = name;
		if (replace === true) {
			const index = Monogatari._listeners.findIndex (listener => listener.name === name);

			if (index > -1) {
				Monogatari._listeners[index] = listener;
			} else {
				Monogatari._listeners.push (listener);
			}
		} else {
			Monogatari._listeners.push (listener);
		}
	}

	static runListener (name, element, event) {
		const promises = [];

		// Check if the click event happened on a path of an icon.
		// This fixes a bug with font-awesome icons being clicked but the
		// click being registered at an inner path instead of the svg element
		// that holds the data information
		if (element.matches ('path')) {
			element = element.closest ('[data-action]');

			if (element.length > 0) {
				name = element.data ('action');
			}
		}

		for (const listener of Monogatari._listeners) {
			if (listener.name === name) {
				promises.push (Monogatari.assertAsync (listener.callback , Monogatari, [element, event]).finally (() => {
					// Unblock the game so the player can continue
					Monogatari.global ('block', false);
				}));
				Monogatari.debug ().debug ('Running Listener', name);
			}
		}

		Promise.all (promises).catch (() => {
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();
			Monogatari.debug ().debug ('Listener Event Propagation Stopped');
		});
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

				// Display or remove the device orientation notice depending on the
				// current device orientation
				if (Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_(`${selector} [data-notice="orientation"]`).addClass ('modal--active');
				} else {
					$_(`${selector} [data-notice="orientation"]`).removeClass ('modal--active');
				}
			}, false);
		}

		// Add event listener for back buttons. If the player is playing, the back
		// button will return to the game, if its not playing, then it'll return
		// to the main menu.
		$_(`${selector} [data-screen]`).on ('click', '[data-action="back"]:not([data-screen="game"]), [data-action="back"]:not([data-screen="game"]) *', () => {
			$_(`${selector} [data-screen]`).hide ();

			if (Monogatari.global ('playing')) {
				$_(`${selector} [data-screen="game"]`).show ();
			} else {
				$_(`${selector} [data-screen="main"]`).show ();
			}
		});

		// Add listeners for the data-action properties
		$_(`${selector}`).on ('click', '[data-action], [data-action] *', function (event) {
			const element = $_(this);
			const action = element.data ('action');

			Monogatari.runListener (action, element, event);
		});

		for (const listener of Monogatari._listeners) {
			const { keys, callback } = listener;
			if (typeof keys !== 'undefined') {
				Monogatari.keyboardShortcut (keys, callback);
			}
		}

		Monogatari.keyboardShortcut (['right', 'space'], () => {
			Monogatari.canProceed ().then (() => {
				Monogatari.next ();
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		Monogatari.keyboardShortcut ('esc', () => {
			if ($_(`${selector} [data-screen="game"]`).isVisible () && Monogatari.global ('playing')) {
				$_(`${selector} [data-screen="game"]`).hide ();
				$_(`${selector} [data-screen="settings"]`).show();
			} else if ($_(`${selector} [data-screen="settings"]`).isVisible () && Monogatari.global ('playing')) {
				$_(`${selector} [data-screen="settings"]`).hide ();
				$_(`${selector} [data-screen="game"]`).show ();
			}
		});

		Monogatari.keyboardShortcut ('shift+s', () => {
			if (Monogatari.global ('playing')) {
				$_(`${Monogatari.selector} [data-screen]`).hide();

				$_(`${Monogatari.selector} [data-screen="save"] [data-input="slotName"]`).value (moment ().format ('MMMM Do YYYY, h:mm:ss a'));
				$_(`${Monogatari.selector} [data-screen="save"]`).show();
			}
		});

		Monogatari.keyboardShortcut ('shift+l', () => {
			if (Monogatari.global ('playing')) {
				$_(`${Monogatari.selector} [data-screen]`).hide();
				$_(`${Monogatari.selector} [data-screen="load"]`).show();
			}
		});

		Monogatari.keyboardShortcut ('shift+q', () => {
			if (Monogatari.global ('playing')) {
				$_(`${Monogatari.selector} [data-notice="exit"]`).addClass ('modal--active');
			}
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

	static upgrade (oldVersion, newVersion, callbacks) {
		Monogatari._upgrade[`${oldVersion}::${newVersion}`] = callbacks;
	}

	static setupStorage () {
		// Check if an Adapter has been set or else, the global local storage
		// object will be used
		if (Monogatari.setting ('Storage').Adapter.trim () !== '') {
			let adapter;

			switch (Monogatari.setting ('Storage').Adapter) {
				case 'LocalStorage':
					adapter = SpaceAdapter.LocalStorage;
					break;

				case 'SessionStorage':
					adapter = SpaceAdapter.SessionStorage;
					break;

				case 'IndexedDB':
					adapter = SpaceAdapter.IndexedDB;
					break;

				case 'RemoteStorage':
					adapter = SpaceAdapter.RemoteStorage;
					break;

				default:
					adapter = SpaceAdapter.LocalStorage;
					break;
			}

			Monogatari.Storage = new Space (adapter, {
				name: Text.friendly (Monogatari.setting ('Name')),
				version: Monogatari.setting ('Version'),
				store:  Monogatari.setting ('Storage').Store,
				endpoint: Monogatari.setting ('Storage').Endpoint,
				props: {
					keyPath: 'id'
				}
			});
		}

		// Setup all the upgrade functions
		for (const upgrade of Object.keys (Monogatari._upgrade)) {
			const [oldVersion, newVersion] = upgrade.split ('::');
			const callback = Monogatari._upgrade[upgrade].storage;

			Monogatari.Storage.upgrade (oldVersion, newVersion, callback);
		}
	}

	static init (selector = '#monogatari') {

		if (Monogatari.Storage.configuration ().name === '') {
			Monogatari.setupStorage ();
		}

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
				if (Monogatari.setting ('Orientation') !== 'any') {
					if (Platform.mobile () && Platform.orientation () !== Monogatari.setting ('Orientation')) {
						$_(`${selector} [data-notice="orientation"]`).addClass ('modal--active');
					}
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

				// Preload all the game assets
				Monogatari.preload ().then(() => {
					$_(`${selector} [data-screen="loading"]`).fadeOut (400, () => {
						$_(`${selector} [data-screen="loading"]`).hide ();
					});
				}).catch ((e) => {
					console.error (e);
				}).finally (() => {
					if (Monogatari.label ()) {
						Monogatari.showSplashScreen ();
					} else {

					}
				});

				if (!(Monogatari.setting ('Skip') > 0)) {
					Monogatari.component ('QUICK_MENU').remove ('Skip');
				}

				for (const component of Monogatari.components ()) {
					component.init (selector);
				}

				for (const action of Monogatari.actions ()) {
					action.init (selector);
				}
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

Monogatari.Storage = new Space ();

Monogatari._mediaPlayers = {
	music: {},
	sound: {},
	voice: {},
	video: {}
};

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

// These are the default settings and they are overwritten by the user's settings
// New elements here will no conflict with the user's settings and allows a better
// update experience
Monogatari._settings = {

	// The name of your game, this will be used to store all the data so once
	// you've released a game using one name, it shouldn't change. Please use the
	// Version Setting to indicate a new release of your game!
	'Name': 'My Visual Novel',

	// The version of your game in semantic versioning (https://semver.org/).
	'Version': '0.1.0',

	// Initial Label *
	'Label': 'Start',

	// Number of AutoSave Slots
	'Slots': 10,

	// Change to true for a MultiLanguage GameScreen.
	'MultiLanguage': false,

	// Music for the Main Menu.
	'MainScreenMusic': '',

	// Prefix for the Save Slots in Local Storage.
	'SaveLabel': 'Save',
	'AutoSaveLabel': 'AutoSave',

	// Turn main menu on/off; Default: true *
	'ShowMainScreen': true,

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

	// Enables or disables the typing text animation in NVL dialogs for the
	// whole game.
	'NVLTypeAnimation': true,

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
	'Orientation': 'any',

	// Allow players to skip through the game. Similar to the auto play feature,
	// skipping will allow players to go through the game really fast.
	// If this value is set to 0, no skipping will be allowed but if it's set
	// to a higher number, skipping will be allowed and that value will be taken
	// as the speed in milliseconds with which the game will skip through the script
	'Skip': 0,

	// Define the directories where the assets are located. The root directory is
	// the holder for the other asset specific directories, this directories are
	// used when retrieving the files on the game.
	'AssetsPath': {
		'root': 'assets',
		'characters': 'characters',
		'icons': 'icons',
		'images': 'images',
		'music': 'music',
		'scenes': 'scenes',
		'sound': 'sound',
		'ui': 'ui',
		'video': 'video',
		'voice': 'voice'
	},

	// Name of the Splash Screen Label. If a name is given and a label with that
	// name exists on the game's script, it will be used to show a splash screen
	// right after the loading screen.
	'SplashScreenLabel': '_SplashScreen',

	// Define what storage engine should be used to save the game data. *
	// Adapters Available:
	// - LocalStorage: This one is used by default
	// - SessionStorage: Same as LocalStorage but will be cleared when the page
	// 					 is closed.
	// - IndexedDB: The information is saved using the IndexedDB web API
	// - RemoteStorage: The information will be sent and retrieved from a given
	//					URL Endpoint providing a REST API.
	'Storage': {
		'Adapter': 'LocalStorage',
		'Store': 'GameData',
		'Endpoint': ''
	}
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
	_AutoPlayTimer: null,
	skip: null,
	_log: []
});

Monogatari._listeners = [];

Monogatari._templates = {};

Monogatari._upgrade = {};

Monogatari._temp = {};

Monogatari.Storage = new Space ();

Monogatari.version = '2.0.0';

export { Monogatari };