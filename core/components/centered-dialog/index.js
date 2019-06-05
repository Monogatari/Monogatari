import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class CenteredDialog extends Component {

	constructor () {
		super ();
	}

	willRollback () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove ();
		return Promise.resolve ();
	}

	onReset () {
		this.remove ();
		return Promise.resolve ();
	}

	willMount () {
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	render () {
		return `
			<div data-content="wrapper"></div>
		`;
	}
}

CenteredDialog.tag = 'centered-dialog';


Monogatari.registerComponent (CenteredDialog);