import { MenuComponent } from './../../lib/MenuComponent';

class QuickMenu extends MenuComponent {

	static init () {
		// Remove the Skip text button if it has been disabled on the game settings
		if (!(this.engine.setting ('Skip') > 0)) {
			this.removeButton ('Skip');
		}
	}

	render () {
		return this.static.buttons ().map ((button) => {
			// A user could create a custom element to display all or specific
			// buttons. If no element was set on the button's definition, we'll
			// assume it to be a simple button.
			if (typeof button.element !== 'string') {
				button.element = 'button';
			}

			const element = document.createElement (button.element);

			if (typeof button.data === 'object') {
				for (const key of Object.keys (button.data)) {
					element.dataset[key] = button.data[key];
				}
			}

			element.setAttribute ('icon', button.icon);
			element.setAttribute ('string', button.string);

			element.innerHTML = `
				<span class="${button.icon}"></span>
				<span data-string="${button.string}">${this.engine.string (button.string)}</span>
			`;

			return element.outerHTML;
		}).join (' ');
	}

}

QuickMenu.tag = 'quick-menu';


export default QuickMenu;