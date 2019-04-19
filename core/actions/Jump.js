import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { FancyError } from '../lib/FancyError';

export class Jump extends Action {

	static setup () {
		Monogatari.history ('label');
		Monogatari.history ('jump');
		return Promise.resolve ();
	}

	static bind (selector) {
		Monogatari.registerListener ('jump', {
			callback: (element) => {
				Monogatari.run (`jump ${element.data('jump')}`, false);
			}
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'jump';
	}

	constructor ([ action, label ]) {
		super ();
		this.label = label;
	}

	willApply () {
		if (typeof Monogatari.script (this.label) !== 'undefined') {
			Monogatari.stopAmbient ();
			this.engine.showScreen ('game');
			return Promise.resolve ();
		} else {
			FancyError.show (
				`The label "${this.label}" does not exist`,
				`Monogatari attempted to jump to the label named "${this.label}" but it wasn't found on the script.`,
				{
					'Missing Label': this.label,
					'You may have meant one of these': Object.keys (Monogatari.script ()),
					'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
					'Label': Monogatari.state ('label'),
					'Step': Monogatari.state ('step'),
					'Help': {
						'_': 'Check if the label in your jump statement is correct and that you have also defined it correctly.'
					}
				}
			);
		}
		return Promise.reject ();
	}

	apply () {
		Monogatari.history ('jump').push ({
			source: {
				label: Monogatari.state ('label'),
				step: Monogatari.state ('step')
			},
			destination: {
				label: this.label,
				step: 0
			}
		});
		Monogatari.state ({
			step: 0,
			label: this.label
		});

		if (!Monogatari.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
			Monogatari.action ('Dialog').reset ();
		}

		Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		Monogatari.history ('label').push (this.label);

		return Promise.resolve ();
	}

	// Jump is right now not reversible due to complications with the logic for it
	willRevert () {
		if (Monogatari.history ('jump').length > 0) {
			return Promise.resolve ();
		}
		return Promise.reject ('No elements in history available.');
	}

	revert () {
		const last = Monogatari.history ('jump')[Monogatari.history ('jump').length - 1];
		if (typeof last !== 'undefined') {
			Monogatari.state ({
				step: last.source.step,
				label: last.source.label
			});
			return Promise.resolve ();
		}
		return Promise.reject ('No elements in history available.');
	}

	didRevert () {
		Monogatari.history ('jump').pop ();
		Monogatari.history ('label').pop ();
		return Promise.resolve ({ advance: true, step: false });
	}
}

Jump.id = 'Jump';

Monogatari.registerAction (Jump);