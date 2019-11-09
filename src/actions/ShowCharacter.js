import { Action } from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';

export class ShowCharacter extends Action {

	static setup () {
		// The character history saves what characters have been displayed
		this.engine.history ('character');

		// The characters state variable holds what characters are being shown
		// right now
		this.engine.state ({
			characters: []
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.element ().find ('[data-screen="game"] [data-character]').remove ();
		return Promise.resolve ();
	}

	static onLoad () {
		const { characters } = this.engine.state ();
		const promises = [];

		for (const item of characters) {
			promises.push (this.engine.run (item, false));
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			this.engine.history ('character').pop ();
		}

		if (promises.length > 0) {
			return Promise.all (promises);
		}

		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'character';
	}

	constructor ([ show, type, asset, sprite, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof this.engine.character (asset) !== 'undefined') {
			// show [character] [expression] at [position] with [animation] [infinite]
			this.sprite = sprite;

			this.character = this.engine.character (asset);
			this.image = this.character.sprites[this.sprite];

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

		let directory = this.character.directory;
		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		let oneSpriteOnly = true;

		const sprite = this.engine.element ().find (`[data-character="${this.asset}"]`);
		const image = document.createElement ('img');
		const imgSrc = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').characters}/${directory}${this.image}`;

		if (sprite.isVisible ()){
			let before = "";

			for (const oldClass of sprite.get(0).classList) {
				let matches = oldClass.match (/end-([A-Za-z]+)/); // end-[someLetters]
				
				if ( matches === null ) {
					before = oldClass;
				} else {
					sprite.removeClass (before);
					sprite.addClass (matches[1]);
					sprite.on ("animationend", function(){
						sprite.remove();
					});

					oneSpriteOnly = false;
					break;
				}
			}
		}

		if (oneSpriteOnly && sprite.isVisible ()) {
			sprite.attribute ('src', imgSrc);
			sprite.data ('sprite', this.sprite);

			for (const newClass of this.classes) {
				sprite.addClass (newClass);
			}

			const durationPosition = this.classes.indexOf ('duration');
			if (durationPosition > -1) {
				sprite.style ('animation-duration', this.classes[durationPosition + 1]);
			} else {
				sprite.style ('animation-duration', '');
			}
		} else {
			$_(image).attribute ('src', imgSrc);
			$_(image).addClass ('animated');
			$_(image).data ('character', this.asset);
			$_(image).data ('sprite', this.sprite);

			for (const className of this.classes) {
				image.classList.add (className);
			}

			const durationPosition = this.classes.indexOf ('duration');
			if (durationPosition > -1) {
				$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
			}

			this.engine.element ().find ('[data-screen="game"] [data-content="visuals"]').append (image);
		}

		return Promise.resolve ();
	}

	didApply () {
		this.engine.history ('character').push (this._statement);
		this.engine.state ({
			characters: [
				...this.engine.state ('characters').filter ((item) => {
					if (item !== null && typeof item !== 'undefined') {
						const [show, character, asset, sprite] = item.split (' ');
						return asset !== this.asset;
					}
					return false;
				}),
				this._statement
			]
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		this.engine.element ().find (`[data-character="${this.asset}"]`).remove ();

		for (let i = this.engine.history ('character').length - 1; i >= 0; i--) {
			const last = this.engine.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');
			if (asset === this.asset) {
				this.engine.history ('character').splice (i, 1);
				break;
			}
		}

		for (let i = this.engine.history ('character').length - 1; i >= 0; i--) {
			const last = this.engine.history ('character')[i];
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
		return Promise.resolve ({ advance: true, step: true });
	}
}

ShowCharacter.id = 'Show::Character';

export default ShowCharacter;
