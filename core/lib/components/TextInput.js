import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class TextInput extends Component {

	static render (message) {
		return this.html (null, message);
	}

}

TextInput._id = 'text-input';

TextInput._html = message => `
	<div data-component="text-input" data-ui="input" class="modal modal--active">
		<form  class="modal__content">
			<p data-content="message" >${message}</p>
			<input data-content="field" type="text">
			<small data-content="warning" class="block"></small>
			<div>
				<button type='submit'>Ok</button>
			</div>
		<form>
	</div>
`;

Monogatari.registerComponent (TextInput);