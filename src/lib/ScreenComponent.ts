import { Component } from './Component';


interface ScreenState extends Record<string, unknown> {
	open: boolean;
}

/**
 * ScreenComponent is a base class for screen-type components.
 * Screens can be opened and closed, with visual state managed automatically.
 *
 * @class ScreenComponent
 */
class ScreenComponent extends Component {
	constructor () {
		super();

		this.state = {
			open: false
		};
	}

	willMount (): Promise<void> {
		this.dataset.screen = (this.constructor as typeof ScreenComponent).tag.replace('-screen', '');
		return Promise.resolve();
	}

	onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'open') {
			if (newValue === true) {
				this.classList.add('active');
			} else {
				this.classList.remove('active');
			}
		}
		return Promise.resolve();
	}

	render (): string {
		return '';
	}
}

export { ScreenComponent };

export type { ScreenState };

