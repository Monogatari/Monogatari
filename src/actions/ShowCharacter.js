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

		this.engine.state ({
			characters: []
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const { characters } = this.engine.state ();
		const promises = [];

		for (const item of characters) {
			const action = this.engine.prepareAction (item, { cycle: 'Application' });
			const promise = action.willApply ().then (() => {
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: false });
				});
			});

			promises.push (promise);
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

		const imgSrc = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').characters}/${directory}${this.image}`;
		const sprite = this.engine.element ().find (`[data-character="${this.asset}"]:not([data-visibility="invisible"])`);

		if (sprite.isVisible ()) {
			const oldClasses = [...sprite.get(0).classList];

			// Check if there is any end-animation, here's what this matches:
			// 'end-fadeIn'.match (/end-([A-Za-z]+)/) => [ "end-fadeIn", "fadeIn" ]
			const endAnimation = oldClasses.find(c => c.match (/end-([A-Za-z]+)/) !== null);

			if (typeof endAnimation !== 'undefined') {
				// If there was, get the animation-only part
				const [end, animation] = endAnimation.split('-');
				const watchAnimation = oldClasses[oldClasses.indexOf(endAnimation) - 1];
				sprite.removeClass (watchAnimation);
				sprite.addClass (animation);
				sprite.data ('visibility', 'invisible');
				sprite.on ('animationend', (e) => {
					e.target.remove ();
				});

				oneSpriteOnly = false;
			}

			for (const oldClass of oldClasses) {
				if (this.classes.indexOf (oldClass) === -1) {
					sprite.removeClass (oldClass);
				}
			}
		}

		const position = this._statement.match (/at\s(\S*)/);

		if (oneSpriteOnly && sprite.isVisible ()) {
			sprite.attribute ('src', imgSrc);
			sprite.data ('sprite', this.sprite);

			for (const className of this.classes) {
				if (className) {
					sprite.addClass (className);
				}
			}

			const durationPosition = this.classes.indexOf ('duration');
			if (durationPosition > -1) {
				sprite.style ('animation-duration', this.classes[durationPosition + 1]);
			} else {
				sprite.style ('animation-duration', '');
			}

			const transitionPosition = this.classes.indexOf ('transition');

			if (transitionPosition > -1) {
				sprite.style ('transition-duration', this.classes[transitionPosition + 1]);
			} else {
				sprite.style ('transition-duration', '');
			}

			// Check if a position was provided. (show character y at left)
			if (position instanceof Array) {
				// If it was, we'll set that position to the character
				const [at, positionClass] = position;
				sprite.data ('position', positionClass);
			} else {
				// If it wasn't, we'll check if the sprite already had one position set
				// const currentPosition = sprite.data ('position');
				// if (typeof currentPosition === 'string') {
				// 	// If it did, we'll add that position
				// 	if (currentPosition.trim () !== '') {
				// 		console.log (currentPosition);
				// 		sprite.addClass (currentPosition.trim ());
				// 	}
				// } else {
				// 	// If it didn't, we'll set the center position by default
				// 	sprite.addClass ('center');
				// 	sprite.data ('position', 'center');
				// }

				sprite.addClass ('center');
				sprite.data ('position', 'center');
			}

			sprite.data ('sprite', this.sprite);
		} else {
			const image = document.createElement ('img');
			$_(image).attribute ('src', imgSrc);
			$_(image).addClass ('animated');
			$_(image).data ('character', this.asset);
			$_(image).data ('sprite', this.sprite);

			for (const className of this.classes) {
				if (className) {
					image.classList.add (className);
				}
			}

			// Check if a position was provided. (show character y at left)
			if (position instanceof Array) {
				// If it was, we'll set that position to the character
				const [at, positionClass] = position;
				$_(image).data ('position', positionClass);
			} else {
				// If it wasn't, we'll set the center position by default
				image.classList.add ('center');
				$_(image).data ('position', 'center');
			}

			const durationPosition = this.classes.indexOf ('duration');
			if (durationPosition > -1) {
				$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
			}

			this.engine.element ().find ('[data-screen="game"] [data-content="visuals"]').append (image);
		}

		return Promise.resolve ();
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			this.engine.history ('character').push (this._statement);
		}

		if (updateState === true) {
			this.engine.state ({
				characters: [
					...this.engine.state ('characters').filter ((item) => {
						if (typeof item === 'string') {
							const [show, character, asset, sprite] = item.split (' ');
							return asset !== this.asset;
						}
						return false;
					}),
					this._statement
				]
			});
		}
		return Promise.resolve ({ advance: true });
	}

	revert () {
		this.engine.element ().find (`[data-character="${this.asset}"]`).remove ();

		// First, we remove the last instance of the character from the history since
		// that's the one being currently displayed and we want the one before that
		for (let i = this.engine.history ('character').length - 1; i >= 0; i--) {
			const last = this.engine.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');
			if (asset === this.asset) {
				this.engine.history ('character').splice (i, 1);
				break;
			}
		}

		// Now, we go through the remaining history to find the last instance of the
		// character.
		for (let i = this.engine.history ('character').length - 1; i >= 0; i--) {
			const last = this.engine.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');

			if (asset === this.asset) {
				// this.engine.history ('character').splice (i, 1);
				const action = this.engine.prepareAction (last, { cycle: 'Apply' });
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: true });
				});
			}
		}

		// If the script didn't return on the for cycle above, it means either the
		// history didn't have any items left or, the character was not found.
		// In that case, we simply remove the character from the state.
		this.engine.state ({
			characters: [
				...this.engine.state ('characters').filter ((item) => {
					if (typeof item === 'string') {
						const [show, character, asset, sprite] = item.split (' ');
						return asset !== this.asset;
					}
					return false;
				}),
			],
		});

		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

ShowCharacter.id = 'Show::Character';

export default ShowCharacter;
