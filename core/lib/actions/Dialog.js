import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import Typed from 'typed.js';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

	static canProceed () {

		// Check if the type animation has finished and the Typed object still exists
		if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {
			// Get the string it was typing
			const str = Monogatari.global ('textObject').strings [0];

			// Get the element it was typing to
			const element = $_(Monogatari.global ('textObject').el).data ('ui');

			if (element !== 'centered' && !$_('[data-ui="text"]').hasClass ('nvl')) {
				Monogatari.global ('textObject').destroy ();
				$_(`${Monogatari.selector} [data-ui="say"]`).html (str);
				Monogatari.global ('finishedTyping', true);
			} else if ($_('[data-ui="text"]').hasClass ('nvl')) {
				Monogatari.global ('textObject').destroy ();
				$_(`${Monogatari.selector} [data-ui="say"]:last-child`).html (str);
				Monogatari.global ('finishedTyping', true);
			}

			return Promise.reject ();
		}
		return Promise.resolve (Monogatari.global ('finishedTyping'));
	}

	static checkUnread () {
		const height = $_(`${Monogatari.selector} [data-ui="text"]`).get (0).clientHeight;
		const scrollHeight = $_(`${Monogatari.selector} [data-ui="text"]`).get (0).scrollHeight;
		if (height < scrollHeight) {
			$_(`${Monogatari.selector} [data-ui="text"]`).addClass ('unread');
		} else {
			$_(`${Monogatari.selector} [data-ui="text"]`).removeClass ('unread');
		}
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

		$_(`${selector} [data-ui="text"]`).on ('scroll', () => {
			$_(`${Monogatari.selector} [data-ui="text"]`).removeClass ('unread');
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

			if (typeof this.character.nvl !== 'undefined') {
				this.nvl = this.character.nvl;
			} else {
				this.nvl = false;
			}

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
			if (id === 'nvl') {
				this.nvl = true;
				this.dialog = dialog.join (' ');
			} else {
				this.dialog = [ character, ...dialog ].join (' ');
			}
		}
	}

	willApply () {
		$_(`${Monogatari.selector} [data-character]`).removeClass ('focus');
		$_(`${Monogatari.selector} [data-ui="face"]`).hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		return Promise.resolve ();
	}

	displayDialog (dialog, character, animation) {

		if (this.nvl === false) {
			$_(`${Monogatari.selector} [data-ui="text"]`).removeClass ('nvl');

			// Destroy the previous textObject so the text is rewritten.
			// If not destroyed, the text would be appended instead of replaced.
			if (Monogatari.global ('textObject') !== null) {
				Monogatari.global ('textObject').destroy ();
			}

			// Remove contents from the dialog area.
			$_(`${Monogatari.selector} [data-ui="say"]`).html ('');
			$_(`${Monogatari.selector} [data-ui="text"]`).data ('speaking', character);

			// Check if the typing animation flag is set to true in order to show it
			if (animation === true && Monogatari.setting ('TypeAnimation') === true) {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				Monogatari.global ('typedConfiguration').strings = [dialog];
				Monogatari.global ('textObject', new Typed ('[data-ui="say"]', Monogatari.global ('typedConfiguration')));
			} else {
				$_(`${Monogatari.selector} [data-ui="say"]`).html (dialog);
				Monogatari.global ('finishedTyping', true);
			}
		} else {
			if (!$_(`${Monogatari.selector} [data-ui="text"]`).hasClass ('nvl')) {
				Dialog.reset ();
				$_(`${Monogatari.selector} [data-ui="text"]`).addClass ('nvl');
			}

			// Remove contents from the dialog area.
			//$_(`${Monogatari.selector} [data-ui="say"]`).html ('');
			$_(`${Monogatari.selector} [data-ui="say"]`).data ('speaking', character);

			// Check if the typing animation flag is set to true in order to show it
			/*if (animation === true && Monogatari.setting ('TypeAnimation') === true) {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				$_(`${Monogatari.selector} [data-ui="say"]`).append ('<p></p>');
				Monogatari.global ('typedConfiguration').strings = [dialog + '\n'];
				Monogatari.global ('textObject', new Typed ('[data-ui="say"]:last-child', Monogatari.global ('typedConfiguration')));
			} else {*/
			$_(`${Monogatari.selector} [data-ui="say"]`).append (`<p data-spoke="${this.id}">${dialog}</p>`);
			Monogatari.global ('finishedTyping', true);
			//}
		}

		Dialog.checkUnread ();

		return Promise.resolve ();
	}

	narratorDialog () {
		return this.displayDialog (this.dialog, 'narrator', Monogatari.setting ('NarratorTypeAnimation'));
	}

	characterDialog () {
		// Check if the character has a name to show
		if (typeof this.character.Name !== 'undefined') {
			$_(`${Monogatari.selector} [data-ui="who"]`).html (Monogatari.replaceVariables (this.character.Name));
		}

		// Focus the character's sprite and colorize it's name with the defined
		// color on its declaration
		$_(`${Monogatari.selector} [data-character="${this.id}"]`).addClass ('focus');
		$_(`${Monogatari.selector} [data-ui="who"]`).style ('color', this.character.Color);

		// Check if an expression or face image was used and if it exists and
		// display it
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
		// Check if a character is the one speaking or if the narrator is speaking
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