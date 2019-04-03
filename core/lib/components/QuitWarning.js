import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class QuitWarning extends Component {

	static setup (selector) {
		$_(selector).prepend (QuitWarning.html ());
		return Promise.resolve ();
	}
}

QuitWarning._id = 'quit_warning';

QuitWarning._html = `
	<div data-component="quit_warning" data-notice="exit" class="modal">
		<div class="modal__content">
			<p data-string="Confirm">Do you want to quit</p>
			<div>
				<button data-action="quit" data-string="Quit">Quit</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (QuitWarning);