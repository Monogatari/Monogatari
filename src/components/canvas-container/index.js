import { Component } from '../../lib/Component';
import { Util } from '@aegis-framework/artemis';

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
				restart: () => {}
			},
			classes: [],
			selector: null,
		};

		this.canvas = null;
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

		return Promise.resolve ();
	}

	didMount () {
		const { mode, canvas, object, classes } = this.props;

		this.canvas = this.querySelector ('canvas');

		return Util.callAsync (object.start, this.engine, this.canvas, this.element ());
	}

	render () {
		const { mode, canvas, object, classes } = this.props;

		return `
			<div data-content="wrapper">
				<canvas data-canvas="${canvas}" data-mode="${mode}" ${ mode === 'character' ? `data-character="${canvas}"`: '' } data-content="canvas"></canvas>
			</div>
		`;
	}
}


CanvasContainer.tag = 'canvas-container';


export default CanvasContainer;