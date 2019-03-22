import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadScreen extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return LoadScreen._configuration[object];
			} else {
				LoadScreen._configuration = Object.assign ({}, LoadScreen._configuration, object);
				LoadScreen.onUpdate ();
			}
		} else {
			return LoadScreen._configuration;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return LoadScreen._state[object];
			} else {
				LoadScreen._state = Object.assign ({}, LoadScreen._state, object);
				LoadScreen.onUpdate ();
			}
		} else {
			return LoadScreen._state;
		}
	}

	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts.
	 *
	 * @return {Promise}
	 */
	static onStart () {
		if (Monogatari.setting ('AutoSave') != 0 && typeof Monogatari.setting ('AutoSave') === 'number') {
			Monogatari.debug ().debug ('Automatic save is enabled, setting up timeout');
			Monogatari.global ('_AutoSaveInterval', setInterval(function () {
				Monogatari.debug ().groupCollapsed ('Automatic Save');
				const id = Monogatari.global ('currentAutoSaveSlot');

				Monogatari.debug ().debug ('Saving data to slot', id);

				Monogatari.saveTo ('AutoSaveLabel', id).then (({ key, value }) => {
					$_(`${Monogatari.selector} [data-screen='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-slot='${key}'] small`).text (value.name);
					$_(`${Monogatari.selector} [data-screen='save'] [data-ui='slots'] [data-save='${key}'] small`).text (value.name);
					LoadScreen.setAutoSlots ();
				});

				if (Monogatari.global ('currentAutoSaveSlot') === Monogatari.setting ('Slots')) {
					Monogatari.global ('currentAutoSaveSlot', 1);
				} else {
					Monogatari.global ('currentAutoSaveSlot', Monogatari.global ('currentAutoSaveSlot') + 1);
				}

				Monogatari.debug ().groupEnd ('Automatic Save');

			}, Monogatari.setting ('AutoSave') * 60000));
		} else {
			Monogatari.debug ().debug ('Automatic save is disabled. Section will be hidden from Load Screen');
			$_(`${Monogatari.selector} [data-screen="load"] [data-ui="autoSaveSlots"]`).hide ();
		}
		return Promise.resolve ();
	}

	static reset () {
		clearInterval (Monogatari.global ('_AutoSaveInterval'));
		return Promise.resolve ();
	}

	static setup (selector) {
		Monogatari.global ('_AutoSaveInterval', null);
		$_(selector).append (LoadScreen.html ());
		return Promise.resolve ();
	}

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static setAutoSlots () {
		const element = $_(`${Monogatari.selector} [data-screen="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]`);

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
							Monogatari.addAutoSlot (id.split ('_').pop (), slot);
						}
					});
				}
			}

			// Check if there are no Auto Saved games.
			if (element.html ().trim () === '') {
				element.html (`<p data-string="NoAutoSavedGames">${Monogatari.string ('NoAutoSavedGames')}</p>`);
			}
		});
	}

	static setSlots () {
		$_(`${Monogatari.selector} [data-screen="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ('');
		$_(`${Monogatari.selector} [data-screen="save"] [data-ui="slots"]`).html ('');

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
						Monogatari.addSlot (id.split ('_').pop (), slot);
					}
				}));
			}

			return Promise.all (promises).then (() => {

				// Check if there are no Saved games.
				if ($_(`${Monogatari.selector} [data-screen="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ().trim() === '') {
					$_(`${Monogatari.selector} [data-screen="save"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
					$_(`${Monogatari.selector} [data-screen="load"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
				}
				LoadScreen.setAutoSlots ();
			});
		});
	}

	static bind (selector) {
		$_(`${selector} [data-screen="load"]`).on ('click', '[data-delete], [data-delete] *', function (event) {
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			let element = $_(this);
			if (element.matches ('path')) {
				element = element.closest ('[data-delete]');
			}

			Monogatari.global ('deleteSlot', element.data ('delete'));
			Monogatari.Storage.get (Monogatari.global ('deleteSlot')).then ((data) => {
				if (typeof data.name !== 'undefined') {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.name);
				} else {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.date);
				}

				$_(`${selector} [data-notice="slot-deletion"]`).addClass ('modal--active');
			});
		});

		// Load a saved game slot when it is pressed
		$_(`${selector} [data-screen="load"]`).on ('click', '[data-slot], [data-slot] *:not([data-delete])', function () {
			Monogatari.loadFromSlot ($_(this).closest ('[data-slot]').data('slot'));
		});
		return Promise.resolve ();
	}

	static init (selector) {

		// Disable the load and save slots in case Local Storage is not supported.
		if (!window.localStorage) {
			$_(`${selector} [data-screen="load"] [data-ui="slots"]`).html (`<p>${Monogatari.string ('LocalStorageWarning')}</p>`);
		} else {
			LoadScreen.setSlots ();
		}
		return Promise.resolve ();
	}

	static render () {
		return Promise.resolve ();
	}
}

LoadScreen._configuration = {};
LoadScreen._state = {};
LoadScreen._id = 'LOAD_MENU';

LoadScreen._html = `
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
`;
Monogatari.registerComponent (LoadScreen);