import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class QuickMenu extends Component {

	static setup () {
		this.render ();
		return Promise.resolve ();
	}

	static add ({ string, icon, data, ...rest }) {
		this.buttons ().push ({
			string,
			icon,
			data,
			...rest
		});
		this.render ();
	}

	static addAfter (after, { string, icon, data, ...rest }) {
		let index = null;
		for (let i = 0; i < this.buttons ().length; i++) {
			const button = this.buttons ()[i];
			if (button.string === after) {
				index = i + 1;
				break;
			}
		}
		if (index !== null) {
			this.buttons ().splice (index, 0, {
				string,
				icon,
				data,
				...rest
			});
		}
	}

	static addBefore (before, { string, icon, data, ...rest }) {
		let index = null;
		for (let i = 0; i < this.buttons ().length; i++) {
			const button = this.buttons ()[i];
			if (button.string === before) {
				index = i;
				break;
			}
		}
		if (index !== null) {
			this.buttons ().splice (index, 0, {
				string,
				icon,
				data,
				...rest
			});
		}
	}

	static remove (string) {
		this._configuration.buttons = this.buttons ().filter ((button) => button.string !== string);
		this.render ();
	}

	static buttons () {
		return this._configuration.buttons;
	}

	static button (string) {
		return this.buttons ().find ((button) => button.string === string);
	}

	static render () {
		this.element ().html ('');
		this.element ().html (this.buttons ().map ((button) => {
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
QuickMenu._id = 'quick-menu';

QuickMenu._html = '';

Monogatari.registerComponent (QuickMenu);