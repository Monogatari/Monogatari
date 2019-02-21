import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SaveScreen extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return SaveScreen._configuration[object];
			} else {
				SaveScreen._configuration = Object.assign ({}, SaveScreen._configuration, object);
				SaveScreen.onUpdate ();
			}
		} else {
			return SaveScreen._configuration;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return SaveScreen._state[object];
			} else {
				SaveScreen._state = Object.assign ({}, SaveScreen._state, object);
				SaveScreen.onUpdate ();
			}
		} else {
			return SaveScreen._state;
		}
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

	static setup (selector) {
		$_(selector).append (SaveScreen.html ());
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector} [data-screen="save"]`).on ('click', '[data-delete], [data-delete] *', function () {
			Monogatari.global ('deleteSlot', $_(this).data ('delete'));
			Monogatari.Storage.get (Monogatari.global ('deleteSlot')).then ((data) => {
				if (typeof data.name !== 'undefined') {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.name);
				} else {
					$_(`${selector} [data-notice="slot-deletion"] small`).text (data.date);
				}

				$_(`${selector} [data-notice="slot-deletion"]`).addClass ('modal--active');
			});
		});

		$_(`${selector} [data-action="save"], ${selector} [data-action="save"] *`).click(function () {
			const slotName = $_(`${selector} [data-screen="save"] [data-input="slotName"]`).value ().trim ();
			if (slotName !== '') {
				Monogatari.saveTo ('SaveLabel', null, slotName).then (({ key, value }) => {
					Monogatari.addSlot (key.split ('_').pop (), value);
				});
			}
		});

		$_(`${selector} [data-action="overwrite-slot"], ${selector} [data-action="overwrite-slot"] *`).click(function () {
			const customName = $_(`${selector} [data-notice="slot-overwrite"] input`).value ().trim ();
			if (customName !== '') {
				Monogatari.saveTo ('SaveLabel', Monogatari.global ('overwriteSlot'), customName).then (({ key, value }) => {
					const id = key.split ('_').pop ();
					$_(`${selector} [data-screen='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (value.name);
					$_(`${selector} [data-screen='save'] [data-ui='slots'] [data-save='${id}'] small`).text (value.name);
				});
				Monogatari.global ('overwriteSlot', null);
				$_(`${selector} [data-notice="slot-overwrite"]`).removeClass ('modal--active');
			}
		});

		$_(`${selector} [data-action="delete-slot"], ${selector} [data-action="delete-slot"] *`).click(function () {
			Monogatari.Storage.remove (Monogatari.global ('deleteSlot'));
			$_(`${selector} [data-load-slot="${Monogatari.global ('deleteSlot')}"], ${selector} [data-save="${Monogatari.global ('deleteSlot')}"]`).remove ();
			Monogatari.global ('deleteSlot', null);
			$_(`${selector} [data-notice="slot-deletion"]`).removeClass ('modal--active');
		});

		// Save to slot when a slot is pressed.
		$_(`${selector} [data-screen="save"]`).on ('click', 'figcaption, img, small', function () {
			Monogatari.global ('overwriteSlot', $_(this).parent ().data ('save').split ('_').pop ());
			Monogatari.Storage.get (Monogatari.setting ('SaveLabel') + '_' + Monogatari.global ('overwriteSlot')).then ((data) => {
				if (typeof data.name !== 'undefined') {
					$_(`${selector} [data-notice="slot-overwrite"] input`).value (data.name);
				} else {
					$_(`${selector} [data-notice="slot-overwrite"] input`).value (data.date);
				}
				$_(`${selector} [data-notice="slot-overwrite"]`).addClass ('modal--active');
			});
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Disable the load and save slots in case Local Storage is not supported.
		if (!window.localStorage) {
			$_(`${selector} [data-screen="save"] [data-ui="slots"]`).html (`<p>${Monogatari.string ('LocalStorageWarning')}</p>`);
		}
		return Promise.resolve ();
	}

	static render () {
		$_(`${Monogatari.selector} [data-screen="save"] [data-ui="slots"]`).html ('');
		return Promise.resolve ();
	}
}

SaveScreen._configuration = {};
SaveScreen._state = {};
SaveScreen._id = 'SAVE_MENU';

SaveScreen._html = `
	<section data-screen="save">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<div class="horizontal horizontal--center">
			<input type="text" placeholder="Save Slot Name" data-input="slotName" required>
			<button data-string="Save" data-action="save">Save</button>
		</div>
		<div data-ui="slots" class="row row--spaced padded"></div>
	</section>
`;

Monogatari.registerComponent (SaveScreen);