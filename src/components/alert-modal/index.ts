import Component from '../../lib/Component';

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

	async onPropsUpdate (property: string, oldValue: unknown, newValue: unknown) {
		if (property === 'active') {
			if (newValue === true) {
				this.classList.toggle ('modal--active');
			}
		}
	}

	async willMount () {
		this.classList.add ('modal', 'modal--active');
	}

	render () {
		const { message, context, editable, actions } = this.props;
    const key = message as string;

    return `
			<div class="modal__content" data-content="wrapper">
				<p data-string="${key}" data-content="message">${this.engine.string(key)}</p>
				${context ? `${editable ? `<input type="text" data-content="context" value="${context}" />` : `<small data-content="context">${context}</small>`}` : ''}
				${Array.isArray(actions) ? `<div data-content="actions">
					${actions.map (action => `<button data-action="${action.listener}" data-string="${action.label}">${this.engine.string(action.label)}</button>`).join('')}
				</div>` : ''}
			</div>
		`;
	}
}


AlertDialog.tag = 'alert-modal';


export default AlertDialog;