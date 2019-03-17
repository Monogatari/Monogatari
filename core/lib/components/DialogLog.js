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

	static setup (selector) {
		Monogatari.component ('QUICK_MENU').addAfter ('Hide', {
			string: 'Log',
			icon: 'far fa-comments',
			data: {
				action: 'dialog-log'
			}
		});

		$_(`${Monogatari.selector}`).append (this.html ());
	}

	static bind (selector) {

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

	static write ({ id, character: { Name, Color }, dialog }) {

		$_('[data-string="NoDialogsAvailable"]').remove ();

		if (id !== 'narrator') {
			$_(`${Monogatari.selector} [data-content="log"]`).append (`
				<div data-spoke="${id}" class="named row__column--12 row">
					<span style="color:${Color};" class="row__column--4 row__column--phablet--3 row__column--tablet--2">${Monogatari.replaceVariables (Name)} </span>
					<p class="row__column--8 row__column--phablet--9 row__column--tablet--10">${dialog}</p>
				</div>
			`);
		} else {
			$_(`${Monogatari.selector} [data-content="log"]`).append (`<div data-spoke="${id}" class="unnamed row__column--12 row padded"><p class="row__column--12 row__column--offset--4 row__column--offset--phablet--3 row__column--offset--tablet--2">${dialog}</p></div>`);
		}

		const element = $_(`${Monogatari.selector} [data-content="log"]`).get (0);
		element.scrollTop = element.scrollHeight;
	}
}

DialogLog._id = 'DIALOG_LOG';

DialogLog._html = `
	<div data-ui="dialog-log" class="modal">
		<div class="modal__content">
			<div data-content="log" class="row">
				<div class="row__column--12 text--center padded" data-string="NoDialogsAvailable">No dialogs available. Dialogs will appear here as they show up.</div>
			</div>
			<button data-action="dialog-log">Close</button>
		</div>
	</div>
`;

Monogatari.registerComponent (DialogLog);