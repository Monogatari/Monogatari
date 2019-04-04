import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class OrientationWarning extends Component {

	static setup (selector) {
		$_(selector).prepend (OrientationWarning.html ());
		return Promise.resolve ();
	}
}

OrientationWarning._configuration = {};
OrientationWarning._state = {};
OrientationWarning._id = 'orientation_warning';

OrientationWarning._html = `
	<div data-component="orientation_warning" data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>
`;

Monogatari.registerComponent (OrientationWarning);