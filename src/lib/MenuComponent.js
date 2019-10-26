import { Component } from './Component';

class MenuComponent extends Component {

	static addButton (button) {
		this.engine.configuration (this.tag, {
			buttons: [...this.buttons (), button]
		});

		this.onConfigurationUpdate ();
	}

	static addButtonAfter (after, button) {
		const index = this.buttons ().findIndex (b => b.string === after);
		const buttons = [...this.buttons ()];

		if (index > -1) {
			buttons.splice (index + 1, 0, button);

			this.engine.configuration (this.tag, {
				buttons
			});

			this.onConfigurationUpdate ();
		}
	}

	static addButtonBefore (before, button) {
		const index = this.buttons ().findIndex (b => b.string === before);
		const buttons = [...this.buttons ()];

		if (index > -1) {
			buttons.splice (index + 1, 0, button);

			this.engine.configuration (this.tag, {
				buttons
			});

			this.onConfigurationUpdate ();
		}
	}

	static removeButton (string) {
		this.engine.configuration (this.tag, {
			buttons: this.buttons ().filter ((button) => button.string !== string)
		});

		this.onConfigurationUpdate ();
	}

	static buttons () {
		return this.engine.configuration (this.tag).buttons;
	}

	static button (string) {
		return this.buttons ().find ((button) => button.string === string);
	}

	static onConfigurationUpdate () {
		const elements = document.querySelectorAll (this.tag);

		for (const element of elements) {
			if (element instanceof Component) {
				element.innerHTML = element.render ();
			}
		}

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

			return element.outerHTML;
		}).join (' ');
	}
}

MenuComponent.tag = 'lib-menu-component';

export { MenuComponent };