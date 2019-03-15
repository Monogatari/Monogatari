import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class QuickMenu extends Component {

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static setup () {
		QuickMenu.render ();
		return Promise.resolve ();
	}

	static add ({ string, icon, data, ...rest }) {
		QuickMenu._configuration.buttons.push ({
			string,
			icon,
			data,
			...rest
		});
		QuickMenu.render ();
	}

	static addAfter (after, { string, icon, data, ...rest }) {
		let index = null;
		for (let i = 0; i < QuickMenu._configuration.buttons.length; i++) {
			const button = QuickMenu._configuration.buttons[i];
			if (button.string === after) {
				index = i + 1;
				break;
			}
		}
		if (index !== null) {
			QuickMenu._configuration.buttons.splice (index, 0, {
				string,
				icon,
				data,
				...rest
			});
		}
	}

	static addBefore (before, { string, icon, data, ...rest }) {
		let index = null;
		for (let i = 0; i < QuickMenu._configuration.buttons.length; i++) {
			const button = QuickMenu._configuration.buttons[i];
			if (button.string === before) {
				index = i;
				break;
			}
		}
		if (index !== null) {
			QuickMenu._configuration.buttons.splice (index, 0, {
				string,
				icon,
				data,
				...rest
			});
		}
	}

	static remove (string) {
		QuickMenu._configuration.buttons = QuickMenu._configuration.buttons.filter ((button) => button.string !== string);
		QuickMenu.render ();
	}

	static buttons () {

	}

	static button (string) {
		return QuickMenu._configuration.buttons.find ((button) => button.string === string);
	}

	static render () {
		$_(`${Monogatari.selector} [data-screen="game"] [data-ui="quick-menu"]`).html ('');
		$_(`${Monogatari.selector} [data-screen="game"] [data-ui="quick-menu"]`).html (QuickMenu._configuration.buttons.map ((button) => {
			const data = Object.keys (button.data).map ((key) => `data-${key}="${button.data[key]}"`).join (' ');

			return `<button ${data}>
						<span class="${button.icon}" ${data}></span>
						<span data-string="${button.string}" ${data}>${Monogatari.string (button.string)}</span>
					</button>`;
		}).join (' '));
	}
}

QuickMenu._configuration = {
	buttons: [
		{
			string: 'Back',
			icon: 'fas fa-arrow-left',
			data: {
				action: 'back'
			}
		},
		{
			string: 'Hide',
			icon: 'fas fa-eye',
			data: {
				action: 'distraction-free'
			}
		},
		{
			string: 'AutoPlay',
			icon: 'fas fa-play-circle',
			data: {
				action: 'auto-play'
			}
		},
		{
			string: 'Skip',
			icon: 'fas fa-fast-forward',
			data: {
				action: 'skip'
			}
		},
		{
			string: 'Save',
			icon: 'fas fa-save',
			data: {
				action: 'open-screen',
				open: 'save'
			}
		},
		{
			string: 'Load',
			icon: 'fas fa-undo',
			data: {
				action: 'open-screen',
				open: 'load'
			}
		},
		{
			string: 'Settings',
			icon: 'fas fa-cog',
			data: {
				action: 'open-screen',
				open: 'settings'
			}
		},
		{
			string: 'Quit',
			icon: 'fas fa-times-circle',
			data: {
				action: 'end'
			}
		}
	]
};
QuickMenu._state = {};
QuickMenu._id = 'QUICK_MENU';

QuickMenu._html = '';

Monogatari.registerComponent (QuickMenu);