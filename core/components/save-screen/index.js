import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';
import moment from 'moment';

class SaveScreen extends ScreenComponent {

	static bind (selector) {

		this.instances ().on ('click', '[data-action="save"]', function () {
			const slotName = this.content ('slot-name').value ().trim ();
			if (slotName !== '') {
				this.engine.saveTo ('SaveLabel', null, slotName).then (({ key, value }) => {
					//this.engine.addSlot (key.split ('_').pop (), value);
				});
			}
		});

		this.engine.registerListener ('overwrite-slot', {
			callback: () => {
				const customName = this.content ('slot-name').value ().trim ();
				if (customName !== '') {
					this.engine.saveTo ('SaveLabel', this.engine.global ('overwriteSlot'), customName).then (({ key, value }) => {
					});
					this.engine.global ('overwriteSlot', null);
					this.engine.dismissAlertDialog ('slot-overwrite');
				}
			}
		});

		// Save to slot when a slot is pressed.
		this.instances ().on ('click', '[data-slot], [data-slot] *:not([data-delete])', function (event) {
			this.engine.debug.debug ('Registered Click on Slot');

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

	onStateUpdate (property, oldValue, newValue) {
		super.onStateUpdate (property, oldValue, newValue);
		if (property === 'open' && newValue === true) {
			this.content ('slot-name').value (moment ().format ('MMMM Do YYYY, h:mm:ss a'));
		}
		return Promise.resolve ();
	}

	didMount () {
		// Disable the load and save slots in case Local Storage is not supported.
		if (!window.localStorage) {
			this.content ('slots').html (`<p>${this.engine.string ('LocalStorageWarning')}</p>`);
		}
		return Promise.resolve ();
	}

	render () {
		return `
			<button class="fas fa-arrow-left top left" data-action="back"></button>
			<div class="horizontal horizontal--center">
				<input type="text" placeholder="Save Slot Name" data-input="slotName" data-content="slot-name" required>
				<button data-string="Save" data-action="save">Save</button>
			</div>
			<div data-ui="slots" data-content="slots" class="row row--spaced padded">
			<slot-list label=${this.engine.setting ('SaveLabel')}></slot-list>
			</div>
		`;
	}
}

SaveScreen._id = 'save-screen';

Monogatari.registerComponent (SaveScreen);