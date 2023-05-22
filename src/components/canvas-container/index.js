import { Component } from '../../lib/Component';
import { Util } from '@aegis-framework/artemis/index';

class CanvasContainer extends Component {

	constructor () {
		super ();

		this.props = {
			mode: null,
			canvas: null,
			character: null,
			object: {
				start: () => {},
				stop: () => {},
				restart: () => {},
				layers: [],
				state: {},
				props: {}
			},
			classes: []
		};

		this.layers = {};
	}

	onPropsUpdate (property, oldValue, newValue) {
		return Promise.resolve ();
	}

	willMount () {
		const { mode, canvas, object, classes } = this.props;

		for (const className of classes) {
			if (className) {
				this.classList.add (className);
			}
		}

		if (mode === 'character') {
			this.dataset.character = canvas;
		}

		return Promise.resolve ();
	}

	didMount () {
		const { mode, canvas, object, classes } = this.props;

		if ( Array.isArray (object.layers)) {
			if (object.layers.length > 0) {
				for (const layer of object.layers) {
					this.layers[layer] = this.querySelector (`canvas[data-layer="${layer}"]`);
				}
			}
		} else {
			this.layers.base = this.querySelector ('canvas[data-layer="base"]');
		}

		return Util.callAsync (object.start, this.engine, this.layers, object.props, object.state, this);
	}

	render () {
		const { object } = this.props;

		let layers = '';

		if ( Array.isArray (object.layers)) {
			if (object.layers.length > 0) {
				layers = object.layers.map (l => `<canvas data-layer="${l}"></canvas>`).join ('');
			}
		} else {
			layers = '<canvas data-layer="base"></canvas>';
		}

		return `
			<div data-content="wrapper">${layers}</div>
		`;
	}
}


CanvasContainer.tag = 'canvas-container';


export default CanvasContainer;