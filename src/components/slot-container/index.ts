import type { Properties } from '@aegis-framework/pandora';
import { $_, DOM } from '@aegis-framework/artemis';
import Component from '../../lib/Component';

/**
 * Props for SlotContainer component
 */
export interface SlotContainerProps extends Properties {
	type: 'load' | 'save';
	label?: string;
}

/**
 * State for SlotContainer component
 */
export interface SlotContainerState extends Properties {
	slots: string[];
}

class SlotContainer extends Component<SlotContainerProps, SlotContainerState> {
	static override tag = 'slot-container';

	static override bind(): Promise<void> {
		this.engine.registerListener('overwrite-slot', {
			callback: (event: Event, element: DOM) => {
				// Find the modal wrapper first, then find the input within it
				const wrapper = element.closest('[data-content="wrapper"]');
				const customName = wrapper.find('[data-content="context"]').value()?.trim() ?? '';
				if (customName !== '') {
					this.engine.saveTo('SaveLabel', this.engine.global('overwrite_slot') as number, customName);

					this.engine.global('overwrite_slot', null);
					this.engine.dismissAlert('slot-overwrite');
				}
			}
		});
		return Promise.resolve();
	}

	constructor() {
		super();

		this.props = {
			type: undefined as unknown as 'load' | 'save',
			label: undefined
		};

		this.state = {
			slots: []
		};
	}

	override willMount(): Promise<void> {
		const fullLabel = `${this.props.label}_`;

		return (this.engine.Storage.each((key: string, value: unknown) => {
			if (key.indexOf(fullLabel) === 0) {
				// If any of the save files has somehow become corrupted and is
				// no longer a valid object, we'll want to exclude it.
				if (typeof value === 'object' && value !== null) {
					return Promise.resolve({
						valid: true,
						id: parseInt(key.split(fullLabel)[1]),
						key,
					});
				}
			}
			return Promise.resolve({ valid: false });
		}) as Promise<Array<{ valid: boolean; id?: number; key?: string }>>).then((data) => {
			// Filter only those that are marked as valid and then, sort them
			// using their id as the pivot
			const validSlots = data.filter(d => d.valid).sort((a, b) => {
				if ((a.id ?? 0) > (b.id ?? 0)) {
					return 1;
				} else if ((a.id ?? 0) < (b.id ?? 0)) {
					return -1;
				} else {
					return 0;
				}
			}).map(({ key }) => {
				return key!;
			});

			this.setState({
				slots: validSlots
			});
		});
	}

	override didMount(): Promise<void> {
		const engine = this.engine;

		// Read type from attribute directly because of props proxy priority issue
		const type = this.getAttribute('type') || this.props.type;

		if (type === 'load') {
			// Load a saved game slot when it is pressed
			this.element().on('click', '[data-component="save-slot"]', function(this: HTMLElement, event: Event) {
				const target = event.target as HTMLElement;
				const isDeleteButton = target.closest('[data-delete]') !== null;
				if (!isDeleteButton) {
					const slot = $_(this).attribute('slot');
					if (slot) {
						engine.loadFromSlot(slot).then(() => {
							engine.run(engine.label()[engine.state('step') as number]);
						});
					}
				}
			});
		} else if (type === 'save') {
			const self = this;
			// Save to slot when a slot is pressed.
			this.element().on('click', '[data-component="save-slot"]', function(this: HTMLElement, event: Event) {
				const target = event.target as HTMLElement;
				const isDeleteButton = target.closest('[data-delete]') !== null;

				if (!isDeleteButton) {
					engine.debug.debug('Registered Click on Slot');

					event.stopImmediatePropagation();
					event.stopPropagation();
					event.preventDefault();

					const slot = $_(this).attribute('slot');
					const slotId = slot?.split('_').pop() ?? null;
					engine.global('overwrite_slot', slotId);
					engine.Storage.get(self.props.label + '_' + engine.global('overwrite_slot')).then((data: unknown) => {
						const saveData = data as { name?: string; date: string };
						engine.alert('slot-overwrite', {
							message: 'SlotOverwrite',
							context: typeof saveData.name !== 'undefined' ? saveData.name : saveData.date,
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

		this.engine.Storage.onCreate((key: string, value: unknown) => {
			// We only want to react to those items that we believe are save files
			// by their key and making sure they're an actual object
			if (key.indexOf(`${this.props.label}_`) === 0) {
				if (typeof value === 'object' && value !== null) {
					this.setState({
						slots: [...new Set([...this.state.slots, key])]
					});
				}
			}
		});

		this.engine.Storage.onUpdate((key: string, value: unknown) => {
			// We only want to react to those items that we believe are save files
			// by their key and making sure they're an actual object
			if (key.indexOf(`${this.props.label}_`) === 0) {
				if (typeof value === 'object' && value !== null) {
					const slot = this.element().find(`[slot="${key}"]`).get(0);
					if (slot && 'setProps' in slot) {
						(slot as { setProps: (props: unknown) => void }).setProps(value);
					}
				}
			}
		});

		this.engine.Storage.onDelete((key: string) => {
			if (key.indexOf(`${this.props.label}_`) === 0) {
				this.setState({
					slots: this.state.slots.filter(s => s !== key)
				});
			}
		});

		this.engine.on('didLocalize', () => {
			this.forceRender();
		});

		return Promise.resolve();
	}

	override onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		if (property === 'slots') {
			this.forceRender();
		}
		return Promise.resolve();
	}

	override render(): string {
		const slots = this.state.slots.map(slot => `<save-slot slot="${slot}"></save-slot>`).join('');

		if (slots !== '') {
			return slots;
		}

		return `<p data-string="NoSavedGames">${this.engine.string('NoSavedGames')}</p>`;
	}
}

export default SlotContainer;

