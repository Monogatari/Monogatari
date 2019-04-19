import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';

class LoadScreen extends ScreenComponent {
	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts.
	 *
	 * @return {Promise}
	 */
	static onStart () {
		// if (Monogatari.setting ('AutoSave') != 0 && typeof Monogatari.setting ('AutoSave') === 'number') {
		// 	Monogatari.debug.debug ('Automatic save is enabled, setting up timeout');
		// 	Monogatari.global ('_AutoSaveInterval', setInterval(function () {
		// 		Monogatari.debug.groupCollapsed ('Automatic Save');
		// 		const id = Monogatari.global ('currentAutoSaveSlot');

		// 		Monogatari.debug.debug ('Saving data to slot', id);

		// 		Monogatari.saveTo ('AutoSaveLabel', id).then (({ key, value }) => {
		// 			Monogatari.element ().find (`[data-screen='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-slot='${key}'] small`).text (value.name);
		// 			Monogatari.element ().find (`[data-screen='save'] [data-ui='slots'] [data-save='${key}'] small`).text (value.name);
		// 			LoadScreen.setAutoSlots ();
		// 		});

		// 		if (Monogatari.global ('currentAutoSaveSlot') === Monogatari.setting ('Slots')) {
		// 			Monogatari.global ('currentAutoSaveSlot', 1);
		// 		} else {
		// 			Monogatari.global ('currentAutoSaveSlot', Monogatari.global ('currentAutoSaveSlot') + 1);
		// 		}

		// 		Monogatari.debug.groupEnd ('Automatic Save');

		// 	}, Monogatari.setting ('AutoSave') * 60000));
		// } else {
		// 	Monogatari.debug.debug ('Automatic save is disabled. Section will be hidden from Load Screen');
		// 	Monogatari.element ().find ('[data-screen="load"] [data-ui="autoSaveSlots"]').hide ();
		// }
		return Promise.resolve ();
	}

	static onReset () {
		clearInterval (this.engine.global ('_AutoSaveInterval'));
		return Promise.resolve ();
	}

	static setup (selector) {
		this.engine.global ('_AutoSaveInterval', null);
		return Promise.resolve ();
	}

	static bind (selector) {


		return Promise.resolve ();
	}


	render () {
		return `
			<button class="fas fa-arrow-left top left" data-action="back"></button>
			<h2 data-string="Load">Load</h2>
			<div data-ui="saveSlots">
				<h3 data-string="LoadSlots">Saved Games</h3>
				<div data-ui="slots" class="row row--spaced padded">
					<slot-list label="${this.engine.setting ('SaveLabel')}" type="load"></slot-list>
				</div>
			</div>
			<div data-ui="autoSaveSlots">
				<h3 data-string="LoadAutoSaveSlots">Auto Saved Games</h3>
				<div data-ui="slots" data-content="slots" class="row row--spaced padded">
					<slot-list label="${this.engine.setting ('AutoSaveLabel')}" type="load"></slot-list>
				</div>
			</div>
		`;
	}
}

LoadScreen._id = 'load-screen';

Monogatari.registerComponent (LoadScreen);