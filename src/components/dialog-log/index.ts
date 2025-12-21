import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import type { Character } from '../../lib/types';

/**
 * Dialog entry for the log
 */
export interface DialogEntry {
	id: string;
	character: Character;
	dialog: string;
}

/**
 * State for DialogLog component
 */
export interface DialogLogState extends Properties {
	active: boolean;
}

class DialogLog extends Component<Properties, DialogLogState> {
	static override tag = 'dialog-log';

	static override setup(): Promise<void> {
		const quickMenu = this.engine.component('quick-menu') as { addButtonAfter?: (after: string, btn: { string: string; icon: string; data: { action: string } }) => void } | undefined;
		if (quickMenu?.addButtonAfter) {
			quickMenu.addButtonAfter('Hide', {
				string: 'Log',
				icon: 'far fa-comments',
				data: {
					action: 'dialog-log'
				}
			});
		}
		return Promise.resolve();
	}

	static override bind(): Promise<void> {
		this.engine.registerListener('dialog-log', {
			callback: () => {
				this.instances((element: DialogLog) => {
					const active = element.state.active;
					element.setState({
						active: !active
					});
				});
			}
		});
		return Promise.resolve();
	}

	constructor() {
		super();

		this.state = {
			active: false
		};
	}

	override onReset(): Promise<void> {
		this.content('log').html('<div class="text--center padded" data-string="NoDialogsAvailable" data-content="placeholder">No dialogs available. Dialogs will appear here as they show up.</div>');
		return Promise.resolve();
	}

	write({ id, character, dialog }: DialogEntry): void {
		this.content('placeholder').remove();
		if (id !== '_narrator' && id !== 'centered') {
			const { name, color } = character;
			this.content('log').append(`
				<div data-spoke="${id}" class="named">
					<span style="color:${color};">${this.engine.replaceVariables(name ?? '')} </span>
					<p>${dialog}</p>
				</div>
			`);
		} else {
			this.content('log').append(`<div data-spoke="${id}" class="unnamed"><p>${dialog}</p></div>`);
		}
	}

	pop(): void {
		const last = this.content('log').find('[data-spoke]').last();
		last.remove();
	}

	override onStateUpdate(property: string, _oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'active') {
			this.classList.toggle('modal--active');

			if (newValue === true) {
				this.scrollTop = this.scrollHeight;
			}
		}
		return Promise.resolve();
	}

	override willMount(): Promise<void> {
		this.classList.add('modal');
		return Promise.resolve();
	}

	override render(): string {
		return `
			<div class="modal__content">
				<div data-content="log">
					<div class="text--center padded" data-string="NoDialogsAvailable" data-content="placeholder">No dialogs available. Dialogs will appear here as they show up.</div>
				</div>
				<button data-string="Close" data-action="dialog-log">Close</button>
			</div>
		`;
	}
}

export default DialogLog;

