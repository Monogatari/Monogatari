import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class TextInput extends Component {

	static render (message) {
		return this.html (null, message);
	}
}

TextInput._configuration = {};
TextInput._state = {};
TextInput._id = 'text_input';

TextInput._html = message => `
	<div data-component="text_input" data-ui="input" class="modal modal--active">
		<form  class="modal__content">
			<p data-ui="input-message" >${message}</p>
			<input type="text">
			<small data-ui="warning" class="block"></small>
			<div>
				<button type='submit'>Ok</button>
			</div>
		<form>
	</div>
`;

Monogatari.registerComponent (TextInput);