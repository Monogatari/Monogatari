import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class ShowCharacter extends Action {

	static setup () {
		Monogatari.history ('character');
		Monogatari.state ({
			characters: []
		});
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} #game [data-character]`).remove ();
		return Promise.resolve ();
	}

	static onLoad () {
		const { characters } = Monogatari.state ();

		for (const item of characters) {
			Monogatari.run (item, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('character').pop ();
		}

		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'character';
	}

	constructor ([ show, type, asset, ...props ]) {
		super ();
		this.asset = asset;

		if (typeof Monogatari.character (asset) !== 'undefined') {
			this.type = 'character';
			// show [character] [expression] at [position] with [animation] [infinite]
			const [sprite, ...classes] = (' ' + props.join (' ')).replace(' at ', ' ').replace (' with ', ' ').trim ().split (' ');

			this.sprite = sprite;
			this.classes = ['animated', ...classes];
			this.character = Monogatari.character (asset);
			this.image = this.character.Images[this.sprite];
		} else {
			// TODO: Add Fancy Error when the specified character does not exist
		}
	}

	apply () {

		// show [character] [expression] at [position] with [animation] [infinite]
		//   0      1             2       3     4        5       6         7

		// show [character] [expression] with [animation] [infinite]
		//   0      1             2       3       4         5

		// show [character] [expression]
		//   0      1             2


		let directory = this.character.Directory;

		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		const object = `<img src="assets/characters/${directory}${this.image}" class="animated ${this.classes.join (' ')}" data-character="${this.asset}" data-sprite="${this.sprite}">`;

		if ($_(`${Monogatari.selector} [data-character="${this.asset}"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).removeClass ();
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).attribute ('src', `assets/characters/${directory}${this.image}`);
			for (const newClass of this.classes) {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).addClass (newClass);
			}
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).data ('sprite', this.sprite);

		} else {
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove ();
			$_(`${Monogatari.selector} #game`).append (object);
		}

		Monogatari.history ('character').push (this._statement);
		Monogatari.state ({
			characters: [...Monogatari.state ('characters'), this._statement].filter ((item) => item !== null && typeof item !== 'undefined')
		});
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove();
		Monogatari.history ('character').pop ();

		const last_character = Monogatari.history ('character').slice(-1)[0];
		if (typeof last_character != 'undefined') {
			this.constructor (last_character.split (' '));
			this.apply ();
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

ShowCharacter.id = 'Show::Character';

Monogatari.registerAction (ShowCharacter);