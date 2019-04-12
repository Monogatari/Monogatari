import ShadowComponent from './ShadowComponent';

class ModalComponent extends ShadowComponent {

	constructor () {
		super();

		this._state = {
			open: false
		};
	}

	update (origin, property, oldValue, newValue) {
		super.update (origin, property, oldValue, newValue);

		if (origin === 'state' && property === 'open') {
			this.classList.toggle ('modal--active');
		}
	}

	render () {
		return `
			<div class="modal">
				<div class="modal--content">
					<slot></slot>
				</div>
			</div>
		`;
	}
}

export default ModalComponent;