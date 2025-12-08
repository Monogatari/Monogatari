import { MenuComponent } from './../../lib/MenuComponent';

class QuickMenu extends MenuComponent {
  static override tag = 'quick-menu';

	static async init () {
    const skipSpeed = this.engine.setting('Skip') as number;
    const allowRollback = this.engine.setting('AllowRollback') as boolean;

		// Remove the Skip text button if it has been disabled on the game settings
		if (skipSpeed <= 0) {
			this.removeButton('Skip');
		}

    // Remove the Back button if it has been disabled on the game settings
		if (!allowRollback) {
			this.removeButton('Back');
		}
	}

	render () {
		const buttons = (this.constructor as typeof QuickMenu).buttons ();

		return buttons.map ((button) => {
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
			element.setAttribute ('tabindex', '0');

			element.innerHTML = `
				<span class="${button.icon}"></span>
				<span data-string="${button.string}">${this.engine.string (button.string)}</span>
			`;

			return element.outerHTML;
		}).join (' ');
	}
}

export default QuickMenu;
