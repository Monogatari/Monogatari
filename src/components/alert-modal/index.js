import { Component } from '../../lib/Component';

class AlertDialog extends Component {

	constructor () {
		super ();

		this.props = {
			active: true,
			message: '',
			context: null,
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
				${context ? `${editable ? `<input type="text" data-content="context" value="${context}" />` : `<small data-content="context">${context}</small>`}` : ''}
				${actions ? `<div data-content="actions">
					${actions.map (action => `<button data-action="${action.listener}" data-string="${action.label}">${this.engine.string(action.label)}</button>`).join('')}
				</div>` : ''}
			</div>
		`;
	}
}


AlertDialog.tag = 'alert-modal';


export default AlertDialog;