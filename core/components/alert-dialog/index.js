import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class AlertDialog extends Component {

	constructor () {
		super ();

		this._props = {
			active: true,
			message: '',
			context: '',
			editable: false,
			actions: []
		};
	}

	update (origin, property, oldValue, newValue) {
		if (origin === 'props' && property === 'active') {
			if (newValue === true) {
				this.classList.toggle ('modal--active');
			}
		}
	}

	willMount () {
		this.classList.add ('modal');
		return Promise.resolve ();
	}

	render () {
		const { message, context, editable, actions } = this.props;
		return `
			<div class="modal__content" data-content="wrapper">
				<p data-string="${message}" data-content="message">${Monogatari.string(message)}</p>
				${context ? `<small data-content="context" ${editable ? 'contenteditable="true"' : ''}>${context}</small>` : ''}
				${actions ? `<div data-content="actions">
					${actions.map (action => `<button data-action="${action.listener}" data-string="${action.label}">${Monogatari.string(action.label)}</button>`).join('')}
				</div>` : ''}
			</div>
		`;
	}
}


AlertDialog._id = 'alert-dialog';

Monogatari.registerComponent (AlertDialog);