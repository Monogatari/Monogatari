import { $_ } from '@aegis-framework/artemis/index';
import { Action } from './../lib/Action';

export class Scene extends Action {

	static setup () {
		this.engine.history ('scene');
		this.engine.history ('sceneElements');
		this.engine.history ('sceneState');

		this.engine.global ('_should_restore_nvl', false);

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
			const action = this.engine.prepareAction (scene, { cycle: 'Application' });
			return action.willApply ().then (() => {
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: false });
				});
			});
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

		this.scene_elements = [];
		this.scene_state = {};
	}

	willApply () {
		return Promise.resolve ();
	}

	apply () {
		const selectors = [
			'[data-screen="game"] [data-character]:not([data-visibility="invisible"])',
			'[data-screen="game"] [data-image]:not([data-visibility="invisible"])'
		];

		this.engine.element ().find (selectors.join (',')).each ((element) => {
			this.scene_elements.push (element.outerHTML);
		});

		const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);

		this.scene_state = {
			characters: [...this.engine.state ('characters')],
			images: [...this.engine.state ('images')],
			textBoxMode: textBox.props.mode,
		};

		const restoringState = this.engine.global ('_restoring_state');

		const action = this.engine.prepareAction (this._statement.replace('show scene', 'show background'), { cycle: 'Application' });
		return action.willApply ().then (() => {
			return action.apply ().then (() => {
				return action.didApply ({ updateHistory: !restoringState, updateState: !restoringState }).then (() => {
					// Check if the engine is no loading a save file, since loading a file applies the actions on that state
					// asynchronously, there's a chance this would run after a show image/character action and would remove them
					// from the scene, which is something we don't want
					if (restoringState === false) {
						this.engine.state ({
							characters: [],
							images: []
						});

						this.engine.element ().find ('[data-character]').remove ();
						this.engine.element ().find ('[data-image]').remove ();
					}
				});
			});
		});
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			this.engine.history ('sceneElements').push (this.scene_elements);
			this.engine.history ('sceneState').push (this.scene_state);
			this.engine.history ('scene').push (this._statement);
		}

		if (updateState === true) {
			this.engine.state ({
				scene: this._statement
			});
		}

		const restoringState = this.engine.global ('_restoring_state');
		if (restoringState === false) {
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
			// this.engine.history ('scene').pop ();
			const restoreSceneItems = () => {
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
						const state = { ...scene_state };
						const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);

						textBox.setProps ({ mode: state.textBoxMode });

						if (state.textBoxMode === 'nvl') {
							this.engine.global ('_should_restore_nvl', true);
						}

						delete state.textBoxMode;
						this.engine.state (scene_state);
					}
				}
			};

			// Check if the scene history still has elements left, if it doesn't then we need to roll back
			// to the initial background defined in the CSS and not in the script.
			if (this.engine.history ('scene').length > 0) {
				this.engine.global ('_scene_history_cleared_by_background', false);
				const last = this.engine.history ('scene')[this.engine.history ('scene').length - 1];

				this.engine.state ({
					scene: last
				});

				this.engine.history ('scene').pop ();

				restoreSceneItems ();
				return this.engine.action ('Dialog').reset ();
			}

			// If the scene history was empty, we just need to check if it was the background
			// action who cleared it. If that was the case, we still need to restore the other
			// items that we save for each scene apart from the background.
			if (this.engine.global ('_scene_history_cleared_by_background') === true) {
				this.engine.global ('_scene_history_cleared_by_background', false);
				restoreSceneItems ();
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