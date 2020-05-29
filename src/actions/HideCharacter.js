import { Action } from './../lib/Action';
import { FancyError } from './../lib/FancyError';

export class HideCharacter extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'character';
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof this.engine.character (this.asset) !== 'undefined') {
			this.element = this.engine.element ().find (`[data-character="${this.asset}"]`).last ();
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
				`The character "${this.asset}" can't hide because it's not being shown`,
				`Monogatari attempted to hide the character "${this.asset}" but it was not being shown.`,
				{
					'Missing Character': this.asset,
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

		if (this.classes.length > 0) {
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

		return Promise.resolve ();
	}

	didApply () {
		const show = this.engine.state ('characters').filter ((item) => {
			const [ show, type, asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		this.engine.state ({ characters: show });
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		if (this.engine.history ('character').length <= 0) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		for (let i = this.engine.history ('character').length - 1; i >= 0; i--) {
			const last = this.engine.history ('character')[i];
			const [show, character, asset, name] = last.split (' ');

			if (asset === this.asset) {
				return this.engine.run (last, false);
			}
		}
		return Promise.reject ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCharacter.id = 'Hide::Character';

export default HideCharacter;
