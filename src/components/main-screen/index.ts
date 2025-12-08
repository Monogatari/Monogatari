import { ScreenComponent } from '../../lib/ScreenComponent';

class MainScreen extends ScreenComponent {

	override onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'open') {
			if (newValue === true) {
				this.engine.playAmbient();
			} else {
				if ((this.engine.global('playing') as boolean) === true) {
					this.engine.stopAmbient();
				}
			}
		}
		return super.onStateUpdate(property, oldValue, newValue);
	}
}

MainScreen.tag = 'main-screen';

export default MainScreen;
