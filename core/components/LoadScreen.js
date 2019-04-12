import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadScreen extends Component {

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
					Monogatari.element ().find (`[data-screen='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-slot='${key}'] small`).text (value.name);
					Monogatari.element ().find (`[data-screen='save'] [data-ui='slots'] [data-save='${key}'] small`).text (value.name);
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
			Monogatari.element ().find (`[data-screen="load"] [data-ui="autoSaveSlots"]`).hide ();
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

	static setAutoSlots () {
		const element = Monogatari.element ().find (`[data-screen="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]`);

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
		Monogatari.element ().find (`[data-screen="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ('');
		Monogatari.element ().find (`[data-screen="save"] [data-ui="slots"]`).html ('');

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
				if (Monogatari.element ().find (`[data-screen="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ().trim() === '') {
					Monogatari.element ().find (`[data-screen="save"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
					Monogatari.element ().find (`[data-screen="load"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
				}
				LoadScreen.setAutoSlots ();
			});
		});
	}

	static bind (selector) {

		// Load a saved game slot when it is pressed
		$_(`${selector}`).on ('click', '[data-screen="load"] [data-slot], [data-screen="load"] [data-slot] *', function () {
			const isDeleteButton = $_(this).matches ('[data-delete], [data-delete] *');
			if (!isDeleteButton) {
				Monogatari.loadFromSlot ($_(this).closest ('[data-slot]').data('slot'));
			}
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
LoadScreen._id = 'load-screen';

LoadScreen._html = `
	<section data-component="load-screen" data-screen="load">
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