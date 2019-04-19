import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SlotList extends Component {

	static bind () {
		this.engine.registerListener ('overwrite-slot', {
			callback: (element) => {
				const customName = $_(element).closest ('[data-content="context"]').text ().trim ();
				if (customName !== '') {
					this.engine.saveTo ('SaveLabel', this.engine.global ('overwriteSlot'), customName);

					this.engine.global ('overwriteSlot', null);
					this.engine.dismissAlert ('slot-overwrite');
				}
			}
		});
		return Promise.resolve();
	}

	constructor () {
		super();

		this.props = {
			type: 'load',
			label: ''
		};

		this.state = {
			slots: []
		};
	}

	willMount () {
		this.classList.add('row', 'row--spaced');
		return this.engine.Storage.keys().then((keys) => {
			const savedData = keys.filter((key) => {
				return key.indexOf(this.props.label) === 0;
			}).sort((a, b) => {
				const aNumber = parseInt(a.split(this.props.label)[1]);
				const bNumber = parseInt(b.split(this.props.label)[1]);

				if (aNumber > bNumber) {
					return 1;
				} else if (aNumber < bNumber) {
					return -1;
				} else {
					return 0;
				}
			});

			this.setState({
				slots: savedData
			});
		});
	}

	didMount () {
		const engine = this.engine;

		if (this.props.type === 'load') {
			// Load a saved game slot when it is pressed
			this.element().on ('click', '[data-component="save-slot"]', function (event) {
				const isDeleteButton = $_(event.target).closestParent ('[data-delete]', '[data-component="save-slot"]');

				if (!isDeleteButton) {
					engine.loadFromSlot($_(this).attribute ('slot')).then (() => {
						engine.run (engine.label ()[engine.state ('step')]);
					});
				}
			});
		} else if (this.props.type === 'save') {

			const self = this;
			// Save to slot when a slot is pressed.
			this.element().on('click', '[data-component="save-slot"]', function (event) {
				const isDeleteButton = $_(event.target).closestParent ('[data-delete]', '[data-component="save-slot"]');

				if (!isDeleteButton) {
					engine.debug.debug('Registered Click on Slot');

					event.stopImmediatePropagation();
					event.stopPropagation();
					event.preventDefault();

					engine.global('overwriteSlot', $_(this).attribute ('slot').split ('_').pop ());
					engine.Storage.get (self.props.label + '_' + engine.global('overwriteSlot')).then((data) => {
						engine.alert('slot-overwrite', {
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
				}
			});
		}

		this.engine.Storage.onCreate ((key, value) => {
			if (key.indexOf (`${this.props.label}_`) === 0) {
				this.setState ({
					slots: [...this.state.slots, key]
				});
			}
		});

		this.engine.Storage.onUpdate ((key, value) => {
			if (key.indexOf (`${this.props.label}_`) === 0) {
				this.element ().find (`[slot="${key}"]`).get (0).setProps (value);
			}
		});

		this.engine.Storage.onDelete ((key, value) => {
			if (key.indexOf (`${this.props.label}_`) === 0) {
				this.setState ({
					slots: this.state.slots.filter (s => s !== key)
				});
			}
		});

		return Promise.resolve();
	}

	onStateUpdate (property, oldValue, newValue) {
		if (property === 'slots') {
			this.forceRender ();
		}
		return Promise.resolve();
	}

	render () {
		const slots = this.state.slots.map(slot => `<save-slot slot="${slot}"></save-slot>`).join('');

		if (slots !== '') {
			return slots;
		}

		return `<p data-string="NoSavedGames">${Monogatari.string('NoSavedGames')}</p>`;
	}
}

SlotList._id = 'slot-list';

Monogatari.registerComponent(SlotList);