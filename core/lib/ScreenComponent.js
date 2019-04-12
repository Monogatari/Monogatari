import Component from './Component';

class ScreenComponent extends Component {

	constructor () {
		super();

		this._state = {
			open: false
		};
	}

	connectedCallback () {
		super.connectedCallback ();
		this.dataset.screen = this.constructor._id.replace ('-screen', '');
	}

	update (origin, property, oldValue, newValue) {
		super.update (origin, property, oldValue, newValue);
		console.log (origin, property);
		if (origin === 'state' && property === 'open') {
			if (newValue) {
				this.style.display = 'flex';
			} else {
				this.style.display = 'none';
			}
		}
	}

	render () {
		return '';
	}
}

export default ScreenComponent;