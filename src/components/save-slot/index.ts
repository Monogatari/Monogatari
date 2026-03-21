import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import { Text } from '@aegis-framework/artemis';
import { DateTime } from 'luxon';

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

interface SaveSlotProps extends Properties {
	slot?: string;
	name: string;
	date: string;
	screenshot: string;
	image: string;
}

class SaveSlot extends Component<SaveSlotProps, Properties> {
	static override tag = 'save-slot';

	data: SaveSlotData | null = null;

	private _screenshotObjectUrl: string | null = null;

	static override bind(): Promise<void> {
		const self = this;

		this.engine.registerListener('delete-slot', {
			callback: async () => {
				const target = this.engine.global('delete_slot') as string | null;

				if (!target) {
					return;
				}

				// Read save data to get screenshot key before deleting
				try {
					const rawData = await this.engine.Storage.get(target);
					const data = rawData as SaveSlotData;

					if (data?.screenshot) {
						await this.engine.onDeleteScreenshot(data.screenshot);
					}
				} catch {
					// Save data may be corrupt, proceed with deletion
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
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();

      engine.debug.debug('Registered Click on Slot Delete Button');

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
			slot: undefined,
			name: '',
			date: '',
			screenshot: '',
			image: ''
		};

		this.data = null;
	}

	override async willMount(): Promise<void> {
		const slotKey = this.props.slot;

		if (!slotKey) {
			this.engine.debug.error('SaveSlot: No slot key provided');
			return;
		}

		const rawData = await this.engine.Storage.get(slotKey);
		const data = rawData as SaveSlotData;
		this.data = data;

		if (typeof data.Engine !== 'undefined') {
			data.name = data.Name;
			data.date = data.Date ?? '';
			try {
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

		let screenshotUrl = '';

		if (data.screenshot) {
			try {
				if (this._screenshotObjectUrl) {
					URL.revokeObjectURL(this._screenshotObjectUrl);
					this._screenshotObjectUrl = null;
				}

				screenshotUrl = await this.engine.onLoadScreenshot(data.screenshot);

				if (screenshotUrl.startsWith('blob:')) {
					this._screenshotObjectUrl = screenshotUrl;
				}
			} catch (e) {
				this.engine.debug.warn('Failed to load screenshot for slot', slotKey, e);
			}
		}

		this.setProps({
			name: data.name ?? '',
			date: data.date,
			image: data.image ?? '',
			screenshot: screenshotUrl
		});
	}

	override async willUnmount(): Promise<void> {
		if (this._screenshotObjectUrl) {
			URL.revokeObjectURL(this._screenshotObjectUrl);
			this._screenshotObjectUrl = null;
		}
	}

	override render(): string {
		let background = '';

		if (this.props.screenshot) {
			background = `url(${this.props.screenshot})`;
		} else {
			const assetsPath = this.engine.setting('AssetsPath') as { root: string; scenes: string };
			const hasImage = this.props.image && this.engine.asset('scenes', this.props.image);

			if (hasImage) {
				background = `url(${assetsPath.root}/${assetsPath.scenes}/${this.engine.asset('scenes', this.props.image)})`;
			} else if (this.data && 'game' in this.data && this.data.game) {
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
		}

		const useBackgroundImage = !!this.props.screenshot || (this.props.image && this.engine.asset('scenes', this.props.image));

		return `
			<button data-delete='${this.props.slot}' aria-label="${this.engine.string('Delete')} Slot ${this.props.name}"><span class='fas fa-times'></span></button>
			<small class='badge'>${this.props.name}</small>
			<div data-content="background" style="${useBackgroundImage ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${DateTime.fromISO(this.props.date).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}</figcaption>
		`;
	}
}

export default SaveSlot;