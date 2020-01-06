import { Action } from './../lib/Action';
import { FancyError } from '../lib/FancyError';

export class Jump extends Action {

	static setup () {
		this.engine.history ('label');
		this.engine.history ('jump');
		return Promise.resolve ();
	}

	static bind (selector) {
		this.engine.registerListener ('jump', {
			callback: (element) => {
				this.engine.run (`jump ${element.data('jump')}`, false);
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
		if (typeof this.engine.script (this.label) !== 'undefined') {
			this.engine.stopAmbient ();
			this.engine.showScreen ('game');
			return Promise.resolve ();
		}

		FancyError.show (
			`The label "${this.label}" does not exist`,
			`Monogatari attempted to jump to the label named "${this.label}" but it wasn't found on the script.`,
			{
				'Missing Label': this.label,
				'You may have meant one of these': Object.keys (this.engine.script ()),
				'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
				'Label': this.engine.state ('label'),
				'Step': this.engine.state ('step'),
				'Help': {
					'_': 'Check if the label in your jump statement is correct and that you have also defined it correctly.'
				}
			}
		);

		return Promise.reject ('Label does not exist.');
	}

	apply () {
		this.engine.history ('jump').push ({
			source: {
				label: this.engine.state ('label'),
				step: this.engine.state ('step')
			},
			destination: {
				label: this.label,
				step: 0
			}
		});
		this.engine.state ({
			step: 0,
			label: this.label
		});

		if (!this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
			this.engine.action ('Dialog').reset ();
		}

		this.engine.run (this.engine.label ()[this.engine.state ('step')]);
		this.engine.history ('label').push (this.label);

		return Promise.resolve ();
	}

	// Jump is right now not reversible due to complications with the logic for it
	willRevert () {
		if (this.engine.history ('jump').length > 0) {
			return Promise.resolve ();
		}
		return Promise.reject ('No elements in history available.');
	}

	revert () {
		const last = this.engine.history ('jump')[this.engine.history ('jump').length - 1];
		if (typeof last !== 'undefined') {
			this.engine.state ({
				step: last.source.step,
				label: last.source.label
			});
			return Promise.resolve ();
		}
		return Promise.reject ('No elements in history available.');
	}

	didRevert () {
		this.engine.history ('jump').pop ();
		this.engine.history ('label').pop ();
		return Promise.resolve ({ advance: true, step: false });
	}
}

Jump.id = 'Jump';

export default Jump;