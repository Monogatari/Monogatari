import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class DialogLog extends Component {

	static setup () {
		this.engine.component ('quick-menu').addButtonAfter ('Hide', {
			string: 'Log',
			icon: 'far fa-comments',
			data: {
				action: 'dialog-log'
			}
		});
		return Promise.resolve ();
	}

	static bind () {
		this.engine.registerListener ('dialog-log', {
			callback: () => {
				console.log ('ON');
				this.instances ((element) => {
					console.log (element);
					const active = element.state.active;
					console.log (active);
					element.setState ({
						active: !active
					});
				});
			}
		});
		return Promise.resolve ();
	}

	onReset () {
		this.content ('log').html ('<div class="text--center padded" data-string="NoDialogsAvailable">No dialogs available. Dialogs will appear here as they show up.</div>');
		return Promise.resolve ();
	}

	write ({ id, character, dialog }) {
		this.content ('placeholder').remove ();
		console.log (id, character, dialog);
		if (id !== 'narrator' && id !== 'centered') {
			const { name, color } = character;
			this.content ('log').append (`
				<div data-spoke="${id}" class="named">
					<span style="color:${color};">${Monogatari.replaceVariables (name)} </span>
					<p>${dialog}</p>
				</div>
			`);
		} else {
			this.content ('log').append (`<div data-spoke="${id}" class="unnamed"><p>${dialog}</p></div>`);
		}
	}

	pop () {
		const last = this.content ('log').find ('[data-spoke]').last ();

		if (typeof last !== 'undefined') {
			last.remove ();
		}
	}

	constructor () {
		super ();

		this.state = {
			active: false
		};
	}

	onStateUpdate (property, oldValue, newValue) {
		if (property === 'active') {
			this.classList.toggle ('modal--active');

			if (newValue === true) {
				this.scrollTop = this.scrollHeight;
			}
		}
		return Promise.resolve ();
	}

	willMount () {
		this.classList.add ('modal');
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	render () {
		return `
			<div class="modal__content">
				<div data-content="log">
					<div class="text--center padded" data-string="NoDialogsAvailable" data-content="placeholder">No dialogs available. Dialogs will appear here as they show up.</div>
				</div>
				<button data-action="dialog-log">Close</button>
			</div>
		`;
	}
}

DialogLog._id = 'dialog-log';


Monogatari.registerComponent (DialogLog);