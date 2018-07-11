import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import Typed from 'typed.js';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

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
		$_('[data-character]').removeClass ('focus');
		this.dialog = this.context.replaceVariables (this.dialog);

		$_('[data-ui="face"]').hide ();
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
		$_('[data-ui="say"]').html ('');
		$_('[data-ui="say"]').data ('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (Monogatari.setting ('TypeAnimation') === true) {
				Monogatari.global ('typedConfiguration').strings = [dialog];
				Monogatari.global ('textObject', new Typed ('[data-ui="say"]', Monogatari.global ('typedConfiguration')));
			} else {
				$_('[data-ui="say"]').html (dialog);
				if (Monogatari.global ('autoPlay') !== null) {
					Monogatari.global ('autoPlay', setTimeout (() => {
						if (Monogatari.canProceed () && Monogatari.global ('finishedTyping')) {
							Monogatari.hideCentered ();
							Monogatari.shutUp ();
							Monogatari.next ();
						}
					}, Monogatari.preference ('AutoPlaySpeed') * 1000));
				}
				Monogatari.global ('finishedTyping', true);
			}
		} else {
			$_('[data-ui="say"]').html (dialog);
			if (Monogatari.global ('autoPlay') !== null) {
				Monogatari.global ('autoPlay', setTimeout (() => {
					if (Monogatari.canProceed() && Monogatari.global ('finishedTyping')) {
						Monogatari.hideCentered();
						Monogatari.shutUp();
						Monogatari.next ();
					}
				}, Monogatari.preference ('AutoPlaySpeed') * 1000));
			}
			Monogatari.global ('finishedTyping', true);
		}

		return Promise.resolve ();
	}

	narratorDialog () {
		return this.displayDialog (this.dialog, 'narrator', Monogatari.settings ('NarratorTypeAnimation'));
	}

	characterDialog () {
		if (typeof this.character.Name !== 'undefined') {
			$_('[data-ui="who"]').html (this.context.replaceVariables (this.character.Name));
		}

		$_('[data-character="' + this.id + '"]').addClass ('focus');
		$_('[data-ui="who"]').style ('color', this.character.Color);

		if (typeof this.image !== 'undefined') {
			$_('[data-ui="face"]').attribute ('src', 'img/characters/' + this.image);
			$_('[data-ui="face"]').show ();
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