import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import Typed from 'typed.js';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

	static shouldProceed () {

		// Check if the type animation has finished and the Typed object still exists
		if (!this.engine.global ('finished_typing') && this.engine.global ('textObject') !== null) {

			// Get the string it was typing
			const str = this.engine.global ('textObject').strings [0];

			// Get the element it was typing to
			const element = this.engine.global ('textObject').el;

			this.engine.global ('textObject').destroy ();

			element.innerHTML = str;

			this.engine.global ('finished_typing', true);

			return Promise.reject ('TypeWriter effect has not finished.');
		}

		return Promise.resolve (this.engine.global ('finished_typing'));
	}

	static willProceed () {
		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]');
		if (centeredDialog.isVisible ()) {
			centeredDialog.remove ();
		}
		return Promise.resolve (this.engine.global ('finished_typing'));
	}

	static willRollback () {
		if (this.engine.global ('textObject') !== null) {
			this.engine.global ('textObject').destroy ();
		}

		this.engine.global ('finished_typing', true);
		this.engine.global ('_CurrentChoice', null);
		this.engine.element ().find ('[data-component="text-box"]').show ('flex');

		const dialogLog = this.engine.component ('dialog-log');

		const centeredDialog = this.engine.element ().find ('[data-component="centered-dialog"]');
		if (centeredDialog.isVisible ()) {
			centeredDialog.remove ();
			this.engine.element ().find ('[data-component="text-box"]').show ('flex');
		}

		document.querySelector ('[data-ui="who"]').innerHTML = '';

		if (typeof dialogLog !== 'undefined') {
			dialogLog.instances (instance => instance.pop ());
		}
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.globals ({
			textObject: null,
			finished_typing: true,
			typedConfiguration: {
				strings: [],
				typeSpeed: Monogatari.preference ('TextSpeed'),
				fadeOut: true,
				loop: false,
				showCursor: false,
				contentType: 'html',
				preStringTyped: () => {
					Monogatari.global ('finished_typing', false);
				},
				onStringTyped: () => {
					Monogatari.global ('finished_typing', true);
				},
				onDestroy () {
					Monogatari.global ('finished_typing', true);
				}
			}
		});

		// The NVL mode has its own history so that when going back, all dialogs
		// that were shown on screen can be shown again instead of just showing
		// the last one.
		Monogatari.history ('nvl');

		return Promise.resolve ();
	}

	static bind (selector) {
		const self = this;

		// Add listener for the text speed setting
		$_(`${selector} [data-action="set-text-speed"]`).on ('change mouseover', function () {
			const value =  this.engine.setting ('maxTextSpeed') - parseInt(this.value);
			self.global ('typedConfiguration').typeSpeed = value;
			self.preference ('TextSpeed', value);
		});

		// Detect scroll on the text element to remove the unread class used when
		// there's text not being shown in NVL mode.
		$_(`${selector} [data-component="text-box"]`).on ('scroll', () => {
			this.engine.element ().find ('[data-component="text-box"]').removeClass ('unread');
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Remove the Text Speed setting if the type animation was disabled
		if (this.engine.setting ('TypeAnimation') === false) {
			$_(`${selector} [data-settings="text-speed"]`).hide ();
		}

		this.engine.setting ('maxTextSpeed', parseInt ($_(`${selector} [data-action="set-text-speed"]`).property ('max')));


		//document.querySelector('[data-action="set-text-speed"]').value = this.engine.preference ('TextSpeed');

		return Promise.resolve ();
	}

	static reset ({ keepNVL = false } = {}) {

		if (this.engine.global ('textObject') !== null) {
			this.engine.global ('textObject').destroy ();
		}

		if (keepNVL !== true) {
			this.engine.element ().find ('[data-component="text-box"]').removeClass ('nvl');
		}

		this.engine.element ().find ('[data-component="text-box"]').data ('speaking', '');

		this.engine.element ().find ('[data-ui="who"]').style ('color', '');

		this.engine.element ().find ('[data-ui="who"]').html ('');
		this.engine.element ().find ('[data-ui="say"]').html ('');

		return Promise.resolve ();
	}

	static matchString () {
		return true;
	}

	constructor ([ character, ...dialog ]) {
		super ();

		const [ id, expression ] = character.split (':');

		this.dialog = dialog.join (' ');

		this.nvl = false;

		if (typeof Monogatari.character (id) !== 'undefined') {
			this.character = Monogatari.character (id);
			this.id = id;

			if (typeof this.character.nvl !== 'undefined') {
				this.nvl = this.character.nvl;
			}

			if (typeof expression !== 'undefined') {
				if (typeof this.character.expressions !== 'undefined') {
					this.image = this.character.expressions[expression];
				}

			} else if (typeof this.character.default_expression !== 'undefined') {
				this.image = this.character.default_expression;
			}
		} else if (id === 'centered') {
			this.id = 'centered';
		} else {
			this.id = 'narrator';
			if (id === 'nvl') {
				this.nvl = true;
			} else {
				this.dialog = `${character} ${this.dialog}`;
			}
		}
	}

	willApply () {
		this.engine.element ().find ('[data-character]').removeClass ('focus');
		this.engine.element ().find ('[data-ui="face"]').hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		return Promise.resolve ();
	}

	displayCenteredDialog (dialog, character, animation) {
		const element = document.createElement ('centered-dialog');
		this.engine.element ().find ('[data-component="text-box"]').hide ();
		this.engine.element ().find ('[data-screen="game"]').append (element);

		element.ready (() => {
			if (animation) {
				this.engine.global ('typedConfiguration').strings = [dialog];
				this.engine.global ('textObject', new Typed (element.content ('wrapper').get (0), this.engine.global ('typedConfiguration')));
			} else {
				element.content ('wrapper').html (dialog);
			}
		});

		return Promise.resolve ();
	}

	displayNvlDialog (dialog, character, animation) {
		if (!this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
			Dialog.reset ();
			this.engine.element ().find ('[data-component="text-box"]').addClass ('nvl');
		}

		// Remove contents from the dialog area.
		const previous = this.engine.element ().find ('[data-component="text-box"]').data ('speaking');
		this.engine.element ().find ('[data-component="text-box"]').data ('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true && this.engine.setting ('TypeAnimation') === true && this.engine.setting ('NVLTypeAnimation') === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (character !== 'narrator') {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${this.engine.character (character).color};'>${this.engine.replaceVariables (this.engine.character (character).name)}: </span><p></p></div>`);
				} else {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><p></p></div>`);
				}

			} else {
				this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><p></p></div>`);
			}

			const elements = $_('[data-ui="say"] [data-spoke] p');
			const last = elements.last ().get (0);

			this.engine.global ('typedConfiguration').strings = [dialog];
			this.engine.global ('textObject', new Typed (last, this.engine.global ('typedConfiguration')));

		} else {
			if (character !== 'narrator') {
				if (previous !== character) {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${this.engine.character (character).color};'>${this.engine.replaceVariables (this.engine.character (character).name)}: </span><p>${dialog}</p></div>`);
				} else {
					this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><p>${dialog}</p></div>`);
				}

			} else {
				this.engine.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><p>${dialog}</p></div>`);
			}
			this.engine.global ('finished_typing', true);
		}
	}

	displayDialog (dialog, character, animation) {
		if (this.nvl === false) {
			if (this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl') && this._cycle === 'Application') {
				this.engine.history ('nvl').push (this.engine.element ().find ('text-box [data-ui="say"]').html ());
			}
			this.engine.element ().find ('[data-component="text-box"]').removeClass ('nvl');

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
				this.engine.global ('textObject', new Typed ('[data-ui="say"]', this.engine.global ('typedConfiguration')));
			} else {
				this.engine.element ().find ('[data-ui="say"]').html (dialog);
				this.engine.global ('finished_typing', true);
			}
		} else {
			this.displayNvlDialog (dialog, character, animation);
		}

		return Promise.resolve ();
	}


	characterDialog () {
		// Check if the character has a name to show
		if (typeof this.character.name !== 'undefined' && !this.nvl) {
			Monogatari.element ().find ('[data-ui="who"]').html (Monogatari.replaceVariables (this.character.name));
		}

		let directory = this.character.directory;

		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		// Focus the character's sprite and colorize it's name with the defined
		// color on its declaration
		Monogatari.element ().find (`[data-character="${this.id}"]`).addClass ('focus');
		Monogatari.element ().find ('[data-ui="who"]').style ('color', this.character.color);

		// Check if an expression or face image was used and if it exists and
		// display it
		if (typeof this.image !== 'undefined' && !this.nvl) {
			`${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}`;
			Monogatari.element ().find ('[data-ui="face"]').attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}`);
			Monogatari.element ().find ('[data-ui="face"]').show ();
		}

		// Check if the character object defines if the type animation should be used.
		if (typeof this.character.type_animation !== 'undefined') {
			return this.displayDialog (this.dialog, this.id, this.character.type_animation);
		} else {
			return this.displayDialog (this.dialog, this.id, true);
		}
	}

	apply () {
		try {
			const dialogLog = Monogatari.component ('dialog-log');
			if (typeof dialogLog !== 'undefined') {
				if (this._cycle === 'Application') {
					dialogLog.instances (instance => instance.write ({
						id: this.id,
						character: this.character,
						dialog: this.dialog
					}));
				} else {
					dialogLog.instances (instance => instance.pop ());
				}
			}
		} catch (e) {
			this.engine.debug.error (e);
		}

		if (typeof this.character !== 'undefined') {
			this.engine.element ().find ('[data-component="text-box"]').show ('flex');
			return this.characterDialog ();
		} else if (this.id === 'centered') {
			return this.displayCenteredDialog (this.dialog, this.id, this.engine.setting ('CenteredTypeAnimation'));
		} else {
			this.engine.element ().find ('[data-component="text-box"]').show ('flex');
			return this.displayDialog (this.dialog, 'narrator', this.engine.setting ('NarratorTypeAnimation'));
		}
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
			if (Monogatari.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
				// If it is being shown, then to go back, we need to remove the last dialog from it
				Monogatari.element ().find ('text-box [data-ui="say"] [data-spoke]').last ().remove ();
				return Promise.resolve ();
			} else {
				// If it is not shown right now, then we need to recover the dialogs
				// that were being shown the last time we hid it
				if (Monogatari.history ('nvl').length > 0) {
					Monogatari.element ().find ('[data-component="text-box"]').addClass ('nvl');
					Monogatari.element ().find ('text-box [data-ui="say"]').html (Monogatari.history ('nvl').pop ());
					return Promise.resolve ();
				}
				return Promise.reject ('No more dialogs on history from where to recover previous state.');
			}
		} else {
			// If the dialog was not NVL, we can simply show it as if we were
			// doing a simple application
			return this.apply ();
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}

}

Dialog.id = 'Dialog';

Monogatari.registerAction (Dialog, true);