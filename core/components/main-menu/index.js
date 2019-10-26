import { MenuComponent } from './../../lib/MenuComponent';

class MainMenu extends MenuComponent {

	static shouldRollback () {
		return Promise.resolve ();
	}

	static willRollback () {
		return Promise.resolve ();
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

MainMenu.tag = 'main-menu';


export default MainMenu;