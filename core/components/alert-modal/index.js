import Component from '../../lib/Component';
import { Monogatari } from '../../monogatari';

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

	onPropsUpdate (property, oldValue, newValue) {
		if (property === 'active') {
			if (newValue === true) {
				this.classList.toggle ('modal--active');
			}
		}
		return Promise.resolve ();
	}

	willMount () {
		this.classList.add ('modal', 'modal--active');
		return Promise.resolve ();
	}

	render () {
		const { message, context, editable, actions } = this.props;
		return `
			<div class="modal__content" data-content="wrapper">
				<p data-string="${message}" data-content="message">${this.engine.string(message)}</p>
				${context ? `<small data-content="context" ${editable ? 'contenteditable="true"' : ''}>${context}</small>` : ''}
				${actions ? `<div data-content="actions">
					${actions.map (action => `<button data-action="${action.listener}" data-string="${action.label}">${this.engine.string(action.label)}</button>`).join('')}
				</div>` : ''}
			</div>
		`;
	}
}


AlertDialog._id = 'alert-modal';

Monogatari.registerComponent (AlertDialog);