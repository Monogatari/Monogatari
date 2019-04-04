import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SlotDeletionWarning extends Component {

	static setup (selector) {
		$_(selector).prepend (SlotDeletionWarning.html ());
		return Promise.resolve ();
	}
}

SlotDeletionWarning._id = 'slot_deletion_warning';

SlotDeletionWarning._html = `
	<div data-component="slot_deletion_warning" data-notice="slot-deletion" class="modal">
		<div class="modal__content">
			<p data-string="SlotDeletion">Are you sure you want to delete this slot?</p>
			<p><small></small></p>
			<div>
				<button data-action="delete-slot" data-string="Delete">Delete</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (SlotDeletionWarning);