import { Component } from './../../lib/Component';
import { Text } from '@aegis-framework/artemis/index';
import moment from 'moment/min/moment-with-locales';

class SaveSlot extends Component {

	static shouldRollback () {
		return Promise.resolve ();
	}

	static willRollback () {
		return Promise.resolve ();
	}

	static bind (selector) {

		this.engine.registerListener ('delete-slot', {
			callback: () => {
				const target = this.engine.global ('delete_slot');

				// Delete the slot from the storage
				this.engine.Storage.remove (target);

				// Reset the temporal delete slot variable
				this.engine.global ('delete_slot', null);
				this.engine.dismissAlert ('slot-deletion');

				this.engine.instances ().remove ();
			}
		});

		const engine = this.engine;

		this.engine.on ('click', '[data-component="slot-container"] [data-delete]', function (event) {
			engine.debug.debug ('Registered Click on Slot Delete Button');
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			engine.global ('delete_slot', this.dataset.delete);
			engine.Storage.get (engine.global ('delete_slot')).then ((data) => {
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
				// @Compatibility [<= v1.4.1]
				// In older versions the date was saved using the JavaScript native Date
				// object which is not great and moment can actually have trouble parsing
				// these old dates, specially because we used the locale date wich we have
				// no way of identifying. Therefore, we'll try to parse the date and if
				// it doesn't work as-is, we'll try swaping the month and day positions
				// which may be a common difference on the locales.
				try {
					// Check if the date was saved in the old format (dd/mm/yy, hh:mm:ss)
					if (data.date.indexOf ('/') > -1) {
						const [date, time] = data.date.replace (',', '').split (' ');
						const [month, day, year] = date.split ('/');
						if (isNaN (Date.parse (date))) {
							data.date = `${year}-${day}-${month} ${time}`;
						} else {
							data.date = `${year}-${month}-${day} ${time}`;
						}
					}
				} catch (e) {
					this.engine.debug.debug ('Failed to convert date', e);
				}

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
			background = `url(${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').scenes}/${this.engine.asset ('scenes', this.props.image)})`;
		} else if ('game' in this.data) {
			// @Compatibility [<= v1.4.1]
			// That last if checking for the existance of game in the data is
			// required because older versions do not have that property.

			// eslint-disable-next-line
			console.debug('SaveSlot.render', this.data.game.state.background, this.data.game.state.scene);

			if (this.data.game.state.background) {
				// eslint-disable-next-line no-console
				console.debug('this.data.game.state.background case');
				background = this.data.game.state.background;

				if (background.indexOf (' with ') > -1) {
					background = Text.prefix (' with ', background);
				}

				background = Text.suffix ('show background', background);
			} else if (this.data.game.state.scene) {
				// eslint-disable-next-line no-console
				console.debug('this.data.game.state.scene case');
				background = this.data.game.state.scene;

				if (background.indexOf (' with ') > -1) {
					background = Text.prefix (' with ', background);
				}

				background = Text.suffix ('show scene', background);
			}
		}
		return `
			<button data-delete='${this.props.slot}' aria-label="${this.engine.string ('Delete')} Slot ${this.props.name}"><span class='fas fa-times'></span></button>
			<small class='badge'>${this.props.name}</small>
			<div data-content="background" style="${hasImage ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${moment (this.props.date).format ('LL LTS')}</figcaption>
		`;
	}
}

SaveSlot.tag = 'save-slot';


export default SaveSlot;