import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class TextBox extends Component {

	render () {
		return `
			<img data-ui="face" alt="" data-content="character_expression">
			<span data-ui="who" data-content="character_name"></span>
			<p data-ui="say" data_content="dialog"></p>
		`;
	}
}

TextBox._id = 'text-box';

Monogatari.registerComponent (TextBox);