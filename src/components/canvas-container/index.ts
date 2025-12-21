import type { Properties } from '@aegis-framework/pandora';
import { Util } from '@aegis-framework/artemis';
import Component from '../../lib/Component';

/**
 * Canvas object configuration
 */
export interface CanvasObject {
	start: (engine: unknown, layers: Record<string, HTMLCanvasElement | null>, props: Record<string, unknown>, state: Record<string, unknown>, container: CanvasContainer) => unknown;
	stop: () => void;
	restart: () => void;
	layers: string[];
	state: Record<string, unknown>;
	props: Record<string, unknown>;
}

/**
 * Props for CanvasContainer component
 */
export interface CanvasContainerProps extends Properties {
	mode: string | null;
	canvas: string | null;
	character: string | null;
	object: CanvasObject;
	classes: string[];
}

/**
 * State for CanvasContainer component
 */
export interface CanvasContainerState extends Properties {
	layers: Record<string, HTMLCanvasElement | null>;
}

class CanvasContainer extends Component<CanvasContainerProps, CanvasContainerState> {
	static override tag = 'canvas-container';

	layers: Record<string, HTMLCanvasElement | null>;

	constructor() {
		super();

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

	override onPropsUpdate(_property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		return Promise.resolve();
	}

	override willMount(): Promise<void> {
		const { mode, canvas, classes } = this.props;

		for (const className of classes) {
			if (className) {
				this.classList.add(className);
			}
		}

		if (mode === 'character') {
			this.dataset.character = canvas ?? '';
		}

		return Promise.resolve();
	}

	override didMount(): Promise<void> {
		const { object } = this.props;

		if (Array.isArray(object.layers)) {
			if (object.layers.length > 0) {
				for (const layer of object.layers) {
					this.layers[layer] = this.querySelector(`canvas[data-layer="${layer}"]`);
				}
			}
		} else {
			this.layers.base = this.querySelector('canvas[data-layer="base"]');
		}

		return Util.callAsync(object.start as (...args: unknown[]) => unknown, this.engine, this.layers, object.props, object.state, this) as Promise<void>;
	}

	override render(): string {
		const { object } = this.props;

		let layers = '';

		if (Array.isArray(object.layers)) {
			if (object.layers.length > 0) {
				layers = object.layers.map(l => `<canvas data-layer="${l}"></canvas>`).join('');
			}
		} else {
			layers = '<canvas data-layer="base"></canvas>';
		}

		return `
			<div data-content="wrapper">${layers}</div>
		`;
	}
}

export default CanvasContainer;

