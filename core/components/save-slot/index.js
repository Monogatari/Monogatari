import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';
import { Text } from '@aegis-framework/artemis';
import moment from 'moment';

class SaveSlot extends Component {

	static bind (selector) {

		this.engine.registerListener ('delete-slot', {
			callback: () => {
				const target = this.engine.global ('deleteSlot');

				// Delete the slot from the storage
				this.engine.Storage.remove (target);

				// Reset the temporal delete slot variable
				this.engine.global ('deleteSlot', null);
				this.engine.dismissAlert ('slot-deletion');

				this.engine.instances ().remove ();
			}
		});

		const engine = this.engine;

		this.engine.on ('click', '[data-component="slot-list"] [data-delete]', function (event) {
			Monogatari.debug.debug ('Registered Click on Slot Delete Button');
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			engine.global ('deleteSlot', this.dataset.delete);
			engine.Storage.get (engine.global ('deleteSlot')).then ((data) => {
				engine.alert ('slot-deletion', {
					message: 'SlotDeletion',
					context: typeof data.name !== 'undefined' ? data.name : data.date,
					actions: [
						{
							label: 'Delete',
							listener: 'delete-slot'
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

	constructor () {
		super ();
		this.props = {
			slot: '',
			name: '',
			date: '',
			screenshot: '',
			image: ''
		};

		this.data = null;
	}

	willMount () {
		this.classList.add ('row__column', 'row_column--6', 'row__column--tablet--4', 'row__column--desktop--3', 'row__column--desktop-large--2');

		return this.engine.Storage.get (this.slot).then ((data) => {
			this.data = data;

			if (typeof data.Engine !== 'undefined') {
				data.name = data.Name;
				data.date = data.Date;
				data.image = data.Engine.Scene;
			}

			this.setProps ({
				name: data.name,
				date: data.date,
				image: data.image
			});
		});
	}

	render () {
		let background = '';

		const hasImage = this.props.image && this.engine.asset ('scenes', this.props.image);

		if (hasImage) {
			background = `url(${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').scenes}/${this.props.image})`;
		} else if (this.data.game.state.scene) {
			background = this.data.game.state.scene;

			if (background.indexOf (' with ') > -1) {
				background = Text.suffix ('show scene', Text.prefix (' with ', background));
			}
		}
		return `
			<button data-delete='${this.props.slot}'><span class='fas fa-times'></span></button>
			<small class='badge'>${this.props.name}</small>
			<div data-content="background" style="${hasImage ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${moment (this.props.date).format ('MMMM Do YYYY, h:mm:ss a')}</figcaption>
		`;
	}
}

SaveSlot._id = 'save-slot';

Monogatari.registerComponent (SaveSlot);