import Component from './Component';
import { Util } from '@aegis-framework/artemis';

class ShadowComponent extends Component {

	constructor (...props) {
		super (...props);

		this._style = {};

		this._shadowDOM = this.attachShadow ({mode: 'open'});

		this._styleElement = document.createElement ('style');

		this._shadowDOM.appendChild (this._styleElement);
	}

	_render () {
		return Util.callAsync (this.render, this).then ((html) => {
			const div = document.createElement ('div');
			if (typeof element === 'string') {
				div.innerHTML = html.trim ();
			} else {
				div.innerHTML = html;
			}
			this._shadowDOM.appendChild (div.firstChild);
		});
	}

	style (style) {
		if (typeof style !== 'undefined') {
			this._style = Object.assign ({}, this._style, style);
		}

		this._styleElement.innerText = JSON.parse (this._style);

		return this._style;
	}
}

export default ShadowComponent;