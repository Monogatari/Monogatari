import { $_ } from '@aegis-framework/artemis';
import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
import type TypeWriterComponent from './../components/type-writer';
import type TextBoxComponent from './../components/text-box';

export class Dialog extends Action {
	static override id = 'Dialog';

	static override async shouldProceed() {
    const element = this.engine.element();
		// Check if the type animation has finished and the Typed object still exists
		let component: TypeWriterComponent | undefined;

		const centeredDialog = element.find('[data-component="centered-dialog"]');

		if (centeredDialog.exists()) {
			component = centeredDialog.find('[data-content="wrapper"]').get(0) as TypeWriterComponent | undefined;
		} else {
      component = element.find('type-writer').get(0) as TypeWriterComponent | undefined
    }

		// In NVL mode, there might not be a type-writer element in the text-box
		if (!component) {
			return;
		}

		const hasStrings = (component.state.strings.length || 0) > 0;

		if (!this.engine.global('finished_typing') && hasStrings) {
			this.engine.stopTyping(component);
			throw new Error('TypeWriter effect has not finished.');
		}
	}

	static override async willProceed(): Promise<void> {
		const centeredDialog = this.engine.element().find('[data-component="centered-dialog"]');

		if (centeredDialog.exists()) {
			centeredDialog.remove();
		}

		this.engine.global('_dialog_pending_revert', false);
	}

	static override async willRollback(): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBoxComponent | undefined;

		this.engine.global('finished_typing', true);

		if (textBox?.show) {
			textBox.show();
		}

		const dialogLog = this.engine.component('dialog-log') as { instances?: (callback: (instance: { pop: () => void }) => void) => void } | undefined;

		const centeredDialog = this.engine.element().find('[data-component="centered-dialog"]');
		if (centeredDialog.isVisible()) {
			centeredDialog.remove();

			if (textBox?.show) {
				textBox.show();
			}
		}

		this.engine.element().find('[data-ui="who"]').html('');

		if (typeof dialogLog !== 'undefined' && this.engine.global('_dialog_pending_revert') === true && dialogLog.instances) {
			dialogLog.instances((instance) => instance.pop());
			this.engine.global('_dialog_pending_revert', false);
		}
	}

	static override async setup(): Promise<void> {
		this.engine.globals({
			finished_typing: false,
			typedConfiguration: {
				strings: [],
				typeSpeed: this.engine.preference('TextSpeed'),
				loop: 0, // Set to true for infinite looping.
				showCursor: false,
				hideCursorOnEnd: false, // If the cursor is being shown, hide it once the text ends.
				preStringTyped: () => {
					this.engine.global('finished_typing', false);
					this.engine.trigger('didStartTyping');
				},
				onStringTyped: () => {
					this.engine.global('finished_typing', true);
					this.engine.trigger('didFinishTyping');
				},
				onDestroy: () => {
					this.engine.global('finished_typing', true);
				}
			},
			_dialog_pending_revert: false,
		});

		// The NVL mode has its own history so that when going back, all dialogs
		// that were shown on screen can be shown again instead of just showing
		// the last one.
		this.engine.history('nvl');
	}

	static override async bind(selector: string): Promise<void> {
		// Add listener for the text speed setting
		$_(`${selector} [data-action="set-text-speed"]`).on('change mouseover', function (this: HTMLInputElement) {
			const maxTextSpeed = Dialog.engine.setting('maxTextSpeed') as number;
			const value = maxTextSpeed - parseInt(this.value);
			const typedConfig = Dialog.engine.global('typedConfiguration') as { typeSpeed?: number };
			typedConfig.typeSpeed = value;
			Dialog.engine.preference('TextSpeed', value);
		});

		// Detect scroll on the text element to remove the unread class used when
		// there's text not being shown in NVL mode.
		$_(`${selector} [data-component="text-box"] [data-content="text"]`).on('scroll', () => {
			const text_box = this.engine.element().find('[data-component="text-box"]');
			if (text_box.exists()) {
				const element = text_box.get(0) as any;
				if (typeof element.checkUnread === 'function') {
					element.checkUnread();
				}
			}
		});
	}

	static override async init(selector: string): Promise<void> {
		// Remove the Text Speed setting if the type animation was disabled
		if (this.engine.setting('TypeAnimation') === false) {
			$_(`${selector} [data-settings="text-speed"]`).hide();
		}

		this.engine.setting('maxTextSpeed', parseInt(($_(`${selector} [data-action="set-text-speed"]`).attribute('max') || '0')));
	}

	static override async reset({ keepNVL = false, saveNVL = false }: { keepNVL?: boolean; saveNVL?: boolean } = {}): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as any;

		if (saveNVL === true && textBox.props.mode === 'nvl') {
			this.engine.history('nvl').push(textBox.content('dialog').html());
		}

		if (keepNVL !== true) {
			textBox.setProps({ mode: 'adv' });
		}


		this.engine.element().find('[data-component="text-box"]').data('speaking', '');

		this.engine.element().find('[data-ui="who"]').style('color', '');

		this.engine.element().find('[data-ui="who"]').html('');
		this.engine.element().find('[data-ui="say"]').html('');

		this.engine.element().find('[data-ui="face"]').attribute('src', '');
		this.engine.element().find('[data-ui="face"]').hide();

		// Remove all classes from the text-box
		Array.from(textBox.classList).forEach((c: any) => textBox.classList.remove(c));

		// Remove all classes from the centered-dialog
		const centeredDialog = this.engine.element().find('[data-component="centered-dialog"]').get(0);

		if (centeredDialog) {
			Array.from(centeredDialog.classList).forEach((c: any) => centeredDialog.classList.remove(c));
		}
	}

	static override matchString(): boolean {
		return true;
	}

	dialog: string;
	clearDialog: string;
	nvl: boolean;
	classes: string[];
	character: any;
	image: string | undefined;
	expression: string | undefined;
	id: string = '';

	constructor(args: string[]) {
		super();
		const [character, ...dialog] = args;

		// id:expression:class Dialog
		const [id, expression, classes] = character.split(':');

		this.dialog = dialog.join(' ');
		this.clearDialog = this.dialog.replace(/\{pause:(\d+)\}/g, '').replace(/\{speed:(\d+)\}/g, '');

		this.nvl = false;

		this.classes = (classes && classes.trim() !== '') ? classes.split('|') : [];

		if (typeof this.engine.character(id) !== 'undefined') {
			this._setCharacter(id, expression);
		} else if (id === 'centered') {
			this.id = 'centered';
		} else {
			this.id = '_narrator';

			if (typeof this.engine.character('_narrator') !== 'undefined') {
				this._setCharacter('_narrator', expression);
			}

			if (id === 'nvl') {
				this.nvl = true;
			} else {
				this.dialog = `${character} ${this.dialog}`;
				this.clearDialog = `${character} ${this.clearDialog}`;
			}
		}
	}

	override async willApply(): Promise<void> {
		this.engine.element().find('[data-character]').removeClass('focus');
		this.engine.element().find('[data-ui="face"]').hide();

		this.engine.element().find('[data-ui="who"]').html('');

		this.engine.element().find('[data-component="text-box"]').removeData('expression');
	}

	_handleCustomClasses(element: HTMLElement | undefined): void {
		if (!element) {
			return;
		}

		// The unread is a special one used by the nvl mode so we ignore that
		Array.from(element.classList)
			.filter(c => c !== 'unread')
			.forEach(cls => element.classList.remove(cls));

		this.classes.forEach(className => element.classList.add(className));
	}

	_setCharacter(id: string, expression: string | undefined): void {
		this.character = this.engine.character(id);

		this.id = id;

		if (typeof this.character.nvl !== 'undefined') {
			this.nvl = this.character.nvl;
		}

		if (typeof expression !== 'undefined') {
			if (typeof this.character.expressions !== 'undefined') {
				this.image = this.character.expressions[expression];
				this.expression = expression;
			}

		} else if (typeof this.character.default_expression !== 'undefined') {
			if (typeof this.character.expressions[this.character.default_expression] !== 'undefined') {
				this.image = this.character.expressions[this.character.default_expression];
			} else {
				this.image = this.character.default_expression;
			}
			this.expression = 'default';
		}
	}

	async displayCenteredDialog(dialog: string, clearDialog: string, character: string, animation: boolean): Promise<void> {
		const element = document.createElement('centered-dialog') as any;
		const gameScreen = this.engine.element().find('[data-screen="game"]');
		const textBox = this.engine.element().find('[data-component="text-box"]');
		const writer = textBox.find('type-writer').get(0) as any;

		this._handleCustomClasses(element);

		// If the text-box's typewriter exists, set it to ignore
		// (in NVL mode, there might not be a type-writer element)
		if (writer) {
			writer.setState({ ignore: true, strings: [] });
		}

		textBox.hide();
		gameScreen.append(element);

		element.ready(() => {
			const wrapper = element.content('wrapper');
			const wrapperElement = wrapper?.get(0) as any;

			if (animation && this.engine.setting('TypeAnimation') === true) {
				this.engine.global('typedConfiguration').strings = [dialog];
				this.engine.global('finished_typing', false);
				if (wrapperElement) {
					wrapperElement.setState({ strings: [dialog] });
				}
			} else {
				wrapper?.html(clearDialog);
				this.engine.global('finished_typing', true);
				this.engine.trigger('didFinishTyping');
			}
		});
	}

	displayNvlDialog(dialog: string, clearDialog: string, character: string, animation: boolean): void {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as any;

		if (!textBox) {
			this.engine.debug.error('Text box component not found');
			return;
		}

		if (textBox.props?.mode !== 'nvl') {
			Dialog.reset();
			textBox.setProps({ mode: 'nvl' });

			// We need to re-apply any custom classes here because the reset clears them
			this._handleCustomClasses(textBox);
		}

		// Remove contents from the dialog area.
		const previous = this.engine.element().find('[data-component="text-box"]').data('speaking');
		this.engine.element().find('[data-component="text-box"]').data('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true && this.engine.setting('TypeAnimation') === true && this.engine.setting('NVLTypeAnimation') === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (character !== '_narrator') {
				const charData = this.engine.character(character);
				if (previous !== character) {
					this.engine.element().find('[data-ui="say"] [data-spoke]').last().addClass('nvl-dialog-footer');
					this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}" class='named'><span style='color:${charData?.color ?? ''};'>${this.engine.replaceVariables(charData?.name ?? '')}: </span><type-writer></type-writer></div>`);
				} else {
					this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}"><type-writer></type-writer></div>`);
				}

			} else {
				if (previous !== character) {
					this.engine.element().find('[data-ui="say"] [data-spoke]').last().addClass('nvl-dialog-footer');
				}
				this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}" class='unnamed'><type-writer></type-writer></div>`);
			}

			const elements = $_('[data-ui="say"] [data-spoke] type-writer');
			const last = elements.last().get(0) as any;

			this.engine.global('typedConfiguration').strings = [dialog];
			this.engine.global('finished_typing', false);

			last.setState({ strings: [dialog] });

		} else {
			if (character !== '_narrator') {
				const charData2 = this.engine.character(character);
				if (previous !== character) {
					this.engine.element().find('[data-ui="say"] [data-spoke]').last().addClass('nvl-dialog-footer');
					this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}" class='named'><span style='color:${charData2?.color ?? ''};'>${this.engine.replaceVariables(charData2?.name ?? '')}: </span><type-writer>${clearDialog}</type-writer></div>`);
				} else {
					this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}"><type-writer>${dialog}</type-writer></div>`);
				}

			} else {
				if (previous !== character) {
					this.engine.element().find('[data-ui="say"] [data-spoke]').last().addClass('nvl-dialog-footer');
				}
				this.engine.element().find('[data-ui="say"]').append(`<div data-spoke="${character}" class='unnamed'><type-writer>${clearDialog}</type-writer></div>`);
			}
			this.engine.global('finished_typing', true);
			this.engine.trigger('didFinishTyping');
		}

		const text_box = this.engine.element().find('[data-component="text-box"]');
		if (text_box.exists()) {
			const element = text_box.get(0) as any;
			if (typeof element.checkUnread === 'function') {
				element.checkUnread();
			}
		}

	}

	async displayDialog(dialog: string, clearDialog: string, character: string, animation: boolean): Promise<void> {
		if (this.nvl === false) {
			const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as any;

			if (!textBox) {
				this.engine.debug.error('Text box component not found');
				return;
			}

			if (textBox.props?.mode === 'nvl' && this._cycle === 'Application' && this.engine.global('_restoring_state') === false) {
				this.engine.history('nvl').push(textBox.content('dialog').html());
			}

			textBox.setProps({ mode: 'adv' });

			// Remove contents from the dialog area.
			this.engine.element().find('[data-ui="say"]').html('');
			this.engine.element().find('[data-component="text-box"]').data('speaking', character);

			// Check if the typing animation flag is set to true in order to show it
			if (animation === true && this.engine.setting('TypeAnimation') === true) {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				this.engine.global('typedConfiguration').strings = [dialog];
				this.engine.global('finished_typing', false);
				const say = this.engine.element().find('[data-ui="say"]');
				const sayElement = say.collection[0] as any;
				if (sayElement) {
					sayElement.setState({ strings: [dialog] });
				}
			} else {
				this.engine.element().find('[data-ui="say"]').html(clearDialog);
				this.engine.global('finished_typing', true);
				this.engine.trigger('didFinishTyping');
			}
		} else {
			this.displayNvlDialog(dialog, clearDialog, character, animation);
		}
	}


	characterDialog(): Promise<void> {
		// Check if the character has a name to show
		if (typeof this.character.name !== 'undefined' && !this.nvl) {
			this.engine.element().find('[data-ui="who"]').html(this.engine.replaceVariables(this.character.name));
		}

		let directory = this.character.directory;

		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		// Focus the character's sprite and colorize it's name with the defined
		// color on its declaration
		this.engine.element().find(`[data-character="${this.id}"]`).addClass('focus');

		if (typeof this.character.color === 'string' && this.character.color !== '') {
			this.engine.element().find('[data-ui="who"]').style('color', this.character.color);
		} else {
			this.engine.element().find('[data-ui="who"]').style('color', 'var(--character-name-color)');
		}
		// Check if an expression or face image was used and if it exists and
		// display it
		if (typeof this.image !== 'undefined' && !this.nvl) {
			const path = `${this.engine.setting('AssetsPath').root}/${this.engine.setting('AssetsPath').characters}/${directory}${this.image}`;
			this.engine.element().find('[data-ui="face"]').attribute('src', path);
			this.engine.element().find('[data-ui="face"]').show();
			this.engine.element().find('[data-component="text-box"]').data('expression', this.expression as string);
		}

		// Check if the character object defines if the type animation should be used.
		if (typeof this.character.type_animation !== 'undefined') {
			return this.displayDialog(this.dialog, this.clearDialog, this.id, this.character.type_animation);
		} else {
			return this.displayDialog(this.dialog, this.clearDialog, this.id, true);
		}
	}

	override async apply({ updateLog = true } = {}): Promise<void> {
		try {
			const dialogLog = this.engine.component('dialog-log') as { instances?: () => { each: (cb: (instance: { write: (data: { id: string; character: string; dialog: string }) => void }) => void) => void } } | undefined;
			if (typeof dialogLog !== 'undefined' && dialogLog.instances) {
				if (this._cycle === 'Application' && updateLog === true) {
					dialogLog.instances().each((instance) => instance.write({
						id: this.id,
						character: this.character,
						dialog: this.clearDialog
					}));
				}
			}
		} catch (e) {
			this.engine.debug.error(e);
		}

		if (typeof this.character !== 'undefined') {
			this._handleCustomClasses(this.engine.element().find('[data-component="text-box"]').get(0));
			(this.engine.element().find('[data-component="text-box"]').get(0) as any).show();
			return this.characterDialog();
		} else if (this.id === 'centered') {
			return this.displayCenteredDialog(this.dialog, this.clearDialog, this.id, this.engine.setting('CenteredTypeAnimation'));
		} else {
			this._handleCustomClasses(this.engine.element().find('[data-component="text-box"]').get(0));
			(this.engine.element().find('[data-component="text-box"]').get(0) as any).show();
			return this.displayDialog(this.dialog, this.clearDialog, '_narrator', this.engine.setting('NarratorTypeAnimation'));
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		this.engine.global('_dialog_pending_revert', true);
		return { advance: false };
	}

	override async willRevert(): Promise<void> {
		this.engine.element().find('[data-character]').removeClass('focus');
		this.engine.element().find('[data-ui="face"]').hide();
		this.engine.element().find('[data-ui="who"]').html('');
	}

	override async revert(): Promise<void> {
		// Check if the dialog to replay is a NVL one or not
		if (this.nvl === true) {
			//  Check if the NVL screen is currently being shown
			const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as any;
			this._handleCustomClasses(textBox);

			if (textBox.props.mode === 'nvl') {
				if (this.engine.global('_should_restore_nvl') === true) {
					this.engine.global('_should_restore_nvl', false);
					if (this.engine.history('nvl').length > 0) {
						textBox.content('dialog').html(this.engine.history('nvl').pop());
						return;
					}
					throw new Error('No more dialogs on history from where to recover previous state.');
				}

				// Find all dialog entries and remove the last one
				const dialogs = this.engine.element().find('[data-ui="say"] [data-spoke]');
				// If it is being shown, then to go back, we need to remove the last dialog from it
				dialogs.last().remove();
				return;
			} else {
				// If it is not shown right now, then we need to recover the dialogs
				// that were being shown the last time we hid it
				if (this.engine.history('nvl').length > 0) {
					if (this.engine.global('_should_restore_nvl') === true) {
						this.engine.global('_should_restore_nvl', false);
					}
					textBox.setProps({ mode: 'nvl' });
					textBox.content('dialog').html(this.engine.history('nvl').pop());
					return;
				}
				throw new Error('No more dialogs on history from where to recover previous state.');
			}
		} else {
			// If the dialog was not NVL, we can simply show it as if we were
			// doing a simple application
			await this.apply();
			await this.didApply();
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: false, step: true };
	}

}

export default Dialog;