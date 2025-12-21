import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
import type { Properties } from '@aegis-framework/pandora';

interface LoadingScreenProps extends Properties {
	max: number;
}

interface LoadingScreenState extends ScreenState {
	progress: number;
}

class LoadingScreen extends ScreenComponent<LoadingScreenProps, LoadingScreenState> {
  static override tag = 'loading-screen';
	constructor () {
		super();

		this.props = {
			max: 0
		};

		this.state = {
			open: false,
			progress: 0
		};
	}

	override async didMount() {
    const engine = this.engine;

		engine.on('willPreloadAssets', () => this.setState({ open: true }));
		engine.on('assetQueued', () => this.setProps({ max: this.props.max + 1 }));
    engine.on('didPreloadAssets', () => this.setState({ open: false }));
		engine.on('assetLoaded', () => this.setState({ progress: this.state.progress + 1 }));
	}

	override async onStateUpdate (property: string, oldValue: unknown, newValue: unknown) {
		super.onStateUpdate(property, oldValue, newValue);

		if (property === 'progress') {
			this.content('progress').value(newValue as string);
		}
	}

	override async onPropsUpdate (property: string, _oldValue: unknown, newValue: unknown) {
		if (property === 'max') {
			this.content('progress').attribute('max', newValue as number);
		}
	}

	override render (): string {
		return `
			<div data-content="wrapper">
				<h2 data-string="Loading" data-content="title">Loading</h2>
				<progress value="0" max="100" data-content="progress"></progress>
				<small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
			</div>
		`;
	}
}

export default LoadingScreen;
