import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import { Text } from '@aegis-framework/artemis';
import { DateTime } from 'luxon';

/**
 * Save slot data interface
 */
interface SaveSlotData {
	name?: string;
	date: string;
	image?: string;
	screenshot?: string;
	Engine?: {
		Scene: string;
	};
	Name?: string;
	Date?: string;
	game?: {
		state: {
			background?: string;
			scene?: string;
		};
	};
}

/**
 * Props for SaveSlot component
 */
interface SaveSlotProps extends Properties {
	slot: string;
	name: string;
	date: string;
	screenshot: string;
	image: string;
}

class SaveSlot extends Component<SaveSlotProps, Properties> {
	static override tag = 'save-slot';

	data: SaveSlotData | null = null;

	static override bind(): Promise<void> {
		const self = this;

		this.engine.registerListener('delete-slot', {
			callback: () => {
				const target = this.engine.global('delete_slot') as string | null;

				if (!target) {
					return;
				}

				// Delete the slot from the storage
				this.engine.Storage.remove(target);

				// Reset the temporal delete slot variable
				this.engine.global('delete_slot', null);
				this.engine.dismissAlert('slot-deletion');
			}
		});

		const engine = this.engine;

		this.engine.on('click', '[data-component="slot-container"] [data-delete]', function(this: HTMLElement, event: Event) {
			engine.debug.debug('Registered Click on Slot Delete Button');
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();

			const deleteSlot = (this as HTMLElement).dataset.delete;
			if (deleteSlot) {
				engine.global('delete_slot', deleteSlot);
				engine.Storage.get(deleteSlot).then((data: unknown) => {
					const saveData = data as SaveSlotData;
					engine.alert('slot-deletion', {
						message: 'SlotDeletion',
						context: typeof saveData.name !== 'undefined' ? saveData.name : saveData.date,
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
			}
		});
		return Promise.resolve();
	}

	constructor() {
		super();
		this.props = {
			slot: '',
			name: '',
			date: '',
			screenshot: '',
			image: ''
		};

		this.data = null;
	}

	override willMount(): Promise<void> {
		this.classList.add('row__column', 'row_column--6', 'row__column--tablet--4', 'row__column--desktop--3', 'row__column--desktop-large--2');

		return this.engine.Storage.get(this.props.slot).then((rawData: unknown) => {
			const data = rawData as SaveSlotData;
			this.data = data;

			if (typeof data.Engine !== 'undefined') {
				data.name = data.Name;
				data.date = data.Date ?? '';
				// @Compatibility [<= v1.4.1]
				// In older versions the date was saved using the JavaScript native Date
				// object which is not great and moment can actually have trouble parsing
				// these old dates, specially because we used the locale date wich we have
				// no way of identifying. Therefore, we'll try to parse the date and if
				// it doesn't work as-is, we'll try swaping the month and day positions
				// which may be a common difference on the locales.
				try {
					// Check if the date was saved in the old format (dd/mm/yy, hh:mm:ss)
					if (data.date.indexOf('/') > -1) {
						const [date, time] = data.date.replace(',', '').split(' ');
						const [month, day, year] = date.split('/');
						if (isNaN(Date.parse(date))) {
							data.date = `${year}-${day}-${month} ${time}`;
						} else {
							data.date = `${year}-${month}-${day} ${time}`;
						}
					}
				} catch (e) {
					this.engine.debug.debug('Failed to convert date', e);
				}

				data.image = data.Engine.Scene;
			}

			this.setProps({
				name: data.name ?? '',
				date: data.date,
				image: data.image ?? ''
			});
		});
	}

	override render(): string {
		let background = '';

		const assetsPath = this.engine.setting('AssetsPath') as { root: string; scenes: string };
		const hasImage = this.props.image && this.engine.asset('scenes', this.props.image);

		if (hasImage) {
			background = `url(${assetsPath.root}/${assetsPath.scenes}/${this.engine.asset('scenes', this.props.image)})`;
		} else if (this.data && 'game' in this.data && this.data.game) {
			// @Compatibility [<= v1.4.1]
			// That last if checking for the existance of game in the data is
			// required because older versions do not have that property.

			if (this.data.game.state.background) {
				background = this.data.game.state.background;

				if (background.indexOf(' with ') > -1) {
					background = Text.prefix(' with ', background);
				}

				background = Text.suffix('show background', background);
			} else if (this.data.game.state.scene) {
				background = this.data.game.state.scene;

				if (background.indexOf(' with ') > -1) {
					background = Text.prefix(' with ', background);
				}

				background = Text.suffix('show scene', background);
			}
		}
		return `
			<button data-delete='${this.props.slot}' aria-label="${this.engine.string('Delete')} Slot ${this.props.name}"><span class='fas fa-times'></span></button>
			<small class='badge'>${this.props.name}</small>
			<div data-content="background" style="${hasImage ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${DateTime.fromISO(this.props.date).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}</figcaption>
		`;
	}
}

export default SaveSlot;