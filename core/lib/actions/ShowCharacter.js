import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class ShowCharacter extends Action {

	static setup () {
		// The character history saves what characters have been displayed
		Monogatari.history ('character');

		// The characters state variable holds what characters are being shown
		// right now
		Monogatari.state ({
			characters: []
		});
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-screen="game"] [data-character]`).remove ();
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

	constructor ([ show, type, asset, sprite, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof Monogatari.character (asset) !== 'undefined') {
			// show [character] [expression] at [position] with [animation] [infinite]
			this.sprite = sprite;

			this.character = Monogatari.character (asset);
			this.image = this.character.Images[this.sprite];

			if (typeof classes !== 'undefined') {
				this.classes = ['animated', ...classes.filter ((item) => item !== 'at' && item !== 'with')];
			} else {
				this.classes = [];
			}

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

		if ($_(`${Monogatari.selector} [data-character="${this.asset}"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}`);
			for (const newClass of this.classes) {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).addClass (newClass);
			}

			const durationPosition = this.classes.indexOf ('duration');

			if (durationPosition > -1) {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).style ('animation-duration', this.classes[durationPosition + 1]);
			} else {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).style ('animation-duration', '');
			}
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).data ('sprite', this.sprite);

		} else {
			const image = document.createElement ('img');
			$_(image).attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}`);
			$_(image).addClass ('animated');
			$_(image).data ('character', this.asset);
			$_(image).data ('sprite', this.sprite);

			for (const className of this.classes) {
				$_(image).addClass (className);
			}

			const durationPosition = this.classes.indexOf ('duration');

			if (durationPosition > -1) {
				$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
			}
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove ();
			$_(`${Monogatari.selector} [data-screen="game"]`).append (image);
		}
		return Promise.resolve ();
	}

	didApply () {
		Monogatari.history ('character').push (this._statement);
		Monogatari.state ({
			characters: [
				...Monogatari.state ('characters').filter ((item) => {
					if (item !== null && typeof item !== 'undefined') {
						const [show, character, asset, sprite] = item.split (' ');
						return asset !== this.asset;
					}
					return false;
				}),
				this._statement
			]
		});
		return Promise.resolve (true);
	}

	revert () {
		$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove ();

		for (let i = Monogatari.history ('character').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');
			if (asset === this.asset) {
				Monogatari.history ('character').splice (i, 1);
				break;
			}
		}

		for (let i = Monogatari.history ('character').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');

			if (asset === this.asset) {
				this.constructor (last.split (' '));
				this.apply ();
				break;
			}
		}

		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

ShowCharacter.id = 'Show::Character';

Monogatari.registerAction (ShowCharacter);