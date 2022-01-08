import { Action } from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';

export class ShowCharacterLayer extends Action {

	static _experimental = true;

	static setup () {
		// The character history saves what characters have been displayed
		this.engine.history ('characterLayer');

		// The characters state variable holds what characters are being shown
		// right now
		this.engine.state ({
			characterLayers: []
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.state ({
			characterLayers: []
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const { characterLayers } = this.engine.state ();
		const promises = [];

		for (const item of characterLayers) {
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

	static matchString ([ show, type, identifier ]) {
		return show === 'show' && type === 'character' && identifier.indexOf (':') > -1;
	}

	constructor ([ show, type, asset, sprite, ...classes ]) {
		super ();
		const [ character, layer ] = asset.split(':');
		this.asset = character;
		this.layer = layer;

		this.state = this.engine.state('characterLayers').find((statement) => {
			const [show, _character, asset, name] = statement.split (' ');
			const [_identifier, _layer] = asset.split(':');
			return _identifier === character && _layer == layer;
		});

		if (typeof this.engine.character (character) !== 'undefined') {
			// show [character] [expression] at [position] with [animation] [infinite]
			this.sprite = sprite;

			this.character = this.engine.character (character);
			this.image = this.character.layer_assets[layer][sprite];

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
		// show [character:layer] with [...animation] [infinite]
		//   0         1           2       3          4

		// show [character:layer]
		//   0         1

		let directory = this.character.directory;
		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		let oneSpriteOnly = true;


		const parent = this.engine.element ().find (`[data-character="${this.asset}"]:not([data-visibility="invisible"])`);

		const sprite = parent.find (`[data-layer="${this.layer}"]:not([data-visibility="invisible"])`);

		if (sprite.isVisible () || (this.engine.global ('_restoring_state') && sprite.exists())) {
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

		const imgSrc = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').characters}/${directory}`;

		if (oneSpriteOnly && (sprite.isVisible () || (this.engine.global ('_restoring_state') && sprite.exists()))) {
			sprite.attribute ('src', `${imgSrc}${this.image}`);
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
		} else {
			const image = document.createElement ('img');
			$_(image).attribute ('src', `${imgSrc}${this.image}`);
			$_(image).addClass ('animated');
			$_(image).data ('layer', this.layer);
			$_(image).data ('sprite', this.sprite);
			$_(image).style({ zIndex: this.character.layers.indexOf (this.layer)});

			for (const className of this.classes) {
				if (className) {
					image.classList.add (className);
				}
			}

			const durationPosition = this.classes.indexOf ('duration');
			if (durationPosition > -1) {
				$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
			}

			parent.find('[data-content="wrapper"]').append (image);
		}

		// Update the state of the component
		const parentAsComponent = parent.get(0);
		const stateLayers = parentAsComponent.state.layers;
		parentAsComponent.setState({
			layers: {
				...stateLayers,
				[this.layer]: {
					asset: this.sprite,
					classes: this.classes
				}
			}
		});

		return Promise.resolve ();
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			this.engine.history ('characterLayer').push ({
				parent: null,
				layers: [
					{
						statement: this._statement,
						previous: this.state || null
					}
				]
			});
		}

		if (updateState === true) {
			this.engine.state ({
				characterLayers: [
					...this.engine.state ('characterLayers').filter ((item) => {
						if (typeof item === 'string') {
							const [show, character, asset, sprite] = item.split (' ');
							const [id, layer] = asset.split(':');
							return id !== this.asset || layer !== this.layer;
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
		const parent = this.engine.element ().find (`[data-character="${this.asset}"]`);

		parent.find (`[data-layer="${this.layer}"]`).remove ();


		// First, we remove the last instance of the character from the history since
		// that's the one being currently displayed and we want the one before that
		for (let i = this.engine.history ('characterLayer').length - 1; i >= 0; i--) {
			const { parent, layers }  = this.engine.history ('characterLayer')[i];

			const historyStatement = layers.find((s) => {
				const { previous, statement } = s;
				const [show, character, asset, name] = statement.split (' ');
				const [id, layer] = asset.split(':');

				return id === this.asset && layer === this.layer;
			});

			if (typeof historyStatement === 'object' && historyStatement !== null) {

				const { statement, previous } = historyStatement;
				const [show, character, asset, name] = statement.split (' ');
				const [id, layer] = asset.split(':');
				if (id === this.asset && layer === this.layer) {
					this.engine.history ('characterLayer').splice (i, 1);

					if (typeof previous !== 'undefined' && previous !== null) {
						const action = this.engine.prepareAction (previous, { cycle: 'Apply' });
						return action.apply ().then (() => {
							return action.didApply ({ updateHistory: false, updateState: true });
						});
					}


					break;
				}
			}
		}

		// If the script didn't return on the for cycle above, it means either the
		// history didn't have any items left or, the character was not found.
		// In that case, we simply remove the character from the state.
		this.engine.state ({
			characterLayers: [
				...this.engine.state ('characterLayers').filter ((item) => {
					if (typeof item === 'string') {
						const [show, character, asset, sprite] = item.split (' ');
						const [id, layer] = asset.split(':');
						return id !== this.asset || layer !== this.layer;
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

ShowCharacterLayer.loadingOrder = 1;
ShowCharacterLayer.id = 'Show::Character::Layer';

export default ShowCharacterLayer;
