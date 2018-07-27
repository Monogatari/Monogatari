import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SaveMenu extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return SaveMenu._configuration[object];
			} else {
				SaveMenu._configuration = Object.assign ({}, SaveMenu._configuration, object);
				SaveMenu.onUpdate ();
			}
		} else {
			return SaveMenu._configuration;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return SaveMenu._state[object];
			} else {
				SaveMenu._state = Object.assign ({}, SaveMenu._state, object);
				SaveMenu.onUpdate ();
			}
		} else {
			return SaveMenu._state;
		}
	}

	static html (html = null) {
		if (html !== null) {
			SaveMenu._html = html;
		} else {
			return SaveMenu._html;
		}
	}

	static setup (selector) {
		$_(selector).append (SaveMenu.html ());

		$_(selector).prepend (`
			<div data-notice="slot-overwrite" class="modal">
				<div class="modal__content">
					<p data-string="SlotOverwrite"">Are you sure you want to overwrite this slot?</p>
					<input type="text" name="name" class="margin" required>
					<div>
						<button data-action="overwrite-slot" data-string="Overwrite">Overwrite</button>
						<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
					</div>
				</div>
			</div>
		`);
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector} [data-menu="save"]`).on ('click', '[data-delete], [data-delete] *', function () {
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

		$_(`${selector} [data-action="save"], ${selector} [data-action="save"] *`).click(function () {
			const slotName = $_(`${selector} [data-menu="save"] [data-input="slotName"]`).value ().trim ();
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
					$_(`${selector} [data-menu='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (value.name);
					$_(`${selector} [data-menu='save'] [data-ui='slots'] [data-save='${id}'] small`).text (value.name);
				});
				Monogatari.global ('overwriteSlot', null);
				$_(`${selector} [data-notice="slot-overwrite"]`).removeClass ('modal--active');
			}
		});

		$_(`${selector} [data-action="delete-slot"], ${selector} [data-action="delete-slot"] *`).click(function () {
			Monogatari.Storage.remove (Monogatari.setting ('SaveLabel') + '_' + Monogatari.global ('deleteSlot'));
			$_(`${selector} [data-load-slot="${Monogatari.global ('deleteSlot')}"], ${selector} [data-save="${Monogatari.global ('deleteSlot')}"]`).remove ();
			Monogatari.global ('deleteSlot', null);
			$_(`${selector} [data-notice="slot-deletion"]`).removeClass ('modal--active');
		});

		// Save to slot when a slot is pressed.
		$_(`${selector} [data-menu="save"]`).on ('click', 'figcaption, img, small', function () {
			Monogatari.global ('overwriteSlot', $_(this).parent ().data ('save'));
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
			$_(`${selector} [data-menu="save"] [data-ui="slots"]`).html (`<p>${Monogatari.string ('LocalStorageWarning')}</p>`);
		}
		return Promise.resolve ();
	}

	static render () {
		$_(`${Monogatari.selector} [data-menu="save"] [data-ui="slots"]`).html ('');
		return Promise.resolve ();
	}
}

SaveMenu._configuration = {};
SaveMenu._state = {};
SaveMenu._id = 'SaveMenu';

SaveMenu._html = `
	<section data-menu="save">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<div class="horizontal horizontal--center">
			<input type="text" placeholder="Save Slot Name" data-input="slotName" required>
			<button data-string="Save" data-action="save">Save</button>
		</div>
		<div data-ui="slots" class="row row--spaced padded"></div>
	</section>
`;

Monogatari.registerComponent (SaveMenu);