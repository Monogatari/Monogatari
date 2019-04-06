import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SaveScreen extends Component {

	static setup (selector) {
		$_(selector).append (SaveScreen.html ());
		return Promise.resolve ();
	}

	static bind (selector) {

		$_(`${selector} [data-action="save"], ${selector} [data-action="save"] *`).click (function () {
			const slotName = $_(`${selector} [data-screen="save"] [data-input="slotName"]`).value ().trim ();
			if (slotName !== '') {
				Monogatari.saveTo ('SaveLabel', null, slotName).then (({ key, value }) => {
					Monogatari.addSlot (key.split ('_').pop (), value);
				});
			}
		});

		Monogatari.registerListener ('overwrite-slot', {
			callback: () => {
				const customName = $_(`${selector} [data-alert="slot-overwrite"] [data-content="context"]`).text ().trim ();
				if (customName !== '') {
					Monogatari.saveTo ('SaveLabel', Monogatari.global ('overwriteSlot'), customName).then (({ key, value }) => {
						$_(`${selector} [data-slot='${key}'] small`).text (value.name);
					});
					Monogatari.global ('overwriteSlot', null);
					Monogatari.dismissAlert ('slot-overwrite');
				}
			}
		});

		// Save to slot when a slot is pressed.
		$_(`${selector} [data-screen="save"]`).on ('click', '[data-slot], [data-slot] *:not([data-delete])', function (event) {
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();


			Monogatari.global ('overwriteSlot', $_(this).parent ().data ('slot').split ('_').pop ());
			Monogatari.Storage.get (Monogatari.setting ('SaveLabel') + '_' + Monogatari.global ('overwriteSlot')).then ((data) => {
				Monogatari.alert ('slot-overwrite', {
					message: 'SlotOverwrite',
					context: typeof data.name !== 'undefined' ? data.name : data.date,
					editable: true,
					actions: [
						{
							label: 'Overwrite',
							listener: 'overwrite-slot'
						},
						{
							label: 'Cancel',
							listener: 'dismiss-alert'
						}
					]
				});
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

SaveScreen._id = 'save-screen';

SaveScreen._html = `
	<section data-component="save-screen" data-screen="save">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<div class="horizontal horizontal--center">
			<input type="text" placeholder="Save Slot Name" data-input="slotName" required>
			<button data-string="Save" data-action="save">Save</button>
		</div>
		<div data-ui="slots" class="row row--spaced padded"></div>
	</section>
`;

Monogatari.registerComponent (SaveScreen);