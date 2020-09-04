import { Action } from './../lib/Action';
import { Text } from '@aegis-framework/artemis';

export class ShowBackground extends Action {

	static setup () {
		this.engine.history ('background');

		this.engine.state ({
			background: ''
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const { background, scene } = this.engine.state ();
		if (background !== '' && scene === '') {
			const promise = this.engine.run (background, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			this.engine.history ('background').pop ();

			return promise;
		}
		return Promise.resolve ();
	}

	static reset () {
		const background = this.engine.element ().find ('[data-ui="background"]');

		background.style ('background-image', 'initial');
		background.style ('background-color', 'initial');

		this.engine.state ({
			background: ''
		});

		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'background';
	}

	constructor ([ show, type, background, ...classes ]) {
		super ();
		this.background = background;
		this.property = 'background-image';
		if (typeof this.engine.asset ('scenes', background) !== 'undefined') {
			this.value = `url(${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').scenes}/${this.engine.asset ('scenes', background)})`;
		} else {
			const rest = [background, ...classes].join (' ');
			if (classes.indexOf ('with') > -1) {
				this.value = Text.prefix ('with', rest);
			} else {
				this.value = rest;
			}

			const isColorProperty = ['#', 'rgb', 'hsl'].findIndex ((color) => {
				return this.value.indexOf (color) === 0;
			}) > -1;

			const isNamed = this.value.indexOf (' ') > -1 ? false : new RegExp(/\w+/).test (this.value) && !(new RegExp (/(url|gradient)\(/).test (this.value));

			if (isColorProperty === true || isNamed === true) {
				this.property = 'background-color';
			}
		}

		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		const background = this.engine.element ().find ('[data-ui="background"]');

		background.removeClass ();
		void background.get (0).offsetWidth;

		return Promise.resolve ();
	}

	apply () {
		const background = this.engine.element ().find ('[data-ui="background"]');

		this.engine.element ().find ('[data-ui="background"]').style ('background-image', 'initial');
		this.engine.element ().find ('[data-ui="background"]').style ('background-color', 'initial');
		this.engine.element ().find ('[data-ui="background"]').style ('animation-duration', '');

		this.engine.element ().find ('[data-ui="background"]').style (this.property, this.value);

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			background.style ('animation-duration', this.classes[durationPosition + 1]);
		}

		for (const newClass of this.classes) {
			background.addClass (newClass);
		}

		return Promise.resolve ();
	}

	didApply () {
		this.engine.state ({
			background: this._statement
		});
		this.engine.history ('background').push (this._statement);

		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		this.engine.element ().find ('[data-ui="background"]').removeClass ();
		return Promise.resolve ();
	}

	revert () {
		let history = this.engine.history ('background');

		history.pop ();

		if (history.length === 0) {
			history = this.engine.history ('scene');
			history.pop ();
		}

		if (history.length > 0) {
			const background = this.engine.element ().find ('[data-ui="background"]');
			const last = history[history.length - 1].replace ('show scene', 'show background');
			const action = this.engine.prepareAction (last, { cycle: 'Application' });

			background.style ('background-image', 'initial');
			background.style ('background-color', 'initial');
			background.style (action.property, action.value);

			for (const newClass of this.classes) {
				background.addClass (newClass);
			}

			this.engine.state ({
				background: last
			});
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

ShowBackground.id = 'Show::Background';

export default ShowBackground;