import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import Typed from 'typed.js';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

	static canProceed () {
		if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {
			const str = Monogatari.global ('textObject').strings [0];
			const element = $_(Monogatari.global ('textObject').el).data ('ui');

			if (element !== 'centered') {
				Monogatari.global ('textObject').destroy ();
				$_(`${Monogatari.selector} [data-ui="say"]`).html (str);
				Monogatari.global ('finishedTyping', true);
			}

			return Promise.reject ();
		}
		return Promise.resolve (Monogatari.global ('finishedTyping'));
	}

	static setup () {
		Monogatari.globals ({
			textObject: null,
			finishedTyping: true,
			typedConfiguration: {
				strings: [],
				typeSpeed: Monogatari.preference ('TextSpeed'),
				fadeOut: true,
				loop: false,
				showCursor: false,
				contentType: 'html',
				preStringTyped: () => {
					Monogatari.global ('finishedTyping', false);
				},
				onStringTyped: () => {
					Monogatari.global ('finishedTyping', true);
				},
				onDestroy () {
					Monogatari.global ('finishedTyping', true);
				}
			}
		});
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector} [data-action="set-text-speed"]`).on ('change mouseover', function () {
			const value =  Monogatari.setting ('maxTextSpeed') - parseInt($_(this).value());
			Monogatari.global ('typedConfiguration').typeSpeed = value;
			Monogatari.preference ('TextSpeed', value);
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Remove the Text Speed setting if the type animation was disabled
		if (Monogatari.setting ('TypeAnimation') === false) {
			$_(`${selector} [data-settings="text-speed"]`).hide ();
		}

		Monogatari.setting ('maxTextSpeed', parseInt ($_(`${selector} [data-action="set-text-speed"]`).property ('max')));


		document.querySelector('[data-action="set-text-speed"]').value = Monogatari.preference ('TextSpeed');

		return Promise.resolve ();
	}

	static reset () {
		if (Monogatari.global ('textObject') !== null) {
			Monogatari.global ('textObject').destroy ();
		}
		$_(`${Monogatari.selector} [data-ui="who"]`).html ('');
		$_(`${Monogatari.selector} [data-ui="say"]`).html ('');
		return Promise.resolve ();
	}

	static matchString () {
		return true;
	}

	constructor ([ character, ...dialog ]) {
		super ();

		const [ id, expression ] = character.split (':');

		if (typeof Monogatari.character (id) !== 'undefined') {
			this.character = Monogatari.character (id);
			this.id = id;
			this.dialog = dialog.join (' ');

			if (typeof expression !== 'undefined') {
				if (typeof this.character.Side !== 'undefined') {
					if (typeof this.character.Directory !== 'undefined') {
						this.image = `${this.character.directory}/${this.character.Side[expression]}`;
					} else {
						this.image = this.character.Side[expression];
					}
				}

			} else if (typeof this.character.Face !== 'undefined') {
				if (typeof this.character.Directory !== 'undefined') {
					this.image = `${this.character.directory}/${this.character.Face}`;
				} else {
					this.image = this.character.Face;
				}
			}
		} else {
			this.id = 'narrator';
			this.dialog = [ character, ...dialog ].join (' ');
		}

	}

	willApply () {
		$_(`${Monogatari.selector} [data-character]`).removeClass ('focus');
		$_(`${Monogatari.selector} [data-ui="face"]`).hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		return Promise.resolve ();
	}

	displayDialog (dialog, character, animation) {

		// Destroy the previous textObject so the text is rewritten.
		// If not destroyed, the text would be appended instead of replaced.
		if (Monogatari.global ('textObject') !== null) {
			Monogatari.global ('textObject').destroy ();
		}

		// Remove contents from the dialog area.
		$_(`${Monogatari.selector} [data-ui="say"]`).html ('');
		$_(`${Monogatari.selector} [data-ui="say"]`).data ('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (Monogatari.setting ('TypeAnimation') === true) {
				Monogatari.global ('typedConfiguration').strings = [dialog];
				Monogatari.global ('textObject', new Typed ('[data-ui="say"]', Monogatari.global ('typedConfiguration')));
			} else {
				$_(`${Monogatari.selector} [data-ui="say"]`).html (dialog);
				if (Monogatari.global ('autoPlay') !== null) {
					Monogatari.global ('autoPlay', setTimeout (() => {
						if (Monogatari.canProceed () && Monogatari.global ('finishedTyping')) {
							Monogatari.next ();
						}
					}, Monogatari.preference ('AutoPlaySpeed') * 1000));
				}
				Monogatari.global ('finishedTyping', true);
			}
		} else {
			$_(`${Monogatari.selector} [data-ui="say"]`).html (dialog);
			if (Monogatari.global ('autoPlay') !== null) {
				Monogatari.global ('autoPlay', setTimeout (() => {
					if (Monogatari.canProceed() && Monogatari.global ('finishedTyping')) {
						Monogatari.next ();
					}
				}, Monogatari.preference ('AutoPlaySpeed') * 1000));
			}
			Monogatari.global ('finishedTyping', true);
		}

		return Promise.resolve ();
	}

	narratorDialog () {
		return this.displayDialog (this.dialog, 'narrator', Monogatari.setting ('NarratorTypeAnimation'));
	}

	characterDialog () {
		if (typeof this.character.Name !== 'undefined') {
			$_(`${Monogatari.selector} [data-ui="who"]`).html (Monogatari.replaceVariables (this.character.Name));
		}

		$_(`${Monogatari.selector} [data-character="${this.id}"]`).addClass ('focus');
		$_(`${Monogatari.selector} [data-ui="who"]`).style ('color', this.character.Color);

		if (typeof this.image !== 'undefined') {
			$_(`${Monogatari.selector} [data-ui="face"]`).attribute ('src', 'img/characters/' + this.image);
			$_(`${Monogatari.selector} [data-ui="face"]`).show ();
		}

		// Check if the character object defines if the type animation should be used.
		if (typeof this.character.TypeAnimation !== 'undefined') {
			return this.displayDialog (this.dialog, this.id, this.character.TypeAnimation);
		} else {
			return this.displayDialog (this.dialog, this.id, true);
		}
	}

	apply () {
		if (typeof this.character !== 'undefined') {
			return this.characterDialog ();
		} else {
			return this.narratorDialog ();
		}
	}

	revert () {
		return this.apply ();
	}

}

Dialog.id = 'Dialog';

Monogatari.registerAction (Dialog);