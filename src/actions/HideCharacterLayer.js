import { Action } from './../lib/Action';
import { FancyError } from './../lib/FancyError';


export class HideCharacterLayer extends Action {

	static _experimental = true;

	static matchString ([ hide, type, identifier ]) {
		return hide === 'hide' && type === 'character' && identifier.indexOf(':') > -1;
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		const [ character, layer ] = asset.split(':');
		this.asset = character;
		this.layer = layer;

		if (typeof this.engine.character (this.asset) !== 'undefined') {
			this.parent = this.engine.element ().find (`[data-character="${this.asset}"]`).last ();
			this.element = this.parent.find (`[data-layer="${this.layer}"]`).last ();
		} else {
			FancyError.show (
				`The character "${this.asset}" does not exist`,
				`Monogatari attempted to get information about the character "${this.asset}" but it wasn't found on the characters object.`,
				{
					'Missing Character': this.asset,
					'You may have meant one of these': Object.keys (this.engine.characters ()),
					'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
					'Label': this.engine.state ('label'),
					'Step': this.engine.state ('step'),
					'Help': {
						'_': 'Check your characters object and your script to make sure the character exists and that it does not have a typo in it.'
					}
				}
			);
		}

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter ((c) => (c !== 'at' && c !== 'with'));
	}

	willApply () {

		if (!this.element.exists ()) {
			FancyError.show (
				`The character layer "${this.layer}" can't hide because it's not being shown`,
				`Monogatari attempted to hide the layer "${this.layer}" of the character "${this.asset}" but it was not being shown.`,
				{
					'Missing Layer': this.layer,
					'Character': this.asset,
					'You may have meant one of these': Object.keys (this.engine.characters ()),
					'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
					'Label': this.engine.state ('label'),
					'Step': this.engine.state ('step'),
					'Help': {
						'_': 'Check that before this hide action you have a show action that shows the character you want to hide.'
					}
				}
			);
			return Promise.reject ('Attempted to hide a character that was not being shown.');
		}

		return Promise.resolve ();
	}


	apply () {
		const oldClasses = [...this.element.get (0).classList];

		for (const oldClass of oldClasses) {
			this.element.removeClass (oldClass);
		}

		this.element.addClass ('animated');

		// Check if there is any end-animation, here's what this matches:
		// 'end-fadeIn'.match (/end-([A-Za-z]+)/) => [ "end-fadeIn", "fadeIn" ]
		const endAnimation = oldClasses.find(c => c.match (/end-([A-Za-z]+)/) !== null);

		if (typeof endAnimation !== 'undefined') {
			const [end, animation] = endAnimation.split('-');
			this.element.addClass (animation);
		}

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			this.element.style ('animation-duration', this.classes[durationPosition + 1]);
		} else {
			this.element.style ('animation-duration', '');
		}

		if (this.classes.length > 0 || typeof endAnimation !== 'undefined') {
			for (const className of this.classes) {
				if (className) {
					this.element.addClass (className);
				}
			}
			this.element.data ('visibility', 'invisible');

			this.element.on ('animationend', (e) => {
				if (e.target.dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					e.target.remove ();
				}
			});
		} else {
			this.element.remove ();
		}

		const parentAsComponent = this.parent.get(0);
		const stateLayers = parentAsComponent.state.layers;
		delete stateLayers[this.layer];

		parentAsComponent.setState({
			layers: stateLayers
		});


		return Promise.resolve ();
	}

	didApply () {
		const show = this.engine.state ('characterLayers').filter ((item) => {
			const [ show, character, asset, ] = item.split (' ');
			const [id, layer] = asset.split(':');
			return id !== this.asset || layer !== this.layer;
		});

		this.engine.state ({ characterLayers: show });
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		if (this.engine.history ('characterLayer').length <= 0) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		for (let i = this.engine.history ('characterLayer').length - 1; i >= 0; i--) {
			const last = this.engine.history ('characterLayer')[i];
			const [show, character, asset, name] = last.split (' ');
			const [id, layer] = asset.split(':');

			if (id === this.asset && layer === this.layer) {
				const action = this.engine.prepareAction (last, { cycle: 'Application' });
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: true });
				});
			}
		}
		return Promise.reject ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCharacterLayer.id = 'Hide::Character::Layer';

export default HideCharacterLayer;
