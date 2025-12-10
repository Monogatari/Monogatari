import { Component } from './Component';
import type { MenuButton } from './types';

/**
 * MenuComponent is a base class for menu-type components.
 * Menus manage a collection of buttons that can be dynamically added, removed, or reordered.
 *
 * @class MenuComponent
 */
class MenuComponent extends Component {
	/**
	 * Add a button to the menu
	 */
	static addButton (button: MenuButton): void {
		this.engine.configuration(this.tag, {
			buttons: [...this.buttons(), button]
		});

		this.onConfigurationUpdate();
	}

	/**
	 * Add a button after another button
	 */
	static addButtonAfter (after: string, button: MenuButton): void {
		const index = this.buttons().findIndex((b: MenuButton) => b.string === after);
		const buttons = [...this.buttons()];

		if (index > -1) {
			buttons.splice(index + 1, 0, button);

			this.engine.configuration(this.tag, {
				buttons
			});

			this.onConfigurationUpdate();
		}
	}

	/**
	 * Add a button before another button
	 */
	static addButtonBefore (before: string, button: MenuButton): void {
		const index = this.buttons().findIndex((b: MenuButton) => b.string === before);
		const buttons = [...this.buttons()];

		if (index > -1) {
			buttons.splice(index, 0, button);

			this.engine.configuration(this.tag, {
				buttons
			});

			this.onConfigurationUpdate();
		}
	}

	/**
	 * Remove a button by its string identifier
	 */
	static removeButton (string: string): void {
		this.engine.configuration(this.tag, {
			buttons: this.buttons().filter((button: MenuButton) => button.string !== string)
		});

		this.onConfigurationUpdate();
	}

	/**
	 * Get all buttons
	 */
	static buttons (): MenuButton[] {
		const config = this.engine.configuration(this.tag) as { buttons: MenuButton[] };
		return config.buttons;
	}

	/**
	 * Find a button by its string identifier
	 */
	static button (string: string): MenuButton | undefined {
		return this.buttons().find((button: MenuButton) => button.string === string);
	}

	/**
	 * Called when configuration is updated - re-renders all instances
	 */
	static onConfigurationUpdate (): Promise<void> {
		const elements = document.querySelectorAll(this.tag);

		for (const element of elements) {
			if (element instanceof Component) {
				element.innerHTML = element.render() as string;
			}
		}

		return Promise.resolve();
	}

	/**
	 * Render the menu buttons
	 */
	render (): string {
		const staticContext = this.constructor as typeof MenuComponent;
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

			return element.outerHTML;
		}).join(' ');
	}
}

MenuComponent.tag = 'lib-menu-component';

export { MenuComponent };



