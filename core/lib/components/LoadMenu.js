import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadMenu extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return LoadMenu._configuration[object];
			} else {
				LoadMenu._configuration = Object.assign ({}, LoadMenu._configuration, object);
				LoadMenu.onUpdate ();
			}
		} else {
			return LoadMenu._configuration;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return LoadMenu._state[object];
			} else {
				LoadMenu._state = Object.assign ({}, LoadMenu._state, object);
				LoadMenu.onUpdate ();
			}
		} else {
			return LoadMenu._state;
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
			Monogatari.global ('_AutoSaveInterval', setInterval(function () {
				const id = Monogatari.global ('currentAutoSaveSlot');
				Monogatari.saveTo ('AutoSaveLabel', id).then (({ key, value }) => {
					const id = key.split ('_').pop ();
					$_(`[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (value.name);
					$_(`[data-menu='save'] [data-ui='slots'] [data-save='${id}'] small`).text (value.name);
				});

				if (Monogatari.global ('currentAutoSaveSlot') === Monogatari.setting ('Slots')) {
					Monogatari.global ('currentAutoSaveSlot', 1);
				} else {
					Monogatari.global ('currentAutoSaveSlot', Monogatari.global ('currentAutoSaveSlot') + 1);
				}
				Monogatari.setAutoSlots ();

			}, Monogatari.setting ('AutoSave') * 60000));
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"]').hide ();
		}
		return Promise.resolve ();
	}

	static reset () {
		clearInterval (Monogatari.global ('_AutoSaveInterval'));
		return Promise.resolve ();
	}

	static setup (selector) {
		Monogatari.global ('_AutoSaveInterval', null);
		$_(selector).append (LoadMenu.html ());
		$_(selector).prepend (`
			<div data-notice="slot-deletion" class="modal">
				<div class="modal__content">
					<p data-string="SlotDeletion">Are you sure you want to delete this slot?</p>
					<p><small></small></p>
					<div>
						<button data-action="delete-slot" data-string="Delete">Delete</button>
						<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
					</div>
				</div>
			</div>
		`);
		return Promise.resolve ();
	}

	static html (html = null) {
		if (html !== null) {
			LoadMenu._html = html;
		} else {
			return LoadMenu._html;
		}
	}

	static setAutoSlots () {
		const element = $_(`${Monogatari.selector} [data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]`);

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
		$_(`${Monogatari.selector} [data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ('');
		$_(`${Monogatari.selector} [data-menu="save"] [data-ui="slots"]`).html ('');

		$_(`${Monogatari.selector} [data-menu="save"] [data-input="slotName"]`).value (Monogatari.niceDateTime ());

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
				if ($_(`${Monogatari.selector} [data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]`).html ().trim() === '') {
					$_(`${Monogatari.selector} [data-menu="save"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
					$_(`${Monogatari.selector} [data-menu="load"] [data-ui="slots"]`).html (`<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`);
				}
				LoadMenu.setAutoSlots ();
			});
		});
	}

	static bind (selector) {
		$_(`${selector} [data-menu="load"]`).on ('click', '[data-delete], [data-delete] *', function () {
			Monogatari.global ('deleteSlot', $_(this).data ('delete'));
			Monogatari.Storage.get (Monogatari.setting ('SaveLabel') + '_' + Monogatari.global ('deleteSlot')).then ((data) => {
				if (typeof data.name !== 'undefined') {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.name);
				} else {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.date);
				}

				$_(`${selector} [data-notice="slot-deletion"]`).addClass ('modal--active');
			});
		});

		// Load a saved game slot when it is pressed
		$_(`${selector} [data-menu="load"] [data-ui="saveSlots"]`).on ('click', 'figcaption, img', function () {
			Monogatari.loadFromSlot (Monogatari.setting ('SaveLabel') + '_' + $_(this).parent().data('loadSlot'));
		});

		// Load an autosaved game slot when it is pressed
		$_(`${selector} [data-menu="load"] [data-ui="autoSaveSlots"]`).on ('click', 'figcaption, img', function () {
			Monogatari.loadFromSlot (Monogatari.setting ('AutoSaveLabel') +  '_' + $_(this).parent().data('loadSlot'));
		});
		return Promise.resolve ();
	}

	static init (selector) {

		// Disable the load and save slots in case Local Storage is not supported.
		if (!window.localStorage) {
			$_(`${selector} [data-menu="load"] [data-ui="slots"]`).html (`<p>${Monogatari.string ('LocalStorageWarning')}</p>`);
		} else {
			LoadMenu.setSlots ();
		}
		return Promise.resolve ();
	}

	static render () {
		return Promise.resolve ();
	}
}

LoadMenu._configuration = {};
LoadMenu._state = {};
LoadMenu._id = 'Load';

LoadMenu._html = `
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
`;
Monogatari.registerComponent (LoadMenu);