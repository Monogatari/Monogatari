import { ScreenComponent } from './../../lib/ScreenComponent';

class MainScreen extends ScreenComponent {
	onStateUpdate (property, oldValue, newValue) {
		if (property === 'open') {
			if (newValue === true) {
				this.engine.playAmbient ();
			} else {
				this.engine.stopAmbient ();
			}
		}
		return super.onStateUpdate(property, oldValue, newValue);
	}
}

MainScreen.tag = 'main-screen';


export default MainScreen;