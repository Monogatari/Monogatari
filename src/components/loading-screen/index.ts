import { ScreenComponent } from '../../lib/ScreenComponent';

class LoadingScreen extends ScreenComponent {
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

	didMount (): Promise<void> {
		
		(this.engine as any).on('willPreloadAssets', () => {
			this.setState({
				open: true
			});
		});

		
		(this.engine as any).on('assetQueued', () => {
			const max = (this.props as { max: number }).max;
			this.setProps({
				max: max + 1
			});
		});

		
		(this.engine as any).on('didPreloadAssets', () => {
			this.setState({
				open: false
			});
		});

		
		(this.engine as any).on('assetLoaded', () => {
			const progress = (this.state as { progress: number }).progress;
			this.setState({
				progress: progress + 1
			});
		});
		return Promise.resolve();
	}

	override onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		super.onStateUpdate(property, oldValue, newValue);
		if (property === 'progress') {
			this.content('progress').value(newValue as string);
		}
		return Promise.resolve();
	}

	onPropsUpdate (property: string, _oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'max') {
			this.content('progress').attribute('max', newValue as number);
		}
		return Promise.resolve();
	}

	render (): string {
		return `
			<div data-content="wrapper">
				<h2 data-string="Loading" data-content="title">Loading</h2>
				<progress value="0" max="100" data-content="progress"></progress>
				<small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
			</div>
		`;
	}
}

LoadingScreen.tag = 'loading-screen';

export default LoadingScreen;
