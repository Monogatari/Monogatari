import { MenuComponent } from './../../lib/MenuComponent';
import { Monogatari } from './../../monogatari';

class QuickMenu extends MenuComponent {

	static init () {
		// Remove the Skip text button if it has been disabled on the game settings
		if (!(this.engine.setting ('Skip') > 0)) {
			this.removeButton ('Skip');
		}
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

QuickMenu.tag = 'quick-menu';

Monogatari.registerComponent (QuickMenu);