import ScreenComponent from '../../lib/ScreenComponent';

class LoadScreen extends ScreenComponent {
  static override tag = 'load-screen';

	override render (): string {

		const engine = this.engine;

		const autoSaveInterval = engine.setting('AutoSave');

		const autoSaveEnabled = typeof autoSaveInterval === 'number' && autoSaveInterval > 0 ;

		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<h2 data-string="Load">Load</h2>
			<div data-ui="saveSlots">
				<h3 data-string="LoadSlots">Saved Games</h3>
				<div data-ui="slots">
					<slot-container label="${engine.setting('SaveLabel')}" type="load"></slot-container>
				</div>
			</div>
			${autoSaveEnabled ? `<div data-ui="autoSaveSlots">
				<h3 data-string="LoadAutoSaveSlots">Auto Saved Games</h3>
				<div data-ui="slots" data-content="slots">
					<slot-container label="${engine.setting('AutoSaveLabel')}" type="load"></slot-container>
				</div>
			</div>` : ''}
		`;
	}
}

export default LoadScreen;
