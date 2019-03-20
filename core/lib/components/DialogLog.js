import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class DialogLog extends Component {

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static setup () {
		Monogatari.component ('QUICK_MENU').addAfter ('Hide', {
			string: 'Log',
			icon: 'far fa-comments',
			data: {
				action: 'dialog-log'
			}
		});

		$_(`${Monogatari.selector}`).append (this.html ());
	}

	static bind () {
		Monogatari.registerListener ('dialog-log', {
			callback: () => {
				if ($_('[data-ui="dialog-log"]').isVisible ()) {
					$_('[data-ui="dialog-log"]').removeClass ('modal--active');
				} else {
					$_('[data-ui="dialog-log"]').addClass ('modal--active');
				}
			}
		});
	}

	static write ({ id, character, dialog }) {

		$_('[data-string="NoDialogsAvailable"]').remove ();

		if (id !== 'narrator' && id !== 'centered') {
			const { Name, Color } = character;
			$_(`${Monogatari.selector} [data-content="log"]`).append (`
				<div data-spoke="${id}" class="named">
					<span style="color:${Color};">${Monogatari.replaceVariables (Name)} </span>
					<p>${dialog}</p>
				</div>
			`);
		} else {
			$_(`${Monogatari.selector} [data-content="log"]`).append (`<div data-spoke="${id}" class="unnamed"><p>${dialog}</p></div>`);
		}

		const element = $_(`${Monogatari.selector} [data-content="log"]`).get (0);
		element.scrollTop = element.scrollHeight;
	}
}

DialogLog._id = 'DIALOG_LOG';

DialogLog._html = `
	<div data-ui="dialog-log" class="modal">
		<div class="modal__content">
			<div data-content="log">
				<div class="text--center padded" data-string="NoDialogsAvailable">No dialogs available. Dialogs will appear here as they show up.</div>
			</div>
			<button data-action="dialog-log">Close</button>
		</div>
	</div>
`;

Monogatari.registerComponent (DialogLog);