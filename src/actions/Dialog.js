import { Action } from './../lib/Action';
// import Typed from './../lib/MonoTyped';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

	static shouldProceed () {
		// Check if the type animation has finished and the Typed object still exists
		let component = this.engine.element ().find ('type-writer').get (0);
		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]');

		if (centeredDialog.exists ()) {
			component = centeredDialog.find ('[data-content="wrapper"]').get (0);
		}

		// In NVL mode, there might not be a type-writer element in the text-box
		if (!component) {
			return Promise.resolve (this.engine.global ('finished_typing'));
		}

		if (!this.engine.global ('finished_typing') && component.state.strings.length) {
			this.engine.stopTyping (component);

			return Promise.reject ('TypeWriter effect has not finished.');
		}

		return Promise.resolve (this.engine.global ('finished_typing'));
	}

	static willProceed () {
		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]');
		if (centeredDialog.exists ()) {
			centeredDialog.remove ();
		}

		this.engine.global ('_dialog_pending_revert', false);

		return Promise.resolve (this.engine.global ('finished_typing'));
	}

	static willRollback () {
		const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);
		if (this.engine.global ('textObject') !== null && textBox.props.mode !== 'nvl') {
			this.engine.global ('textObject').destroy ();
		}

		this.engine.global ('finished_typing', true);

		// this.engine.global ('_CurrentChoice');

		this.engine.element ().find ('[data-component="text-box"]').get (0).show ();

		const dialogLog = this.engine.component ('dialog-log');

		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]');
		if (centeredDialog.isVisible ()) {
			centeredDialog.remove ();
			this.engine.element ().find ('[data-component="text-box"]').get (0).show ();
		}

		document.querySelector ('[data-ui="who"]').innerHTML = '';

		if (typeof dialogLog !== 'undefined' && this.engine.global ('_dialog_pending_revert') === true) {
			dialogLog.instances (instance => instance.pop ());
			this.engine.global ('_dialog_pending_revert', false);
		}
		return Promise.resolve ();
	}

	static setup () {
		this.engine.globals ({
			textObject: null,
			finished_typing: false,
			typedConfiguration: {
				strings: [],
				typeSpeed: this.engine.preference ('TextSpeed'),
				loop: 0, // Set to true for infinite looping.
				showCursor: false,
				hideCursorOnEnd: false, // If the cursor is being shown, hide it once the text ends.
				preStringTyped: () => {
					this.engine.global ('finished_typing', false);
					this.engine.trigger ('didStartTyping');
				},
				onStringTyped: () => {
					this.engine.global ('finished_typing', true);
					this.engine.trigger ('didFinishTyping');
				},
				onDestroy: () => {
					this.engine.global ('finished_typing', true);
				}
			},
			_dialog_pending_revert: false,
		});

		// The NVL mode has its own history so that when going back, all dialogs
		// that were shown on screen can be shown again instead of just showing
		// the last one.
		this.engine.history ('nvl');

		return Promise.resolve ();
	}

	static bind (selector) {
		const self = this;

		// Add listener for the text speed setting
		$_(`${selector} [data-action="set-text-speed"]`).on ('change mouseover', function () {
			const value =  self.engine.setting ('maxTextSpeed') - parseInt(this.value);
			self.engine.global ('typedConfiguration').typeSpeed = value;
			self.engine.preference ('TextSpeed', value);
		});

		// Detect scroll on the text element to remove the unread class used when
		// there's text not being shown in NVL mode.
		$_(`${selector} [data-component="text-box"] [data-content="text"]`).on ('scroll', () => {
			const text_box = this.engine.element ().find ('[data-component="text-box"]');
			if (text_box.exists ()) {
				if (typeof text_box.get (0).checkUnread === 'function') {
					text_box.get (0).checkUnread ();
				}
			}
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Remove the Text Speed setting if the type animation was disabled
		if (this.engine.setting ('TypeAnimation') === false) {
			$_(`${selector} [data-settings="text-speed"]`).hide ();
		}

		this.engine.setting ('maxTextSpeed', parseInt ($_(`${selector} [data-action="set-text-speed"]`).property ('max')));

		return Promise.resolve ();
	}

	static reset ({ keepNVL = false, saveNVL = false } = {}) {
		const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);

		if (saveNVL === true && textBox.props.mode === 'nvl') {
			this.engine.history ('nvl').push (textBox.content ('dialog').html ());
		}

		if (keepNVL !== true) {
			textBox.setProps ({ mode: 'adv' });
		}

		if (this.engine.global ('textObject') !== null) {
			this.engine.global ('textObject').destroy ();
		}

		this.engine.element ().find ('[data-component="text-box"]').data ('speaking', '');

		this.engine.element ().find ('[data-ui="who"]').style ('color', '');

		this.engine.element ().find ('[data-ui="who"]').html ('');
		this.engine.element ().find ('[data-ui="say"]').html ('');

		this.engine.element ().find ('[data-ui="face"]').attribute ('src', '');
		this.engine.element ().find ('[data-ui="face"]').hide ();

		// Remove all classes from the text-box
		Array.from (textBox.classList).forEach (c => textBox.classList.remove (c));

		// Remove all classes from the centered-dialog
		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]').get (0);

		if (centeredDialog) {
			Array.from (centeredDialog.classList).forEach (c => centeredDialog.classList.remove (c));
		}

		return Promise.resolve ();
	}

	static matchString () {
		return true;
	}

	constructor ([ character, ...dialog ]) {
		super ();

		// id:expression:class Dialog
		const [id, expression, classes] = character.split (':');

		this.dialog = dialog.join (' ');
		this.clearDialog = this.dialog.replace (/\{pause:(\d+)\}/g, '').replace (/\{speed:(\d+)\}/g, '');

		this.nvl = false;
		
		this.classes = (classes && classes.trim() !== '') ? classes.split ('|') : [];

		if (typeof this.engine.character (id) !== 'undefined') {
			this._setCharacter (id, expression);
		} else if (id === 'centered') {
			this.id = 'centered';
		} else {
			this.id = '_narrator';

			if (typeof this.engine.character ('_narrator') !== 'undefined') {
				this._setCharacter ('_narrator', expression);
			}

			if (id === 'nvl') {
				this.nvl = true;
			} else {
				this.dialog = `${character} ${this.dialog}`;
				this.clearDialog = `${character} ${this.clearDialog}`;
			}
		}
	}

	willApply () {
		this.engine.element ().find ('[data-character]').removeClass ('focus');
		this.engine.element ().find ('[data-ui="face"]').hide ();

		document.querySelector ('[data-ui="who"]').innerHTML = '';

		this.engine.element ().find ('[data-component="text-box"]').removeData ('expression');

		return Promise.resolve ();
	}

	_handleCustomClasses (element) {
		if (!element) {
			return;
		}
			
		// The unread is a special one used by the nvl mode so we ignore that
		Array.from (element.classList)
			.filter (c => c !== 'unread')
			.forEach (cls => element.classList.remove (cls));

		this.classes.forEach (className => element.classList.add (className));
	}

	_setCharacter (id, expression) {
		this.character = this.engine.character (id);

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

	displayCenteredDialog (dialog, clearDialog, character, animation) {
		const element = document.createElement ('centered-dialog');
		const gameScreen = this.engine.element ().find ('[data-screen="game"]');
		const textBox = this.engine.element ().find ('[data-component="text-box"]');
		const writer = textBox.find ('type-writer').get (0);

		this._handleCustomClasses (element);

		// If the text-box's typewriter exists, set it to ignore
		// (in NVL mode, there might not be a type-writer element)
		if (writer) {
			writer.setState ({ ignore: true, strings: [] });
		}

		textBox.hide ();
		gameScreen.append (element);

		element.ready (() => {
			if (animation && this.engine.setting ('TypeAnimation') === true) {
				this.engine.global ('typedConfiguration').strings = [dialog];
				this.engine.global ('finished_typing', false);
				element.content ('wrapper').get (0).setState ({ strings: [dialog] });
			} else {
				element.content ('wrapper').html (clearDialog);
				this.engine.global ('finished_typing', true);
				this.engine.trigger ('didFinishTyping');
			}
		});

		return Promise.resolve ();
	}

	displayNvlDialog (dialog, clearDialog, character, animation) {
		const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);

		if (textBox.props.mode !== 'nvl') {
			Dialog.reset ();
			textBox.setProps ({ mode: 'nvl' });

			// We need to re-apply any custom classes here because the reset clears them
			this._handleCustomClasses (textBox);
		}

		// Remove contents from the dialog area.
		const previous = this.engine.element ().find ('[data-component="text-box"]').data ('speaking');
		this.engine.element ().find ('[data-component="text-box"]').data ('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true && this.engine.setting ('TypeAnimation') === true && this.engine.setting ('NVLTypeAnimation') === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (character !== '_narrator') {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"] [data-spoke]').last().addClass ('nvl-dialog-footer');
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${this.engine.character (character).color};'>${this.engine.replaceVariables (this.engine.character (character).name)}: </span><type-writer></type-writer></div>`);
				} else {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><type-writer></type-writer></div>`);
				}

			} else {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"] [data-spoke]').last().addClass ('nvl-dialog-footer');
				}
				this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><type-writer></type-writer></div>`);
			}

			const elements = $_('[data-ui="say"] [data-spoke] type-writer');
			const last = elements.last ().get (0);

			this.engine.global ('typedConfiguration').strings = [dialog];
			this.engine.global ('finished_typing', false);

			last.setState({ strings: [dialog] });

		} else {
			if (character !== '_narrator') {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"] [data-spoke]').last().addClass ('nvl-dialog-footer');
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${this.engine.character (character).color};'>${this.engine.replaceVariables (this.engine.character (character).name)}: </span><type-writer>${clearDialog}</type-writer></div>`);
				} else {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><type-writer>${dialog}</type-writer></div>`);
				}

			} else {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"] [data-spoke]').last().addClass ('nvl-dialog-footer');
				}
				this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><type-writer>${clearDialog}</type-writer></div>`);
			}
			this.engine.global ('finished_typing', true);
			this.engine.trigger ('didFinishTyping');
		}

		const text_box = this.engine.element ().find ('[data-component="text-box"]');
		if (text_box.exists ()) {
			if (typeof text_box.get (0).checkUnread === 'function') {
				text_box.get (0).checkUnread ();
			}
		}

	}

	displayDialog (dialog, clearDialog, character, animation) {
		if (this.nvl === false) {
			const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);

			if (textBox.props.mode === 'nvl' && this._cycle === 'Application' && this.engine.global ('_restoring_state') === false) {
				this.engine.history ('nvl').push (textBox.content ('dialog').html ());
			}

			textBox.setProps ({ mode: 'adv' });

			// Destroy the previous textObject so the text is rewritten.
			// If not destroyed, the text would be appended instead of replaced.
			if (this.engine.global ('textObject') !== null) {
				this.engine.global ('textObject').destroy ();
			}

			// Remove contents from the dialog area.
			this.engine.element ().find ('[data-ui="say"]').html ('');
			this.engine.element ().find ('[data-component="text-box"]').data ('speaking', character);

			// Check if the typing animation flag is set to true in order to show it
			if (animation === true && this.engine.setting ('TypeAnimation') === true) {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				this.engine.global ('typedConfiguration').strings = [dialog];
				this.engine.global ('finished_typing', false);
				this.engine.element ().find ('[data-ui="say"]').collection[0].setState({ strings: [dialog] });
			} else {
				this.engine.element ().find ('[data-ui="say"]').html (clearDialog);
				this.engine.global ('finished_typing', true);
				this.engine.trigger ('didFinishTyping');
			}
		} else {
			this.displayNvlDialog (dialog, clearDialog, character, animation);
		}

		return Promise.resolve ();
	}


	characterDialog () {
		// Check if the character has a name to show
		if (typeof this.character.name !== 'undefined' && !this.nvl) {
			this.engine.element ().find ('[data-ui="who"]').html (this.engine.replaceVariables (this.character.name));
		}

		let directory = this.character.directory;

		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		// Focus the character's sprite and colorize it's name with the defined
		// color on its declaration
		this.engine.element ().find (`[data-character="${this.id}"]`).addClass ('focus');

		if (typeof this.character.color === 'string' && this.character.color !== '') {
			this.engine.element ().find ('[data-ui="who"]').style ('color', this.character.color);
		} else {
			this.engine.element ().find ('[data-ui="who"]').style ('color', 'var(--character-name-color)');
		}
		// Check if an expression or face image was used and if it exists and
		// display it
		if (typeof this.image !== 'undefined' && !this.nvl) {
			`${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').characters}/${directory}${this.image}`;
			this.engine.element ().find ('[data-ui="face"]').attribute ('src', `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').characters}/${directory}${this.image}`);
			this.engine.element ().find ('[data-ui="face"]').show ();
			this.engine.element ().find ('[data-component="text-box"]').data ('expression', this.expression);
		}

		// Check if the character object defines if the type animation should be used.
		if (typeof this.character.type_animation !== 'undefined') {
			return this.displayDialog (this.dialog, this.clearDialog, this.id, this.character.type_animation);
		} else {
			return this.displayDialog (this.dialog, this.clearDialog, this.id, true);
		}
	}

	apply ({ updateLog = true } = {}) {
		try {
			const dialogLog = this.engine.component ('dialog-log');
			if (typeof dialogLog !== 'undefined') {
				if (this._cycle === 'Application' && updateLog === true) {
					dialogLog.instances (instance => instance.write ({
						id: this.id,
						character: this.character,
						dialog: this.clearDialog
					}));
				}
			}
		} catch (e) {
			this.engine.debug.error (e);
		}

		if (typeof this.character !== 'undefined') {
			this._handleCustomClasses (this.engine.element ().find ('[data-component="text-box"]').get (0));
			this.engine.element ().find ('[data-component="text-box"]').get (0).show ();
			return this.characterDialog ();
		} else if (this.id === 'centered') {
			return this.displayCenteredDialog (this.dialog, this.clearDialog, this.id, this.engine.setting ('CenteredTypeAnimation'));
		} else {
			this._handleCustomClasses (this.engine.element ().find ('[data-component="text-box"]').get (0));
			this.engine.element ().find ('[data-component="text-box"]').get (0).show ();
			return this.displayDialog (this.dialog, this.clearDialog, '_narrator', this.engine.setting ('NarratorTypeAnimation'));
		}
	}

	didApply () {
		this.engine.global ('_dialog_pending_revert', true);
		return Promise.resolve ({ advance: false });
	}

	willRevert () {
		this.engine.element ().find ('[data-character]').removeClass ('focus');
		this.engine.element ().find ('[data-ui="face"]').hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		
		return Promise.resolve ();
	}

	revert () {
		// Check if the dialog to replay is a NVL one or not
		if (this.nvl === true) {
			//  Check if the NVL screen is currently being shown
			const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);
			this._handleCustomClasses (textBox);

			if (textBox.props.mode === 'nvl') {
				if (this.engine.global ('_should_restore_nvl') === true) {
					this.engine.global ('_should_restore_nvl', false);
					if (this.engine.history ('nvl').length > 0) {
						textBox.content ('dialog').html (this.engine.history ('nvl').pop ());
						return Promise.resolve ();
					}
					return Promise.reject ('No more dialogs on history from where to recover previous state.');
				}

				// Find all dialog entries and remove the last one
				const dialogs = this.engine.element ().find ('[data-ui="say"] [data-spoke]');
				// If it is being shown, then to go back, we need to remove the last dialog from it
				dialogs.last ().remove ();
				return Promise.resolve ();
			} else {
				// If it is not shown right now, then we need to recover the dialogs
				// that were being shown the last time we hid it
				if (this.engine.history ('nvl').length > 0) {
					if (this.engine.global ('_should_restore_nvl') === true) {
						this.engine.global ('_should_restore_nvl', false);
					}
					textBox.setProps ({ mode: 'nvl' });
					textBox.content ('dialog').html (this.engine.history ('nvl').pop ());
					return Promise.resolve ();
				}
				return Promise.reject ('No more dialogs on history from where to recover previous state.');
			}
		} else {
			// If the dialog was not NVL, we can simply show it as if we were
			// doing a simple application
			return this.apply ().then (() => {
				return this.didApply ();
			});
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}

}

Dialog.id = 'Dialog';

export default Dialog;