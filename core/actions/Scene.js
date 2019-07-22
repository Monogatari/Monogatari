import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

export class Scene extends Action {

	static setup () {
		Monogatari.history ('scene');
		Monogatari.history ('sceneElements');

		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { scene } = Monogatari.state ();
		if (scene !== '') {
			Monogatari.run (scene, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('scene').pop ();
		}
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.state ({
			scene: ''
		});

		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'scene';
	}

	constructor ([ show, type, scene, ...classes ]) {
		super ();
		this.scene = scene;
	}

	willApply () {
		return Promise.resolve ();
	}

	apply () {
		const scene_elements = [];
		Monogatari.element ().find ('[data-screen="game"] img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		return Monogatari.run (this._statement.replace('show scene', 'show background'), false).then(() => {
			Monogatari.history ('sceneElements').push (scene_elements);

			Monogatari.element ().find ('[data-character]').remove ();
			Monogatari.element ().find ('[data-image]').remove ();
		});
	}

	didApply () {

		Monogatari.state ({
			scene: this._statement
		});

		Monogatari.history ('scene').push (this._statement);

		Monogatari.action ('Dialog').reset ();

		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		Monogatari.element ().find ('[data-character]').remove ();
		Monogatari.element ().find ('[data-image]').remove ();
		return Promise.resolve ();
	}

	revert () {
		return Monogatari.revert (this._statement.replace('show scene', 'show background'), false, false).then(() => {
			//Monogatari.history ('scene').pop ();

			if (Monogatari.history ('scene').length > 0) {
				const last = Monogatari.history ('scene')[Monogatari.history ('scene').length - 1];

				Monogatari.state ({
					scene: last
				});

				if (Monogatari.history ('sceneElements').length > 0) {
					const scene_elements = Monogatari.history  ('sceneElements').pop ();

					if (typeof scene_elements === 'object') {
						for (const element of scene_elements) {
							Monogatari.element ().find ('[data-screen="game"]').append (element);
						}
					}
				}
				return Monogatari.action ('Dialog').reset ();
			}
		});
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Scene.id = 'Scene';

Monogatari.registerAction (Scene, true);