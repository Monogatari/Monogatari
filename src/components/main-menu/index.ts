import type { Properties } from '@aegis-framework/pandora';
import { MenuComponent } from '../../lib/MenuComponent';
import type { MenuButton } from '../../lib/types';

class MainMenu extends MenuComponent<Properties, Properties> {
	static override tag = 'main-menu';

	override render(): string {
		const staticContext = this.constructor as typeof MainMenu;
		return staticContext.buttons().map((button: MenuButton) => {
			// A user could create a custom element to display all or specific
			// buttons. If no element was set on the button's definition, we'll
			// assume it to be a simple button.
			if (typeof button.element !== 'string') {
				button.element = 'button';
			}

			const element = document.createElement(button.element);

			if (typeof button.data === 'object') {
				for (const key of Object.keys(button.data)) {
					element.dataset[key] = button.data[key];
				}
			}

			element.setAttribute('icon', button.icon);
			element.setAttribute('string', button.string);

			element.setAttribute('tabindex', '0');

			element.innerHTML = `
				<span class="${button.icon}"></span>
				<span data-string="${button.string}">${this.engine.string(button.string)}</span>
			`;

			return element.outerHTML;
		}).join(' ');
	}
}

export default MainMenu;

