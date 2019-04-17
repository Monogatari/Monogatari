import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class SlotList extends Component {

	constructor () {
		super ();

		this.state = {
			slots: []
		};
	}

	willMount () {
		this.classList.add ('row', 'row--spaced');
		return this.engine.Storage.keys ().then ((keys) => {
			const savedData = keys.filter ((key) => {
				return key.indexOf (this.props.label) === 0;
			}).sort ((a, b) => {
				const aNumber = parseInt (a.split (this.props.label)[1]);
				const bNumber = parseInt (b.split (this.props.label)[1]);

				if (aNumber > bNumber) {
					return 1;
				} else if (aNumber < bNumber) {
					return -1;
				} else {
					return 0;
				}
			});

			this.setState ({
				slots: savedData
			});
		});
	}

	didMount () {
		// // Load a saved game slot when it is pressed
		// this.element ().on ('click', '[data-slot]', function () {
		// 	const isDeleteButton = $_(this).matches ('[data-delete], [data-delete] *');
		// 	if (!isDeleteButton) {
		// 		Monogatari.loadFromSlot ($_(this).closest ('[data-slot]').data('slot'));
		// 	}
		// });
		return Promise.resolve ();
	}

	render () {
		const slots = this.state.slots.map (slot => `<save-slot slot="${slot}"></save-slot>`).join ('');

		if (slots !== '') {
			return slots;
		}

		return `<p data-string="NoSavedGames">${Monogatari.string ('NoSavedGames')}</p>`;
	}
}

SlotList._id = 'slot-list';

Monogatari.registerComponent (SlotList);