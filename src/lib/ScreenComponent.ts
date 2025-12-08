import type { Properties } from '@aegis-framework/pandora';
import Component from './Component';


export interface ScreenState extends Properties {
	open: boolean;
}

/**
 * ScreenComponent is a base class for screen-type components.
 * Screens can be opened and closed, with visual state managed automatically.
 *
 * @class ScreenComponent
 * @template P - The type of the component's props (must extend Properties)
 * @template S - The type of the component's state (must extend ScreenState)
 */
class ScreenComponent<
	P extends Properties = Properties,
	S extends ScreenState = ScreenState
> extends Component<P, S> {
	constructor () {
		super();

		// Cast needed because we only initialize base properties
		// Subclasses will add their own properties in their constructor
		this.state = {
			open: false
		} as S;
	}

	async willMount (): Promise<void> {
		this.dataset.screen = (this.constructor as typeof ScreenComponent).tag.replace('-screen', '');
	}

	async onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'open') {
			if (newValue === true) {
				this.classList.add('active');
			} else {
				this.classList.remove('active');
			}
		}
	}

	render (): string {
		return '';
	}
}

export default ScreenComponent;
export { ScreenComponent };
