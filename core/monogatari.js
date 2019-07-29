import { $_, Space, SpaceAdapter, Platform, Preload, Util, FileSystem, Text, Debug } from '@aegis-framework/artemis';
import moment from 'moment';
import mousetrap from 'mousetrap';
import { FancyError } from './lib/FancyError';
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
 * Script: All the labels and statements that make up the story and game play.
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

		for (const component of this.components ()) {
			promises.push (component.onStart ());
		}

		for (const action of this.actions ()) {
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

		for (const component of this.components ()) {
			promises.push (component.onLoad ());
		}

		for (const action of this.actions ()) {
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
		return  parseInt (getComputedStyle(this.element (true)).width.replace ('px', ''));
	}

	/**
	 * @static height - Determines the real height of the Monogatari element, pretty
	 * useful when dealing with canvas or other things that require specific measurements.
	 *
	 * @return {number} - Computed Width of the element
	 */
	static height () {
		return getComputedStyle(this.element (true)).height.replace ('px', '');
	}

	/**
	 * @static debug - If the Monogatari debug file is present, this function
	 * will give access to the debug tools that are a replacement for the console
	 * log functions.
	 *
	 * @return {Proxy <Debug>} - Proxy to the Artemis Debug Class
	 */
	static get debug () {
		return new Proxy (Debug, {
			apply (target, receiver, args) {
				if (typeof MonogatariDebug === 'object') {
					return Reflect.apply (target, receiver, args);
				}
			}
		});
	}

	static set debug (value) {
		throw new Error ('Debug reference cannot be overriden.');
	}

	/**
	 * @static string - Gets the translation of a string. This is of course limited
	 * to the translations defined for each language using the translation
	 * function.
	 *
	 * @param  {string} key - The key of the string whose translation is needed
	 *
	 * @return {string} - String translation in the current language given the
	 * user's preferences.
	 */
	static string (key) {
		if (typeof this._translations[this.preference ('Language')] !== 'undefined') {
			if (typeof this._translations[this.preference ('Language')][key] !== 'undefined') {
				return this._translations[this.preference ('Language')][key];
			} else {
				FancyError.show (
					`Translation for string "${key}" could not be found`,
					'Monogatari attempted to find a translation for the current language set in the preferences but there was none.',
					{
						'String Not Found': key,
						'Language': this.preference ('Language'),
						'Found in these elements': $_(`[data-string="${key}"]`).collection,
						'You may have meant one of these': Object.keys (this._translations[this.preference ('Language')]),
						'Help': {
							'_': 'Please check that this string has been correctly defined in your translations. A translation is defined as follows:',
							'_1': `
								<pre>
									<code class='language-javascript'>
									monogatari.translation ("YourLanguage", {
										"SomeString": "Your Translation"
									});
									</code>
								</pre>
							`,
							'_2': 'You may also want to check if the [data-string] property of the HTML elements above is correct or if they have a typo.',
							'Documentation': '<a href="https://this.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
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
					'Problematic Language': this.preference ('Language'),
					'You may have meant one of these': Object.keys (this._translations),
					'Help': {
						'_': 'Please check if you have defined correctly the translations for this language, translations are defined as follows:',
						'_1': `
							<pre>
								<code class='language-javascript'>
								monogatari.translation ("YourLanguage", {
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
						'Documentation': '<a href="https://this.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
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
				if (typeof this._history[object] === 'undefined') {
					this._history[object] = [];
				}
				return this._history[object];
			} else {
				this._history = Object.assign ({}, this._history, object);
			}
		} else {
			return this._history;
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
				return this._state[object];
			} else {
				this._state = merge (this._state, object);
			}
		} else {
			return this._state;
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
	static registerAction (action, naturalPosition = false) {
		action.engine = this;
		if (naturalPosition) {
			this._actions.push (action);
		} else {
			this._actions.unshift (action);
		}
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
		this._actions = this._actions.filter ((a) => a.id.toLowerCase () !== action.toLowerCase ());
	}

	/**
	 * @static actions - Returns the list of registered Actions.
	 *
	 * @return {Action[]} - List of registered Actions
	 */
	static actions () {
		return this._actions;
	}

	/**
	 * @static action - Access to an specific action class
	 *
	 * @param  {string} id - ID of the action you want to access to.
	 * @return {Action} - Returns the action that matches the given ID
	 */
	static action (id) {
		return this._actions.find ((a) => a.id.toLowerCase () === id.toLowerCase ());
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
		component.engine = this;
		window.customElements.define (component.tag, component);
		this._components.push (component);
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
		this._components = this._components.filter ((c) => c.tag.toLowerCase() !== component.toLowerCase());
	}

	/**
	 * @static components - Returns the list of registered Components.
	 *
	 * @return {Component[]} - List of registered Components
	 */
	static components () {
		return this._components;
	}

	/**
	 * @static component - Access to an specific component class
	 *
	 * @param {string} id - ID of the component you want to access to.
	 *
	 * @return {Component} - Returns the component class that matches the ID
	 */
	static component (id) {
		const normalizedId = id.toLowerCase ();

		return this.components ().find ((c) => c.tag === normalizedId);
	}

	/**
	 * @static assets - Simple function to modify and access the assets object,
	 * all declared assets such as audio, videos and images should be registered
	 * in these objects.
	 *
	 * @param  {string} [type = null] - The type of asset you are referring to
	 * @param  {Object} [object = null] - The key/value object to assign to that asset type
	 *
	 * @return {Object} - If this function is called with no arguments, the whole
	 * assets object will be returned.
	 */
	static assets (type = null, object = null) {
		if (type !== null && object !== null) {
			if (typeof this._assets[type] !== 'undefined') {
				this._assets[type] = Object.assign ({}, this._assets[type], object);
			} else {
				this._assets[type] = object;
			}
		} else if (type !== null) {
			if (typeof type === 'string') {
				return this._assets[type];
			} else if (typeof type === 'object') {
				this._assets = Object.assign ({}, this._assets, object);
			}
		} else {
			return this._assets;
		}
	}

	/**
	 * @static asset - Simple function to modify and access an specific asset
	 * given its type and name
	 *
	 * @param  {string} type - The type of asset you are referring to
	 * @param  {Object} name - The name or identifier of the asset you are trying
	 * to access
	 * @param  {Object} [value = null] - The key/value object to assign to that
	 * asset type
	 *
	 * @return {Object} - If this function is called with no arguments, the whole
	 * assets object will be returned.
	 */
	static asset (type, name, value = null) {
		if (typeof this._assets[type] !== 'undefined') {
			if (value !== null) {
				this._assets[type][name] = value;
			} else {
				return this._assets[type][name];
			}
		} else {
			console.error (`Tried to interact with a non-existing asset type ${type}.`);
		}
	}

	static characters (object = null) {
		if (object !== null) {
			// const identifiers = Object.keys (object);
			// for (const id of identifiers) {
			// 	this.character (id, object[id]);
			// }
			this._characters = merge (this._characters, object);
		} else {
			return this._characters;
		}
	}

	static character (id, object = null) {
		if (object !== null) {
			if (typeof this._characters[id] !== 'undefined') {
				this._characters[id] = merge (this._characters[id], object);
			} else {
				this._characters[id] = object;
			}
		} else {
			const character = this._characters[id];

			// Translate the old character properties into the new ones
			if (typeof character !== 'undefined') {
				if (typeof character.Images === 'object') {
					character.sprites = merge ({}, character.Images);
					delete character.Images;
				}

				if (typeof character.Directory === 'string') {
					character.directory = character.Directory;
					delete character.Directory;
				}

				if (typeof character.Color === 'string') {
					character.color = character.Color;
					delete character.Color;
				}

				if (typeof character.Name === 'string') {
					character.name = character.Name;
					delete character.Nme;
				}

				if (typeof character.Face === 'string') {
					character.default_expression = character.Face;
					delete character.Face;
				}

				if (typeof character.Side === 'object') {
					character.expressions = character.Side;
					delete character.Side;
				}

				if (typeof character.TypeAnimation === 'object') {
					character.type_animation = character.TypeAnimation;
					delete character.TypeAnimation;
				}
			}

			return character;
		}
	}

	static translations (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._translations[object];
			} else {
				this._translations = Object.assign ({}, this._translations, object);
			}
		} else {
			return this._translations;
		}
	}

	static translation (language, strings) {
		if (typeof this._translations[language] !== 'undefined') {
			this._translations[language] = Object.assign ({}, this._translations[language], strings);
		} else {
			this._translations[language] = strings;
		}
	}

	static setting (key, value = null) {
		if (value !== null) {
			this._settings[key] = value;
		} else {
			if (typeof this._settings[key] !== 'undefined') {
				return this._settings[key];
			} else {
				throw new Error (`Tried to access non existent setting with name '${key}'.`);
			}
		}
	}

	static settings (object = null) {
		if (object !== null) {
			this._settings = merge (this._settings, object);
		} else {
			return this._settings;
		}
	}

	static preference (key, value = null) {
		if (value !== null) {
			this._preferences[key] = value;
			this.Storage.update ('Settings', this._preferences);
		} else {
			if (typeof this._preferences[key] !== 'undefined') {
				return this._preferences[key];
			} else {
				throw new Error (`Tried to access non existent preference with name '${key}'.`);
			}
		}
	}

	static preferences (object = null, save = false) {
		if (object !== null) {

			this._preferences = merge (this._preferences, object);

			if (this.Storage.configuration ().name === '') {
				this.setupStorage ();
			}

			if (save === true) {
				this.Storage.update ('Settings', this._preferences);
			}
		} else {
			return this._preferences;
		}
	}

	/**
	 * Get or set the configuration.
	 *
	 * @param {string|object} key
	 * @param {object} object
	 */
	static configuration (key, object) {
		if (typeof key === 'string') {
			if (typeof object !== 'undefined') {
				this.trigger ('configurationElementWillUpdate');

				this.trigger (`configurationElementUpdate::${key}`, {
					newConfiguration: object,
					oldConfiguration: this._configuration[key]
				});

				this._configuration[key] = merge (this._configuration[key], object);

				this.trigger ('configurationElementDidUpdate');
			}
			return this._configuration[key];
		} else if (typeof key === 'object') {
			this.trigger ('configurationWillUpdate');
			this._configuration = merge (this._configuration, object);
			this.trigger ('configurationDidUpdate');
			return this._configuration;
		} else if (typeof key === 'undefined') {
			return this._configuration;
		}
	}

	static status (object = null) {
		if (object !== null) {
			this._status = Object.assign ({}, this._status, object);
		} else {
			return this._status;
		}
	}

	static storage (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._storage[object];
			} else {
				this._storage = merge (this._storage, object);
			}
		} else {
			return this._storage;
		}
	}

	static script (object = null) {

		if (typeof object === 'object' && object !== null) {
			this._script = Object.assign ({}, this._script, object);
		} else {
			let script = this._script;

			if (this.setting ('MultiLanguage') === true) {
				if (!Object.keys (script).includes (this.preference ('Language'))) {
					// First check if the label exists in the current script
					FancyError.show (
						`Script Language "${this.preference ('Language')}" Was Not Found`,
						'Monogatari attempted to retrieve the script for this language but it does not exists',
						{
							'Language Not Found': this.preference ('Language'),
							'MultiLanguage Setting': 'The Multilanguage Setting is set to '+ this.setting ('MultiLanguage'),
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
										monogatari.script ({
											'English': {
												'Start': [
													'Hi, welcome to your first Visual Novel with Monogatari.'
												]
											},
											'Español': {
												'Start': [
													'Hola, bienvenido a tu primer Novela Visual con Monogatari'
												]
											}
										});
										</code>
									</pre>
								`,
								'Documentation': '<a href="https://this.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>',
								'_4': `If ${this.preference ('Language')} should not be the default language, you can change that preference on your options.js file.`,
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
					script = script[this.preference ('Language')];
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
			if (typeof this._script[language] !== 'object') {
				this._script[language] = {};
			}
			this._script[language][key] = value;
		} else if (typeof language === 'object' && language !== null && value === null) {
			if (typeof this._script[key] !== 'object') {
				this._script[key] = [];
			}
			this._script[key] = language;
		} else if (typeof language === 'string' && value === null) {
			return this._script[language][key];
		} else if (key !== null) {
			return this.script (key);
		} else {
			return this.script (this.state ('label'));
		}
	}

	static fn (name, { apply = () => true, revert = () => true }) {
		if (typeof apply !== 'function' && typeof revert !== 'function') {
			return this._functions [name];
		} else {
			this._functions [name] = {
				apply,
				revert
			};
		}
	}

	static globals (object = null) {
		if (object !== null) {
			this._globals = merge (this._globals, object);
		} else {
			return this._globals;
		}
	}

	static global (key, value) {
		if (typeof value !== 'undefined') {
			this._globals[key] = value;
		} else {
			return this._globals[key];
		}
	}

	static template (key, value) {
		if (typeof value !== 'undefined') {
			this._templates[key] = value;
		} else {
			return this._templates[key];
		}
	}

	static mediaPlayers (key, object = false) {
		if (typeof key === 'string') {
			if (object) {
				return this._mediaPlayers[key];
			} else {
				return Object.values (this._mediaPlayers[key]);
			}
		}
		return this._mediaPlayers;
	}

	static mediaPlayer (type, key, value) {
		if (typeof value === 'undefined') {
			return this.mediaPlayers (type, true)[key];
		} else {
			value.dataset.type = type;
			value.dataset.key = key;
			this._mediaPlayers[type][key] = value;
			return this._mediaPlayers[type][key];
		}
	}

	static removeMediaPlayer (type, key) {
		if (typeof key === 'undefined') {
			for (const mediaKey of Object.keys (this.mediaPlayers (type, true))) {
				this._mediaPlayers[type][mediaKey].pause ();
				this._mediaPlayers[type][mediaKey].setAttribute ('src', '');
				this._mediaPlayers[type][mediaKey].currentTime = 0;
				delete this._mediaPlayers[type][mediaKey];
			}
		} else {
			if (typeof this._mediaPlayers[type][key] !== 'undefined') {
				this._mediaPlayers[type][key].pause ();
				this._mediaPlayers[type][key].setAttribute ('src', '');
				this._mediaPlayers[type][key].currentTime = 0;
				delete this._mediaPlayers[type][key];
			}

		}
	}

	static temp (key, value) {
		if (typeof value !== 'undefined') {
			this._temp[key] = value;
		} else {
			const value = this._temp[key];
			delete this._temp[key];
			return value;
		}
	}

	/**
	 * Localize every element with a data-string property using the translations
	 * available. If no translation is found for the current language, the current
	 * text of the element will be kept.
	 */
	static localize () {
		this.trigger ('willLocalize');
		this.element ().find ('[data-string]').each ((element) => {
			const string_translation = this.string ($_(element).data ('string'));

			// Check if the translation actually exists and is not empty before
			// replacing the text.
			if (typeof string_translation !== 'undefined' && string_translation !== '') {
				$_(element).text (string_translation);
			}
		});
		this.trigger ('didLocalize');
	}

	/**
	 * Preload game assets
	 */
	static preload () {
		const promises = [];

		// Check if asset preloading is enabled. Preloading will not be done in
		// electron or cordova since the assets are expected to be available
		// locally.
		if (this.setting ('Preload') && !Platform.electron () && !Platform.cordova () && location.protocol.indexOf ('file') < 0) {
			this.trigger ('willPreloadAssets');

			// Iterate over every asset category: music, videos, scenes etc.
			for (const category of Object.keys (this.assets ())) {
				// Iterate over every key on each category
				for (const asset of Object.values (this.assets (category))) {
					// Get the directory from where to load this asset
					const directory = `${this.setting ('AssetsPath').root}/${this.setting ('AssetsPath')[category]}`;

					if (FileSystem.isImage (asset)) {

						promises.push (Preload.image (`${directory}/${asset}`).then (() => {
							this.trigger ('assetLoaded', {
								name: asset,
								type: 'image',
								category
							});
						}));
					} else {
						promises.push (Preload.file (`${directory}/${asset}`).then (() => {
							this.trigger ('assetLoaded', {
								name: asset,
								type: 'file',
								category
							});
						}));
					}

					this.trigger ('assetQueued');
				}
			}

			for (const key in this.characters ()) {
				const character = this.character (key);
				let directory = '';

				// Check if the character has a directory defined where its images
				// are located
				if (typeof character.directory !== 'undefined') {
					directory = character.directory + '/';
				}
				directory = `${this.setting ('AssetsPath').root}/${this.setting ('AssetsPath').characters}/${directory}`;

				if (typeof character.sprites !== 'undefined') {
					for (const image of Object.values (character.sprites)) {
						promises.push (Preload.image (`${directory}${image}`).then (() => {
							this.trigger ('assetLoaded', {
								name: image,
								type: 'image',
								category: 'character'
							});
						}));
					}
				}

				if (typeof character.expressions !== 'undefined') {
					for (const image of Object.values (character.expressions)) {
						promises.push (Preload.image (`${directory}${image}`).then (() => {
							this.trigger ('assetLoaded', {
								name: image,
								type: 'image',
								category: 'character'
							});
						}));
					}
				}

				if (typeof character.default_expression !== 'undefined') {
					promises.push (Preload.image (`${directory}${character.default_expression}`).then (() => {
						this.trigger ('assetLoaded', {
							name: character.default_expression,
							type: 'image',
							category: 'character'
						});
					}));
				}

				this.trigger ('assetQueued');
			}

			return Promise.all (promises).then (() => {
				this.trigger ('didPreloadAssets');
				return Promise.resolve ();
			});
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
				let data = this.translations (this.preference ('Language'))[path[0]];

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}
		}
		return statement;
	}

	/**
	 * @static replaceVariables - Recursively replace all occurrences of
	 * {{variable_name}} with the actual value for that variable name on the
	 * storage object.
	 *
	 * @param {string} statement - The text where to interpolate the variables
	 *
	 * @returns {string} - The text with the interpolated variables
	 */
	static replaceVariables (statement) {
		statement = this.translate (statement);
		const matches = statement.match (/{{\S+?}}/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('{{', '').replace ('}}', '').split ('.');

				let data = this.storage ();

				for (let j = 0; j < path.length; j++) {
					const name = path[j];
					if (name in data) {
						data = data[name];
					} else {
						FancyError.show (
							`Variable "${match}" does not exists in your storage`,
							'Monogatari attempted to interpolate a variable from your storage but it doesn\'t exists.',
							{
								'Script Statement': statement,
								'Part Not Found': name,
								'Variables Available in Storage': Object.keys (data),
								'Help': {
									'_': 'Please check your storage object and make sure the variable you are using exists.',
									'_1': 'You should also make sure that there is no typo in your script and that the variable names in your script and storage match.',
									'Documentation': '<a href="https://developers.monogatari.io/documentation/script/storage" target="_blank">Storage</a>'
								}
							}
						);
						return '';
					}
				}
				statement = statement.replace (match, data);
			}
			return this.replaceVariables (statement);
		}
		return statement;
	}

	/**
	 * @static getMaxSlotId - Get the highest ID currently assigned to a slot on
	 * the storage.
	 *
	 * Each slot identifier has two parts i.e SaveLabel_{number}, it's label,
	 * defined by the 'SaveLabel' and 'AutoSaveLabel' configuration variables and
	 * a number similar to an auto-incrementing ID on a database. This function
	 * is used to retrieve the highest number assigned to a slot, given its
	 * label prefix.
	 *
	 * @param {string} prefix - The Slot prefix from where to retrieve the numeric ID,
	 * should be the value of either the 'SaveLabel' or 'AutoSaveLabel' configuration
	 * variables.
	 *
	 * @returns {int} - Highest available ID number
	 */
	static getMaxSlotId (prefix = 'SaveLabel') {
		return this.Storage.keys ().then ((keys) => {
			let max = 1;
			for (const saveKey of keys) {
				if (saveKey.indexOf (this.setting (prefix)) === 0) {
					const number = parseInt(saveKey.split (this.setting (prefix) + '_')[1]);
					if (number > max) {
						max = number;
					}
				}
			}
			return max;
		});
	}

	/**
	 * @static saveTo - Save the current game state into a given Slot
	 *
	 * @param {string} [prefix = 'SaveLabel'] - The prefix label to be used for the
	 * slot. Should be either 'SaveLabel' or 'AutoSaveLabel'.
	 * @param {int} [id = null] - The numeric ID to be used for the slot. If none
	 * is given, it will be determined using the getMaxSlotId function and upping
	 * it by 1
	 * @param {string} [name = null] - The name given by the player to the slot. If none is
	 * given, the current date will be used
	 *
	 * @returns {Promise} - The promise of the save operation
	 */
	static saveTo (prefix = 'SaveLabel', id = null, name = null) {
		// Check if the player is actually playing
		if (this.global ('playing')) {
			const date = moment ().format ();

			if (name === null || name.trim () === '') {
				name = date;
			}

			// We have to get the last ID available for the slots
			return this.getMaxSlotId (prefix).then ((max) => {

				// Make it the next one to the max
				if (id === null) {
					id = max + 1;
				}

				let image = '';

				if (this.state ('scene')) {
					image = this.state ('scene').split (' ')[2];
				} else if (this.state ('background')) {
					image = this.state ('background').split (' ')[2];
				}

				return this.Storage.set (`${this.setting (prefix)}_${id}`, {
					name,
					date,
					image,
					game: this.object ()
				});
			});
		}
	}

	/**
	 * @static assertAsync - This function will run any function asynchronously
	 * regardless of if the function to be run is async or not.
	 *
	 * @param {function} callable - The function to run
	 * @param {Object} [self=null] - The reference to `this` in the function
	 * @param {any[]} [args=null] - The arguments with which to call the function
	 *
	 * @returns {Promise} - Resolves if the function returned true and rejects if
	 * the function returned false.
	 */
	static assertAsync (callable, self = null, args = null) {
		const originalBlockValue = this.global ('block');

		this.global ('block', true);
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
		}).finally (() => {
			this.global ('block', originalBlockValue);
		});
	}

	/**
	 * @static next - Advance to the next statement on the script
	 *
	 * @returns {void}
	 */
	static next () {
		// Advance 1 step
		this.state ({
			step: this.state ('step') + 1
		});

		// Clear the Stack using a Time Out instead of calling the function
		// directly, preventing an Overflow
		setTimeout ((...params) => {
			this.run.call (Monogatari, ...params);
		}, 0, this.label ()[this.state ('step')]);

		return Promise.resolve ();
	}

	/**
	 * @static revert - Revert to the previous statement on the script
	 *
	 * @returns {void}
	 */
	static previous () {
		setTimeout (() => {
			this.revert.call (Monogatari);
		}, 0);
		// this.revert ().catch (() => {
		// 	// The game could not be reverted, either because an
		// 	// action prevented it or because there are no statements
		// 	// left to revert to.
		// });

		return Promise.resolve ();
	}

	static resetGame () {

		// Stop autoplay
		this.autoPlay (false);
		if (this.setting ('Skip') > 0) {
			this.skip (false);
		}

		// Reset Storage
		this.storage (JSON.parse(this.global ('storageStructure')));

		// Reset Conditions
		this.state ({
			step: 0,
			label: this.setting ('Label')
		});

		this.global ('block', false);

		// Reset History
		for (const history of Object.keys (this._history)) {
			this._history[history] = [];
		}

		// Run the reset method of all the actions so each of them can reset
		// their own elements correctly
		const promises = [];

		for (const action of this.actions ()) {
			promises.push (action.reset ());
		}

		for (const component of this.components ()) {
			promises.push (component.onReset ());
		}

		return Promise.all (promises);
	}

	/**
	 * @static keyBoardShortcut - Register a new callback for a custom keyboard
	 * shortcut
	 *
	 * @param {string|Array<string>} shortcut - Sequence of keys that represent
	 * the shortcut
	 * @param {function} callback - The function to run when that sequence of keys
	 * is pressed
	 *
	 * @returns {void}
	 */
	static keyboardShortcut (shortcut, callback) {
		mousetrap.bind (shortcut, (event) => {
			if (event.target.tagName.toLowerCase () != 'input') {
				event.preventDefault ();
				callback.call (null, event);
			}
		});
	}

	static upgrade (oldVersion, newVersion, callbacks) {
		this._upgrade[`${oldVersion}::${newVersion}`] = callbacks;
	}

	static setupStorage () {
		// Check if an Adapter has been set or else, the global local storage
		// object will be used
		if (this.setting ('Storage').Adapter.trim () !== '') {
			let adapter;

			switch (this.setting ('Storage').Adapter) {
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

			this.Storage = new Space (adapter, {
				name: Text.friendly (this.setting ('Name')),
				version: this.setting ('Version'),
				store:  this.setting ('Storage').Store,
				endpoint: this.setting ('Storage').Endpoint,
				props: {
					keyPath: 'id'
				}
			});
		}

		// Setup all the upgrade functions
		for (const upgrade of Object.keys (this._upgrade)) {
			const [oldVersion, newVersion] = upgrade.split ('::');
			const callback = this._upgrade[upgrade].storage;

			this.Storage.upgrade (oldVersion, newVersion, callback);
		}
	}

	static registerListener (name, listener, replace = false) {
		listener.name = name;
		if (replace === true) {
			const index = this._listeners.findIndex (listener => listener.name === name);

			if (index > -1) {
				this._listeners[index] = listener;
				return;
			}
		}
		this._listeners.push (listener);
	}

	static unregisterListener (name) {
		const listener = this._listeners.find((l) => l.name.toLowerCase () === name.toLowerCase ());

		if (listener) {
			if (listener.keys) {
				mousetrap.unbind (listener.keys);
			}
			this._listeners = this._listeners.filter((l) => l.name.toLowerCase () !== name.toLowerCase ());
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

		for (const listener of this._listeners) {
			if (listener.name === name) {
				promises.push (this.assertAsync (listener.callback , Monogatari, [element, event]));
				this.debug.debug ('Running Listener', name);
			}
		}

		Promise.all (promises).catch (() => {
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();
			this.debug.debug ('Listener Event Propagation Stopped');
		});
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
			history: this.history (),
			state: this.state (),
			storage: this.storage ()
		};
	}

	/**
	 * @static revert - This is the function that allows to go back in the game
	 * by reverting the statements played.
	 *
	 * @returns {Promise} - Whether the game was able to go back or not
	 */
	static revert (statement = null, shouldAdvance = true, shouldStepBack = true) {

		this.debug.groupCollapsed ('Revert Cycle');

		// Check if we have steps behind us to revert to. If there aren't, then
		// we can't revert since we are already at the first statement.
		let actionToRevert = null;

		if (statement !== null) {
			actionToRevert = statement;
		} else if (this.state ('step') >= 1) {
			actionToRevert = this.label ()[this.state ('step') - 1];
		} else {
			const jump = [...this.history ('jump')].reverse ().find (o => {
				return o.destination.label === this.state ('label') && o.destination.step === 0;
			});

			if (typeof jump !== 'undefined') {
				this.state ({
					label: jump.source.label,
					step: jump.source.step
				});
				actionToRevert = this.label ()[this.state ('step')];
				this.debug.debug ('Will revert to previous label.');
			} else {
				this.debug.debug ('Will not revert since this is the beginning of the game.');
			}
		}

		this.debug.debug ('Reverting Action', actionToRevert);

		if (actionToRevert !== null) {

			let interpolatedStatement = null;

			if (typeof statement === 'string') {
				interpolatedStatement = this.replaceVariables (actionToRevert).split (' ');
			}

			// Iterate over all the registered actions to find one that matches with
			// the statement to revert.
			for (const action of this.actions ()) {
				let actionStatement = actionToRevert;
				let matches = false;

				// Use the correct matching function (matchString or matchObject)
				// depending on the type of the current statement. If the statement
				// is a pure js function, it won't be reverted since we don't
				// know what to do to revert it.
				if (typeof actionStatement === 'string') {

					// Split the statement into an array using the space separations
					actionStatement = interpolatedStatement;

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
					act._setStatement (actionToRevert);

					// The current cycle is also set just in case the action needs to
					// know what cycle it's currently being performed.
					act._setCycle ('Revert');

					// Monogatari is set as the context of the action so that it can
					// access all its functionalities
					act.setContext (Monogatari);

					this.trigger ('willRevertAction', {
						action: act
					});

					// Run the willRevert method of the action first. This method
					// is usually used to tell whether an action can be reverted
					// or not.
					return act.willRevert ().then (() => {
						this.debug.debug ('Action Will Revert');
						// If it can be reverted, then run the revert method
						return act.revert ().then (() => {
							this.debug.debug ('Action Reverting');
							// If the reversion was successful, run the didRevert
							// function. The action will return a boolean (shouldContinue)
							// specifying if the game should go ahead and revert
							// the previous statement as well or if it should
							// wait instead
							return act.didRevert ().then (({ advance, step }) => {
								this.debug.debug ('Action Did Revert');
								// Since we reverted correctly, the step should
								// go back.
								if (step === true && shouldStepBack === true) {
									this.state ({
										step: this.state ('step') - 1
									});
								}

								this.trigger ('didRevertAction', {
									action: act
								});

								// Revert the previous statement if the action
								// told us to.
								if (advance === true && shouldAdvance === true) {
									// Clear the Stack using a Time Out instead
									// of calling the function directly, preventing
									// an Overflow
									setTimeout ((...params) => {
										this.revert.call (Monogatari, ...params);
									}, 0);
								}

								this.debug.trace ();
								this.debug.groupEnd ();

							});
						});
					}).catch ((e) => {
						if (typeof e === 'object' || typeof e === 'string') {
							console.error (e);
						}
						// Clear the Stack using a Time Out instead of calling
						// the function directly, preventing an Overflow
						setTimeout ((...params) => {
							this.run.call (Monogatari, ...params);
						}, 0, this.label ()[this.state ('step')]);

						this.debug.trace ();
						this.debug.groupEnd ();

						return Promise.resolve ();
					});
				}
			}
		} else {
			// Clear the Stack using a Time Out instead of calling
			// the function directly, preventing an Overflow
			setTimeout ((...params) => {
				this.run.call (Monogatari, ...params);
			}, 0, this.label ()[this.state ('step')]);
			this.debug.trace ();
			this.debug.groupEnd ();

			return Promise.resolve ();
		}
		this.debug.trace ();
		this.debug.groupEnd ();
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
		this.debug.groupCollapsed ('Run Cycle');

		// Don't allow null as a valid statement
		if (statement === null) {
			return Promise.reject ();
		}

		this.debug.debug ('Running Action', statement);

		let interpolatedStatement = null;

		if (typeof statement === 'string') {
			interpolatedStatement = this.replaceVariables (statement).split (' ');
		}

		// Iterate over all the registered actions to find one that matches with
		// the statement to run.
		for (const action of this.actions ()) {
			let actionStatement = statement;
			let matches = false;

			// Use the correct matching function (matchString or matchObject)
			// depending on the type of the current statement. If the statement
			// is a function, it will simply be run.
			if (typeof statement === 'string') {
				// Split the statement into an array using the space separations
				actionStatement = interpolatedStatement;

				// Check if it matches using the matchString method
				matches = action.matchString (actionStatement);
			} else if (typeof statement === 'object') {
				// Check if it matches using the matchObject method
				matches = action.matchObject (statement);
			} else if (typeof actionStatement === 'function') {
				// Block the game while the function is being run
				this.global ('block', true);

				// Run the function asynchronously and after it has run, unblock
				// the game so it can continue.
				return Util.callAsync (actionStatement, Monogatari).finally (() => {
					this.global ('block', false);
					if (shouldAdvance) {
						return this.next ();
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

				this.trigger ('WillRunAction', {
					action: act
				});

				// Run the willApply method of the action first
				return act.willApply ().then (() => {
					this.debug.debug ('Action Will Apply');

					// Run the apply method
					return act.apply (shouldAdvance).then (() => {
						this.debug.debug ('Action Applying');

						// If everything has been run correctly, then run the
						// didApply method. The action will return a boolean
						// (shouldContinue) specifying if the game should run the
						// next statement right away or if it should wait instead
						return act.didApply ().then (({ advance }) => {
							this.debug.debug ('Action Did Apply');

							this.trigger ('didRunAction', {
								action: act
							});

							if (advance === true && shouldAdvance === true) {
								this.debug.debug ('Next action will be run right away');
								this.next ();
							}
							this.debug.trace ();
							this.debug.groupEnd ();
						}).catch ((e) => {
							this.debug.debug (`Did Apply Failed.\nReason: ${e}`);
							return Promise.reject (e);
						});
					}).catch ((e) => {
						this.debug.debug (`Application Failed.\nReason: ${e}`);
						return Promise.reject (e);
					});
				}).catch ((e) => {
					this.debug.debug (`Will Apply Failed.\nReason: ${e}`);
					this.debug.trace ();
					this.debug.groupEnd ();
					return Promise.reject (e);
				});
			}
		}
		this.debug.trace ();
		this.debug.groupEnd ();
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	static alert (id, options) {
		const alert = document.createElement ('alert-modal');
		alert.setProps (options);
		this.element ().prepend (alert);
	}

	static dismissAlert (id = null) {
		// if (typeof id === 'string') {
		// 	this.component ('alert-modal').instance (id).remove ();
		// } else {
		this.element ().find ('alert-modal').remove ();
		// }
	}

	/**
	 * @static loadFromSlot - Load a slot from the storage. This will recover the
	 * state of the game from what was saved in it.
	 *
	 * @param {string} slot - The key with which the slot was saved on the storage
	 */
	static loadFromSlot (slot) {
		document.body.style.cursor = 'wait';
		this.global ('playing', true);

		this.trigger ('willLoadGame');

		return this.resetGame ().then (() => {
			this.hideScreens ();

			return this.Storage.get (slot).then ((data) => {
				// Check if an older save format was used so we can transform
				// that information into the new format
				if (typeof data.Engine !== 'undefined') {

					// Set the game state
					this.state ({
						step: data.Engine.Step,
						label: data.Engine.Label,
						scene: `show scene ${data.Engine.Scene}`,
					});

					// Retrieve if a song was playing so we can set it to the state
					if (data.Engine.Song !== '' && typeof data.Engine.Song !== 'undefined') {
						this.state ({
							music: [data.Engine.Song],
						});
					}

					// Retrieve if a sound was playing so we can set it to the state
					if (data.Engine.Sound !== '' && typeof data.Engine.Sound !== 'undefined') {
						this.state ({
							sound: [data.Engine.Sound],
						});
					}

					// Retrieve if particles were shown so we can set it to the state
					if (data.Engine.Particles !== '' && typeof data.Engine.Particles !== 'undefined') {
						this.state ({
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
									this.state ('characters').push (`show character ${item.data ('character')} ${item.data ('sprite')} ${item.get (0).className}`);
								} else if (element.indexOf ('data-image') > -1) {
									this.state ('characters').push (`show image ${item.data ('image')} ${item.get (0).className}`);
								}
							}

						}
					}

					// Set all the history variables with the ones from the old
					// format
					this.history ({
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
					this.storage (data.Storage);

				} else {
					// If the new format is being used, things are a lot more simple
					const { state, history, storage } = data.game;
					this.state (state);
					this.history (history);
					this.storage (storage);
				}

				// Run the onLoad event of all the actions
				const promises = [];
				for (const action of this.actions ()) {
					promises.push (action.onLoad ());
				}

				// Run the onLoad event of all the components
				for (const component of this.components ()) {
					promises.push (component.onLoad ());
				}

				return Promise.all (promises).then (() => {
					// Finally show the game and start playing
					this.showScreen ('game');
					document.body.style.cursor = 'auto';
					this.trigger ('didLoadGame');
					return Promise.resolve ();
				});
			});
		});
	}

	static proceed () {
		return this.shouldProceed ().then (() => {
			return this.willProceed ().then (() => {
				return this.next ();
			});
		});
	}

	static rollback () {
		return this.shouldRollback ().then (() => {
			return this.willRollback ().then (() => {
				return this.previous ();
			});
		});
	}

	/**
	 * @static shouldProceed - Check if the game can proceed
	 *
	 * @returns {Promise} - Resolves if the game can proceed or reject if it
	 * can't proceed right now.
	 */
	static shouldProceed () {

		// Check if the game is visible, if it's not, then it probably is not
		// playing or is looking at some menu and thus the game should not
		// proceed. The game will not proceed if it's blocked or if the distraction
		// free mode is enabled.
		if (!$_('.modal').isVisible ()
			&& !this.global ('distraction_free')
			&& !this.global ('block')) {
			const promises = [];

			this.debug.groupCollapsed ('shouldProceed Check');
			try {

				this.debug.debug ('Checking Actions');

				// Check action by action if they will allow the game to proceed
				for (const action of this.actions ()) {
					promises.push (action.shouldProceed ().then (() => {
						this.debug.debug (`OK ${action.id}`);
					}).catch ((e) => {
						this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
						return Promise.reject (e);
					}));
				}

				this.debug.debug ('Checking Components');

				// Check component by component if they will allow the game to proceed
				for (const component of this.components ()) {
					promises.push (component.shouldProceed ().then (() => {
						this.debug.debug (`OK ${component.tag}`);
					}).catch ((e) => {
						this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
						return Promise.reject (e);
					}));
				}
			} catch (e) {
				console.error (e);
				FancyError.show (
					'An error ocurred while trying to execute a shouldProceed function.',
					'Monogatari attempted to execute the function but an error ocurred.',
					{
						'Error Message': e.message,
						'Help': {
							'_': 'More details should be available at the console.',
						}
					}
				);
			}

			this.debug.debug ('Checking Extra Conditions');

			return Promise.all (promises).then ((...args) => {
				this.debug.groupEnd ();
				return Promise.resolve (...args);
			}).catch ((e) => {
				this.debug.groupEnd ();
				return Promise.reject (e);
			});
		} else {
			return Promise.reject ('Extra condition check failed.');
		}
	}

	static willProceed () {

		const promises = [];
		this.debug.groupCollapsed ('Can proceed check passed, game will proceed.');
		try {
			// Check action by action if they will allow the game to proceed
			for (const action of this.actions ()) {
				promises.push (action.willProceed ().then (() => {
					this.debug.debug (`OK ${action.id}`);
				}).catch ((e) => {
					this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}

			// Check component by component if they will allow the game to proceed
			for (const component of this.components ()) {
				promises.push (component.willProceed ().then (() => {
					this.debug.debug (`OK ${component.tag}`);
				}).catch ((e) => {
					this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}
		} catch (e) {
			console.error (e);
			FancyError.show (
				'An error ocurred while trying to execute a willProceed function.',
				'Monogatari attempted to execute the function but an error ocurred.',
				{
					'Error Message': e.message,
					'Help': {
						'_': 'More details should be available at the console.',
					}
				}
			);
		}

		return Promise.all (promises).then ((...args) => {
			this.debug.groupEnd ();
			return Promise.resolve (...args);
		}).catch ((e) => {
			this.debug.groupEnd ();
			return Promise.reject (e);
		});
	}

	/**
	 * @static shouldRollback - Check if the game can revert
	 *
	 * @returns {Promise} - Resolves if the game can be reverted or reject if it
	 * can't be reverted right now.
	 */
	static shouldRollback () {
		// Check if the game is visible, if it's not, then it probably is not
		// playing or is looking at some menu and thus the game should not
		// revert. The game will not revert if it's blocked or if the distraction
		// free mode is enabled.
		if (!this.global ('distraction_free')
			&& !this.global ('block')) {
			const promises = [];

			this.debug.groupCollapsed ('shouldRollback Check');
			try {
				// Check action by action if they will allow the game to revert
				for (const action of this.actions ()) {
					promises.push (action.shouldRollback ().then (() => {
						this.debug.debug (`OK ${action.id}`);
					}).catch ((e) => {
						this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
						return Promise.reject (e);
					}));
				}

				// Check component by component if they will allow the game to revert
				for (const component of this.components ()) {
					promises.push (component.shouldRollback ().then (() => {
						this.debug.debug (`OK ${component.tag}`);
					}).catch ((e) => {
						this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
						return Promise.reject (e);
					}));
				}
			}  catch (e) {
				console.error (e);
				FancyError.show (
					'An error ocurred while trying to execute a shouldRollback function.',
					'Monogatari attempted to execute the function but an error ocurred.',
					{
						'Error Message': e.message,
						'Help': {
							'_': 'More details should be available at the console.',
						}
					}
				);
			}

			return Promise.all (promises).then ((...args) => {
				this.debug.groupEnd ();
				return Promise.resolve (...args);
			}).catch ((e) => {
				this.debug.groupEnd ();
				return Promise.reject (e);
			});
		} else {
			return Promise.reject ();
		}
	}

	static willRollback () {
		const promises = [];

		this.debug.groupCollapsed ('Should Rollback Check passed, game will roll back.');

		try {
			// Check action by action if they will allow the game to revert
			for (const action of this.actions ()) {
				promises.push (action.willRollback ().then (() => {
					this.debug.debug (`OK ${action.id}`);
				}).catch ((e) => {
					this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}

			// Check component by component if they will allow the game to revert
			for (const component of this.components ()) {
				promises.push (component.willRollback ().then (() => {
					this.debug.debug (`OK ${component.tag}`);
				}).catch ((e) => {
					this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}
		} catch (e) {
			console.error (e);
			FancyError.show (
				'An error ocurred while trying to execute a willRollback function.',
				'Monogatari attempted to execute the function but an error ocurred.',
				{
					'Error Message': e.message,
					'Help': {
						'_': 'More details should be available at the console.',
					}
				}
			);
		}

		return Promise.all (promises).then ((...args) => {
			this.debug.groupEnd ();
			return Promise.resolve (...args);
		}).catch ((e) => {
			this.debug.groupEnd ();
			return Promise.reject (e);
		});
	}

	/**
	 * @static playAmbient - Play the main menu music using the key defined in the
	 * 'MainScreenMusic' property of the game settings.
	 */
	static playAmbient () {
		// Check if a menu music was defined
		if (this.setting ('MainScreenMusic') !== '') {

			// Make the ambient player loop
			this.ambientPlayer.loop = true;

			// Check if the music was defined in the music assets object
			if (typeof this.asset ('music', this.setting ('MainScreenMusic')) !== 'undefined') {

				// Get the full path to the asset and set the src to the ambient player
				this.ambientPlayer.src =  `${this.setting ('AssetsPath').root}/${this.setting ('AssetsPath').music}/${this.asset ('music', this.setting ('MainScreenMusic'))}`;

				// Play the music but catch any errors. Error catching is necessary
				// since some browsers like chrome, have added some protections to
				// avoid media from being autoplayed. Because of these protections,
				// the user needs to interact with the page first before the media
				// is able to play.
				this.ambientPlayer.play ().catch (() => {

					// Create a broadcast message
					const element = `
						<div data-ui="broadcast">
							<p data-string="AllowPlayback">${this.string ('AllowPlayback')}.</p>
						</div>
					`;

					// Add it to the main menu and game screens
					this.element ().prepend (element);

					// Try to play the media again once the element has been clicked
					// and remove it.
					this.element ().find ('[data-ui="broadcast"]').click (() => {
						this.playAmbient ();
						this.element ().find ('[data-ui="broadcast"]').remove ();
					});
				});
			} else {
				FancyError.show (
					`The music "${this.setting ('MainScreenMusic')}" is not defined.`,
					'Monogatari attempted to find a definition of a music asset but there was none.',
					{
						'Music Not Found': this.setting ('MainScreenMusic'),
						'You may have meant one of these': Object.keys (this.assets ('music')),
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
		if (!this.ambientPlayer.paused) {
			this.ambientPlayer.pause ();
		}
	}

	// Start game automatically without going trough the main menu
	static showMainScreen () {
		if (!this.setting ('ShowMainScreen')) {
			this.global ('playing', true);
			this.showScreen ('game');
			this.run (this.label ()[this.state ('step')]);
		} else {
			this.showScreen ('main');
		}
	}

	static showSplashScreen () {
		const labelName = this.setting ('SplashScreenLabel');
		if (typeof labelName === 'string' && labelName !== '') {
			const label = this.label (labelName);
			if (typeof label !== 'undefined') {
				this.state ({
					label: labelName
				});

				this.element ().find ('quick-menu').addClass ('splash-screen');

				this.showScreen ('game');
				this.run (this.label ()[this.state ('step')]);
				return;
			}
		}
		this.showMainScreen ();
	}

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
			const interval = this.preference ('AutoPlaySpeed') * 1000;
			let expected = Date.now () + interval;

			this.global ('_auto_play_timer', () => {
				const now = Date.now () - expected; // the drift (positive for overshooting)
				if (now > interval) {
					// something really bad happened. Maybe the browser (tab) was inactive?
					// possibly special handling to avoid futile "catch up" run
				}
				this.proceed ().then (() => {
					expected += interval;
					setTimeout (this.global ('_auto_play_timer'), Math.max (0, interval - now)); // take into account drift
				}).catch (() => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			});
			setTimeout (this.global ('_auto_play_timer'), interval);
			this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (this.string ('Stop'));
			this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-stop-circle"></span>');
		} else {
			clearTimeout (this.global ('_auto_play_timer'));
			this.global ('_auto_play_timer', null);
			this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (this.string ('AutoPlay'));
			this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-play-circle"></span>');
		}
	}

	/**
	 * @static distractionFree - Enable or disable the distraction free mode
	 * where the dialog box is hidden so that the player can look at the characters
	 * and background with no other elements on the way. A 'transparent' class
	 * is added to the quick menu when this mode is enabled.
	 */
	static distractionFree () {
		if (this.global ('playing')) {
			// Check if the distraction free is currently enabled
			if (this.global ('distraction_free') === true) {
				this.element ().find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (this.string ('Hide'));
				this.element ().find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye" data-action="distraction-free"></span>');
				this.element ().find ('[data-component="quick-menu"]').removeClass ('transparent');
				this.element ().find ('[data-component="text-box"]').show ();
				this.global ('distraction_free', false);
			} else {
				this.element ().find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (this.string ('Show'));
				this.element ().find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye-slash" data-action="distraction-free"></span>');
				this.element ().find ('[data-component="quick-menu"]').addClass ('transparent');
				this.element ().find ('[data-component="text-box"]').hide();
				this.global ('distraction_free', true);
			}
		}
	}



	static setup (selector) {
		// Set the initial settings if they don't exist or load them from the
		// Storage if they do.
		this.Storage.get ('Settings').then ((local_settings) => {
			this._preferences = merge (this._preferences, local_settings);
		}).catch ((e) => {
			console.error (e);
			this.Storage.set ('Settings', this._preferences);
		});

		// Register service worker. The service worker will save all requests into
		// the cache so the game loads more quickly and we can play offline. The
		// service worker will only be used if it was allowed by the settings and
		// if we are not running in a local platform such as electron or cordova
		// where the assets are expected to be available locally and thus don't
		// require being cached.
		if (this.setting ('ServiceWorkers')) {
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
											<p data-string="NewContent">${this.string ('NewContent')}.</p>
										</div>
									`;
									this.element ().prepend (element);
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
		this.global ('storageStructure', JSON.stringify (this.storage ()));

		// The open-screen action does exactly what it says, it takes the
		// data-screen property of the object it's in and then opens that
		// menu, meaning it hides everything else and shows that one.
		this.registerListener ('open-screen', {
			callback: (element) => {
				this.element ().find ('[data-screen]').each ((screen) => {
					screen.setState ({ open: false });
				});
				this.element ().find (`[data-screen="${element.data('open')}"]`).get (0).setState ({ open: true });
			}
		});

		// The start action starts the game so it shows the game screen
		// and the game starts
		this.registerListener ('start', {
			callback: () => {
				this.global ('playing', true);

				this.onStart ().then (() => {
					this.element ().find ('[data-screen]').each ((screen) => {
						screen.setState ({ open: false });
					});

					this.element ().find ('[data-screen="game"]').get (0).setState ({ open: true });

					// Check if the initial label exists
					if (this.label ()) {
						this.run (this.label ()[this.state ('step')]);
					}
				});
			}
		});

		this.registerListener ('dismiss-alert', {
			callback: () => {
				this.dismissAlert ();
			}
		});

		this.registerListener ('distraction-free', {
			keys: 'h',
			callback: () => {
				this.distractionFree ();
			}
		});

		this.registerListener ('skip', {
			keys: 's',
			callback: () => {
				if (this.global ('playing')) {
					if (this.global ('skip') !== null) {
						this.skip (false);
					} else {
						this.skip (true);
					}
				}
			}
		});

		// Add listener to the auto-play buttons, activating or deactivating the
		// auto-play feature
		this.registerListener ('auto-play', {
			callback: () => {
				this.autoPlay (this.global ('_auto_play_timer') === null);
			}
		});

		const promises = [];

		for (const component of this.components ()) {
			promises.push (component.setup (selector));
		}

		for (const action of this.actions ()) {
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
			if (this.setting ('Skip') > 0) {

				const button = this.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

				if (button.data ('icon') !== 'play-circle') {
					button.replaceWith ('<span class="far fa-play-circle"></span>');
				}

				// Start the timeout with the time specified on the settings. We
				// save it on a global variable so that we can disable later.
				this.global ('skip', setTimeout (() => {
					if (this.element ().find ('[data-screen="game"]').isVisible () && this.global ('playing') === true) {
						this.proceed ().then (() => {
							// Nothing to do here
						}).catch (() => {
							// An action waiting for user interaction or something else
							// is blocking the game.
						});
					}
					// Start all over again
					this.skip (true);
				}, this.setting ('Skip')));
			}
		} else {
			clearTimeout (this.global ('skip'));
			this.global ('skip', null);
			const button = this.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

			if (button.data ('icon') !== 'fast-forward') {
				button.replaceWith ('<span class="fas fa-fast-forward"></span>');
			}
		}
	}

	static showScreen (screen) {
		this.hideScreens ();

		this.element ().find (`[data-screen="${screen}"]`).get (0).setState ({
			open: true
		});
	}

	static hideScreens () {
		this.element ().find ('[data-screen]').each ((screen) => {
			screen.setState ({ open: false });
		});
	}

	static resize (element, proportionWidth, proportionHeight) {
		const mainElement = $_('body').get (0);

		const mainWidth = mainElement.offsetWidth;
		const mainHeight = mainElement.offsetHeight;

		const h = Math.floor (mainWidth * (proportionHeight / proportionWidth));

		let widthCss = '100%';
		let heightCss = '100%';
		let marginTopCss = 0;

		if (h <= mainHeight) {
			const marginTop = Math.floor ((mainHeight - h)/2);
			marginTopCss = marginTop + 'px';
			heightCss = h + 'px';

		}
		else {
			const w = Math.floor (mainHeight * (proportionWidth/proportionHeight));
			widthCss = w + 'px';
		}

		$_('.forceAspectRatio').style ({
			width: widthCss,
			height: heightCss,
			marginTop: marginTopCss
		});
	}

	/**
	 * Every event listener should be binded in this function.
	 */
	static bind (selector) {


		// Add the orientation checker in case that a specific orientation was
		// defined.
		if (this.setting ('Orientation') !== 'any' && Platform.mobile ()) {

			// Set the event listener for device orientation so we can display a message
			window.addEventListener ('orientationchange', () => {

				// Display or remove the device orientation notice depending on the
				// current device orientation
				if (Platform.orientation () !== this.setting ('Orientation')) {
					this.alert ('orientation-warning', {
						message: 'OrientationWarning'
					});
				} else {
					this.dismissAlert ('orientation-warning');
				}
			}, false);
		}

		// Add event listener for back buttons. If the player is playing, the back
		// button will return to the game, if its not playing, then it'll return
		// to the main menu.
		this.on ('click', '[data-screen]:not([data-screen="game"]) [data-action="back"]', (event) => {

			if (!$_(`${selector} [data-screen="game"]`).isVisible ()) {
				this.debug.debug ('Registered Back Listener on Non-Game Screen');
				event.stopImmediatePropagation();
				event.stopPropagation();
				event.preventDefault();
				this.element ().find ('[data-screen]').each ((screen) => {
					screen.setState ({ open: false });
				});

				if (this.global ('playing')) {
					this.element ().find ('[data-screen="game"]').get (0).setState ({ open: true });
				} else {
					this.element ().find ('[data-screen="main"]').get (0).setState ({ open: true });
				}
			}

		});

		// Add listeners for the data-action properties
		this.on ('click', '[data-action]', function (event) {
			const element = $_(this);

			const action = element.data ('action');

			if (action) {
				Monogatari.runListener (action, element, event);
			}

			return false;
		});

		this.keyboardShortcut (['right', 'space'], () => {
			this.proceed ().then (() => {
				// Nothing to do here
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		this.keyboardShortcut ('esc', () => {
			if ($_(`${selector} [data-screen="game"]`).isVisible () && this.global ('playing')) {
				this.showScreen ('settings');
			} else if ($_(`${selector} [data-screen="settings"]`).isVisible () && this.global ('playing')) {
				this.showScreen ('game');
			}
		});

		this.keyboardShortcut ('shift+s', () => {
			if (this.global ('playing')) {
				this.showScreen ('save');
			}
		});

		this.keyboardShortcut ('shift+l', () => {
			if (this.global ('playing')) {
				this.showScreen ('load');
			}
		});

		const forceAspectRatio = Monogatari.setting ('ForceAspectRatio');
		let forceAspectRatioFlag = true;

		switch (forceAspectRatio) {
			case 'Visuals':
				$_('[data-content="visuals"]').addClass('forceAspectRatio');
				break;

			case 'Global':
				this.element ().parent ().addClass('forceAspectRatio');
				break;

			default:
				forceAspectRatioFlag = false;
		}

		if (forceAspectRatioFlag) {
			const [w, h] = Monogatari.setting ('AspectRatio').split (':');
			const proportionWidth = parseInt(w);
			const proportionHeight = parseInt(h);

			this.resize(null, proportionWidth, proportionHeight);
			$_(window).on ('resize', () => this.resize(null, proportionWidth, proportionHeight));
		}

		const promises = [];

		for (const component of this.components ()) {
			promises.push (component.bind (selector));
		}

		for (const action of this.actions ()) {
			promises.push (action.bind (selector));
		}
		return Promise.all (promises).then (() => {
			for (const listener of this._listeners) {
				const { keys, callback } = listener;
				if (typeof keys !== 'undefined') {
					this.keyboardShortcut (keys, callback);
				}
			}
			return Promise.resolve ();
		});
	}

	static element (pure = false) {
		let element = null;
		let exists = false;

		if (pure === true) {
			element = document.querySelector ('visual-novel');
			exists = element !== null;
		} else {
			element = $_('visual-novel');
			exists = element.length > 0;
		}

		// In some cases, the user might be trying to execute an action using the
		// main element when the DOM has not been loaded yet, thus causing an
		// error since the element does not exists yet.
		if (exists === false) {
			FancyError.show (
				'Main element is not ready yet',
				'Monogatari attempted to execute a function when the main element was not fully loaded yet.',
				{
					'Trace': 'You should be able to see an error with the order in which functions were executed in your browser\'s console (Ctrl + Shift + i). The last one should be part of your code and that\'s the one that needs to be changed.',
					'Help': {
						'_': 'Please wrap or move your code into a $_ready () function block to wait for the page to be fully loaded before executing it.',
						'_1': `
							<pre>
								<code class='language-javascript'>
								$_ready (() => {
									// Your code should go here
								});
								</code>
							</pre>
						`
					}
				}
			);
		}
		return element;
	}

	static on (event, target, callback) {
		return this.element ().on (event, target, callback);
	}

	static parentElement () {
		return $_(this._selector);
	}

	/**
	 * @static trigger - Trigger a custom element with custom details data
	 *
	 * @param {string} name - The name of the event to trigger
	 * @param {Object} [details = {}] - A key/value object with additional details
	 * for the event
	 *
	 * @returns {void}
	 */
	static trigger (name, details = {}) {
		const event = new CustomEvent (name, { bubbles: false, detail: details });

		const element = this.element (true);

		if (element) {
			element.dispatchEvent (event);
		} else {
			element.ready (() => dispatchEvent (event));
		}
	}

	static init (selector = '#monogatari') {
		this._selector = selector;

		this.trigger ('willInit');

		if (this.Storage.configuration ().name === '') {
			this.setupStorage ();
		}

		FancyError.init ();

		this.trigger ('willSetup');

		return this.setup (selector).then (() => {

			this.trigger ('didSetup');

			this.trigger ('willBind');

			return this.bind (selector).then (() => {

				this.trigger ('didBind');

				this.ambientPlayer = new Audio ();

				// Set the initial language translations
				this.localize ();

				// Set the label in which the game will start
				this.state ({
					label: this.setting ('Label')
				});

				// Check if the orientation is correct, if it's not, show the warning
				// message so the player will rotate its device.
				if (this.setting ('Orientation') !== 'any') {
					if (Platform.mobile () && Platform.orientation () !== this.setting ('Orientation')) {
						this.alert ('orientation-warning', {
							message: 'OrientationWarning'
						});
					}
				}

				// Preload all the game assets
				this.preload ().then (() => {

				}).catch ((e) => {
					console.error (e);
				}).finally (() => {
					if (this.label ()) {
						this.showSplashScreen ();
					} else {
						FancyError.show (
							`"${this.setting ('Label')}" Label was not found`,
							'Monogatari tried to get your start label but it couldn\'t find it in your script.',
							{
								'Start Label on your Settings': this.setting ('Label'),
								'Labels Available': Object.keys (this.script ()),
								'Help': {
									'_': 'Please check that the label exists in your script.'
								}
							}
						);
					}
				});

				const init = [];

				for (const component of this.components ()) {
					init.push (component.init (selector));
				}

				for (const action of this.actions ()) {
					init.push (action.init (selector));
				}

				if (this.setting ('AutoSave') != 0 && typeof this.setting ('AutoSave') === 'number') {
					this.debug.debug ('Automatic save is enabled, setting up timeout');
					this.global ('_auto_save_interval', setInterval(function () {
						this.debug.groupCollapsed ('Automatic Save');
						const id = this.global ('current_auto_save_slot');

						this.debug.debug ('Saving data to slot', id);

						this.saveTo ('AutoSaveLabel', id);

						if (this.global ('current_auto_save_slot') === this.setting ('Slots')) {
							this.global ('current_auto_save_slot', 1);
						} else {
							this.global ('current_auto_save_slot', this.global ('current_auto_save_slot') + 1);
						}

						this.debug.groupEnd ('Automatic Save');

					}, this.setting ('AutoSave') * 60000));
				} else {
					this.debug.debug ('Automatic save is disabled. Section will be hidden from Load Screen');
					this.element ().find ('[data-screen="load"] [data-ui="autoSaveSlots"]').hide ();
				}

				return Promise.all (init, () => {
					this.trigger ('didInit');
				});

			});
		});
	}
}

Monogatari._events = {

};

Monogatari._selector = '#monogatari';

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
	finished_typing: true
};

Monogatari._assets = {
	music: {},
	voice: {},
	sound: {},
	video: {},
	images: {},
	scenes: {},
	gallery: {}
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

	// Force aspect ratio, it will make all images to comply with aspect ratio.
	// Values: 'None' (don't force), 'Visuals' (force only visuals)
	// or 'Global' (force all game)
	'ForceAspectRatio': 'None',

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
		'voice': 'voice',
		'gallery': 'gallery'
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
		'Sound': 1,
		'Video': 1
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
	distraction_free: false,
	delete_slot: null,
	overwrite_slot: null,
	block: false,
	playing: false,
	current_auto_save_slot: 1,
	_auto_play_timer: null,
	skip: null,
	_log: [],
	_auto_save_interval: null
});

Monogatari._listeners = [];

Monogatari._configuration = {
	'main-menu': {
		buttons: [
			{
				string: 'Start',
				data: {
					action: 'start'
				}
			},
			{
				string: 'Load',
				data: {
					action: 'open-screen',
					open: 'load'
				}
			},
			{
				string: 'Settings',
				data: {
					action: 'open-screen',
					open: 'settings'
				}
			},
			{
				string: 'Help',
				data: {
					action: 'open-screen',
					open: 'help'
				}
			}
		]
	},
	'quick-menu': {
		buttons: [
			{
				string: 'Back',
				icon: 'fas fa-arrow-left',
				link: '#',
				data: {
					action: 'back'
				}
			},
			{
				string: 'Hide',
				icon: 'fas fa-eye',
				data: {
					action: 'distraction-free'
				}
			},
			{
				string: 'AutoPlay',
				icon: 'fas fa-play-circle',
				data: {
					action: 'auto-play'
				}
			},
			{
				string: 'Skip',
				icon: 'fas fa-fast-forward',
				data: {
					action: 'skip'
				}
			},
			{
				string: 'Save',
				icon: 'fas fa-save',
				data: {
					action: 'open-screen',
					open: 'save'
				}
			},
			{
				string: 'Load',
				icon: 'fas fa-undo',
				data: {
					action: 'open-screen',
					open: 'load'
				}
			},
			{
				string: 'Settings',
				icon: 'fas fa-cog',
				data: {
					action: 'open-screen',
					open: 'settings'
				}
			},
			{
				string: 'Quit',
				icon: 'fas fa-times-circle',
				data: {
					action: 'end'
				}
			}
		]
	},
	credits: {}
};

Monogatari._templates = {};

Monogatari._upgrade = {};

Monogatari._temp = {};

Monogatari.Storage = new Space ();

Monogatari.version = '2.0.0';

Monogatari._id = 'visual-novel';

export { Monogatari };