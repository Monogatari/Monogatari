import { $_ } from '@aegis-framework/artemis';
import { Action } from './../lib/Action';

export class Scene extends Action {

	static setup () {
		this.engine.history ('scene');
		this.engine.history ('sceneElements');
		this.engine.history ('sceneState');

		this.engine.state ({
			scene: ''
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const sceneState = this.engine.history ('sceneState');
		const sceneElements = this.engine.history ('sceneElements');

		if (sceneState.length !== sceneElements.length) {
			const states = sceneElements.map ((elements) => {
				if (elements.length > 0) {
					return {
						characters: elements.filter(element => element.indexOf ('data-character=') > -1).map ((element) => {
							const div = document.createElement ('div');
							div.innerHTML =  element;
							const image = $_(div.firstChild);
							const classes = image.get(0).classList.toString ().replace ('animated', '').trim ();
							return `show character ${image.data('character')} ${image.data('sprite')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
						}),
						images: elements.filter(element => element.indexOf ('data-image=') > -1).map ((element) => {
							const div = document.createElement ('div');
							div.innerHTML =  element;
							const image = $_(div.firstChild);
							const classes = image.get(0).classList.toString ().replace ('animated', '').trim ();
							return `show image ${image.data('image')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
						}),
					};
				}

				return {
					characters: [],
					images: []
				};
			});

			for (const state of states) {
				this.engine.history ('sceneState').push (state);
			}
		}

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

		const selectors = [
			'[data-screen="game"] [data-character]:not([data-visibility="invisible"])',
			'[data-screen="game"] [data-image]:not([data-visibility="invisible"])'
		];

		this.engine.element ().find (selectors.join (',')).each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		const restoringState = this.engine.global ('_restoring_state');

		return this.engine.run (this._statement.replace('show scene', 'show background'), false).then(() => {
			// Check if the engine is no loading a save file, since loading a file applies the actions on that state
			// asynchronously, there's a chance this would run after a show image/character action and would remove them
			// from the scene, which is something we don't want
			if (restoringState === false) {
				this.engine.history ('sceneElements').push (scene_elements);

				this.engine.history ('sceneState').push ({
					characters: this.engine.state ('characters'),
					images: this.engine.state ('images'),
				});

				this.engine.state ({
					characters: [],
					images: []
				});

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
			this.engine.action ('Dialog').reset ({ saveNVL: true });
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

				if (this.engine.history ('sceneState').length > 0) {
					const scene_state = this.engine.history  ('sceneState').pop ();

					if (typeof scene_state === 'object') {
						this.engine.state (scene_state);
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