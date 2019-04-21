import MenuComponent from './../../lib/MenuComponent';
import { Monogatari } from './../../monogatari';

class MainMenu extends MenuComponent {

	static shouldRollback () {
		return Promise.resolve ();
	}

	static willRollback () {
		return Promise.resolve ();
	}

	createButton (button) {
		const element = super.createButton (button);
		element.innerHTML = `
			<span class="${button.icon}"></span>
			<span data-string="${button.string}">${Monogatari.string (button.string)}</span>
		`;
		return element;
	}

}

MainMenu._configuration = {
	buttons: [
		{
			string: 'Start',
			data: {
				action: 'start'
			}
		},
		{
			string: 'Load',
			data: {
				action: 'open-screen',
				open: 'load'
			}
		},
		{
			string: 'Settings',
			data: {
				action: 'open-screen',
				open: 'settings'
			}
		},
		{
			string: 'Help',
			data: {
				action: 'open-screen',
				open: 'help'
			}
		}
	]
};

MainMenu._id = 'main-menu';

Monogatari.registerComponent (MainMenu);