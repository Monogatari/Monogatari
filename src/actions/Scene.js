import { Action } from './../lib/Action';

export class Scene extends Action {

	static setup () {
		this.engine.history ('scene');
		this.engine.history ('sceneElements');

		this.engine.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { scene } = this.engine.state ();
		if (scene !== '') {
			const promise = this.engine.run (scene, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			this.engine.history ('scene').pop ();

			return promise;
		}
		return Promise.resolve ();
	}

	static reset () {
		this.engine.state ({
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
		this.engine.element ().find ('[data-screen="game"] img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		const restoringState = this.engine.global ('_restoring_state');

		return this.engine.run (this._statement.replace('show scene', 'show background'), false).then(() => {
			// Check if the engine is no loading a save file, since loading a file applies the actions on that state
			// asynchronously, there's a chance this would run after a show image/character action and would remove them
			// from the scene, which is something we don't want
			if (restoringState === false) {
				this.engine.history ('sceneElements').push (scene_elements);

				this.engine.element ().find ('[data-character]').remove ();
				this.engine.element ().find ('[data-image]').remove ();
			}

			return Promise.resolve ();
		});
	}

	didApply () {

		this.engine.state ({
			scene: this._statement
		});

		this.engine.history ('scene').push (this._statement);


		if (this.engine.global ('_restoring_state') === false) {
			this.engine.action ('Dialog').reset ();
		}

		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		this.engine.element ().find ('[data-character]').remove ();
		this.engine.element ().find ('[data-image]').remove ();
		return Promise.resolve ();
	}

	revert () {
		return this.engine.revert (this._statement.replace('show scene', 'show background'), false, false).then(() => {
			//this.engine.history ('scene').pop ();

			if (this.engine.history ('scene').length > 0) {
				const last = this.engine.history ('scene')[this.engine.history ('scene').length - 1];

				this.engine.state ({
					scene: last
				});

				if (this.engine.history ('sceneElements').length > 0) {
					const scene_elements = this.engine.history  ('sceneElements').pop ();

					if (typeof scene_elements === 'object') {
						for (const element of scene_elements) {
							this.engine.element ().find ('[data-screen="game"]').append (element);
						}
					}
				}
				return this.engine.action ('Dialog').reset ();
			}
		});
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Scene.id = 'Scene';

export default Scene;