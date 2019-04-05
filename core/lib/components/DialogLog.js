import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class DialogLog extends Component {

	static setup () {
		Monogatari.component ('quick-menu').addAfter ('Hide', {
			string: 'Log',
			icon: 'far fa-comments',
			data: {
				action: 'dialog-log'
			}
		});

		$_(`${Monogatari.selector}`).append (this.html ());
	}

	static reset () {
		$_(`${Monogatari.selector} [data-content="log"]`).html ('<div class="text--center padded" data-string="NoDialogsAvailable">No dialogs available. Dialogs will appear here as they show up.</div>');
	}

	static bind () {
		Monogatari.registerListener ('dialog-log', {
			callback: () => {
				if ($_('[data-ui="dialog-log"]').isVisible ()) {
					$_('[data-ui="dialog-log"]').removeClass ('modal--active');
				} else {
					$_('[data-ui="dialog-log"]').addClass ('modal--active');

					// Make the log scroll to the last dialog available
					const element = $_(`${Monogatari.selector} [data-content="log"]`).get (0);
					element.scrollTop = element.scrollHeight;
				}
			}
		});
	}

	static write ({ id, character, dialog }) {
		$_('[data-string="NoDialogsAvailable"]').remove ();

		if (id !== 'narrator' && id !== 'centered') {
			const { name, color } = character;
			$_(`${Monogatari.selector} [data-content="log"]`).append (`
				<div data-spoke="${id}" class="named">
					<span style="color:${color};">${Monogatari.replaceVariables (name)} </span>
					<p>${dialog}</p>
				</div>
			`);
		} else {
			$_(`${Monogatari.selector} [data-content="log"]`).append (`<div data-spoke="${id}" class="unnamed"><p>${dialog}</p></div>`);
		}
	}

	static pop () {
		const last = $_(`${Monogatari.selector} [data-content="log"] [data-spoke]`).last ();
		if (typeof last !== 'undefined') {
			last.remove ();
		}
	}
}

DialogLog._id = 'dialog-log';

DialogLog._html = `
	<div data-component="dialog-log" data-ui="dialog-log" class="modal">
		<div class="modal__content">
			<div data-content="log">
				<div class="text--center padded" data-string="NoDialogsAvailable">No dialogs available. Dialogs will appear here as they show up.</div>
			</div>
			<button data-action="dialog-log">Close</button>
		</div>
	</div>
`;

Monogatari.registerComponent (DialogLog);