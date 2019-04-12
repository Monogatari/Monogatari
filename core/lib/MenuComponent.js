import Component from './Component';

class MenuComponent extends Component {

	static addButton (button) {
		this.buttons ().push (button);
		this.onConfigurationUpdate ();
	}

	static addButtonAfter (after, button) {
		const index = this.buttons ().findIndex (b => b.string === after);

		if (index > -1) {
			this.buttons ().splice (index + 1, 0, button);
			this.onConfigurationUpdate ();
		}
	}

	static addButtonBefore (before, button) {
		const index = this.buttons ().findIndex (b => b.string === before);

		if (index > -1) {
			this.buttons ().splice (index, 0, button);
			this.onConfigurationUpdate ();
		}
	}

	static removeButton (string) {
		this._configuration.buttons = this.buttons ().filter ((button) => button.string !== string);
		this.onConfigurationUpdate ();
	}

	static buttons () {
		return this._configuration.buttons;
	}

	static button (string) {
		return this.buttons ().find ((button) => button.string === string);
	}

	static onConfigurationUpdate () {
		const elements = document.querySelectorAll (this._id);

		for (const element of elements) {
			element.innerHTML = element.render ();
		}
	}

	render () {
		return this.constructor.buttons ().map ((button) => this.createButton (button).outerHTML).join (' ');
	}

	createButton (button) {
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

		return element;
	}
}

MenuComponent._configuration = {
	buttons: [],
};

export default MenuComponent;