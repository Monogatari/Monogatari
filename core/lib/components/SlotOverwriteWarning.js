import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SlotOverwriteWarning extends Component {

	static setup (selector) {
		$_(selector).prepend (SlotOverwriteWarning.html ());
		return Promise.resolve ();
	}
}

SlotOverwriteWarning._id = 'slot_overwrite_warning';

SlotOverwriteWarning._html = `
	<div data-notice="slot-overwrite" class="modal">
		<div class="modal__content">
			<p data-string="SlotOverwrite"">Are you sure you want to overwrite this slot?</p>
			<input type="text" name="name" class="margin" required>
			<div>
				<button data-action="overwrite-slot" data-string="Overwrite">Overwrite</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (SlotOverwriteWarning);