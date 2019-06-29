import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { Text } from '@aegis-framework/artemis';

export class ShowBackground extends Action {

	static setup () {
		Monogatari.history ('background');

		Monogatari.state ({
			background: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { background } = Monogatari.state ();
		if (background !== '') {
			Monogatari.run (background, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('background').pop ();
		}
		return Promise.resolve ();
	}

	static reset () {
		const background = Monogatari.element ().find ('[data-ui="background"]');

		background.style ('background-image', 'initial');
		background.style ('background-color', 'initial');

		Monogatari.state ({
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
		if (typeof Monogatari.asset ('scenes', background) !== 'undefined') {
			this.value = `url(${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').scenes}/${Monogatari.asset ('scenes', background)})`;
		} else {
			const rest = [background, ...classes].join (' ');
			if (classes.indexOf ('with') > -1) {
				this.value = Text.prefix ('with', rest);
			} else {
				this.value = rest;
			}
			console.log(this.value);

			const isColorProperty = ['#', 'rgb', 'hsl'].findIndex ((color) => {
				return this.value.indexOf (color) === 0;
			}) > -1;

			const isNamed = this.value.indexOf (' ') > -1 ? false : new RegExp(/\w+/).test (this.value);

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
		const background = Monogatari.element ().find ('[data-ui="background"]');

		background.removeClass ();
		void background.get (0).offsetWidth;

		return Promise.resolve ();
	}

	apply () {
		const background = Monogatari.element ().find ('[data-ui="background"]');

		Monogatari.element ().find ('[data-ui="background"]').style ('background-image', 'initial');
		Monogatari.element ().find ('[data-ui="background"]').style ('background-color', 'initial');
		Monogatari.element ().find ('[data-ui="background"]').style ('animation-duration', '');
		console.log (this.property, this.value);
		Monogatari.element ().find ('[data-ui="background"]').style (this.property, this.value);

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
		Monogatari.state ({
			background: this._statement
		});
		Monogatari.history ('background').push (this._statement);

		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		Monogatari.element ().find ('[data-ui="background"]').removeClass ();
		return Promise.resolve ();
	}

	revert () {
		const history = Monogatari.history ('background');

		history.pop ();

		if (history.length > 0) {
			const background = Monogatari.element ().find ('[data-ui="background"]');
			const last = history[history.length - 1];
			this.constructor (last.split (' '));

			background.style ('background-image', 'initial');
			background.style ('background-color', 'initial');
			background.style (this.property, this.value);

			for (const newClass of this.classes) {
				background.addClass (newClass);
			}

			Monogatari.state ({
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

Monogatari.registerAction (ShowBackground);