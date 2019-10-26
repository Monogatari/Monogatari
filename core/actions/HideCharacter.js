import { Action } from './../lib/Action';

export class HideCharacter extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'character';
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof this.engine.character (this.asset) !== 'undefined') {
			this.element = this.engine.element ().find (`[data-character="${this.asset}"]`);
		} else {
			// TODO: Add FancyError for when the character does not exist
		}

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter ((c) => (c !== 'at' && c !== 'with'));
	}

	apply () {
		this.element.removeClass ();
		this.element.addClass ('animated');

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			this.element.style ('animation-duration', this.classes[durationPosition + 1]);
		} else {
			this.element.style ('animation-duration', '');
		}

		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				this.element.addClass (newClass);
			}
			this.element.data ('visibility', 'invisible');
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
		this.engine.run (this.engine.history ('character').pop (), false);
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCharacter.id = 'Hide::Character';

export default HideCharacter;