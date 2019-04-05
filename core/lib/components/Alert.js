import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class Alert extends Component {
	static render (id, options) {
		return this.html (null, id, options);
	}
}

Alert._id = 'alert';

Alert._html = (id, { message, context, editable, actions }) => `
	<div data-component="alert" data-alert="${id}" class="modal modal--active">
		<div class="modal__content" data-content="wrapper">
			<p data-string="${message}" data-content="message">${Monogatari.string(message)}</p>
			${ context ? `<small data-content="context" ${editable ? 'contenteditable="true"' : ''}>${context}</small>` : ''}
			${actions ? `<div data-content="actions">
				${actions.map (action => `<button data-action="${action.listener}" data-string="${action.label}">${Monogatari.string(action.label)}</button>`).join('')}
			</div>` : ''}
		</div>
	</div>
`;

Monogatari.registerComponent (Alert);