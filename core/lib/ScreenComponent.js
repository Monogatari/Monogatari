import Component from './Component';

class ScreenComponent extends Component {

	constructor () {
		super();

		this.state = {
			open: false
		};
	}

	willMount () {
		this.dataset.screen = this.constructor.tag.replace ('-screen', '');
		return Promise.resolve ();
	}

	onStateUpdate (property, oldValue, newValue) {
		if (property === 'open') {
			if (newValue === true) {
				this.classList.add ('active');
			} else {
				this.classList.remove ('active');
			}
		}
		return Promise.resolve ();
	}

	render () {
		return '';
	}
}

export default ScreenComponent;