import { $_ } from '@aegis-framework/artemis';
import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, ActionInstance, SceneStateItem } from '../lib/types';

export class Scene extends Action {

	static override id = 'Scene';
	static override loadingOrder = -2;

	static override async setup(): Promise<void> {
		this.engine.history('scene');
		this.engine.history('sceneElements');
		this.engine.history('sceneState');

		this.engine.global('_should_restore_nvl', false);

		this.engine.state({
			scene: ''
		});
	}

	static override async onLoad(): Promise<void> {
		const sceneState = this.engine.history('sceneState');
		const sceneElements = this.engine.history('sceneElements');

		if (sceneState.length !== sceneElements.length) {
			const states = sceneElements.map((elements: string[]) => {
				if (elements.length > 0) {
					return {
						characters: elements.filter(element => element.indexOf('data-character=') > -1).map((element) => {
							const div = document.createElement('div');
							div.innerHTML = element;
							const firstChild = div.firstChild as HTMLElement;
							if (!firstChild) return '';
							const image = $_(firstChild);
							const imgElement = image.get(0);
							if (!imgElement) return '';
							const classes = imgElement.classList.toString().replace('animated', '').trim();
							return `show character ${image.data('character')} ${image.data('sprite')}${classes.length > 0 ? ` with ${classes}` : ''}`;
						}),
						images: elements.filter(element => element.indexOf('data-image=') > -1).map((element) => {
							const div = document.createElement('div');
							div.innerHTML = element;
							const firstChild = div.firstChild as HTMLElement;
							if (!firstChild) return '';
							const image = $_(firstChild);
							const imgElement = image.get(0);
							if (!imgElement) return '';
							const classes = imgElement.classList.toString().replace('animated', '').trim();
							return `show image ${image.data('image')}${classes.length > 0 ? ` with ${classes}` : ''}`;
						}),
					};
				}

				return {
					characters: [],
					images: []
				};
			});

			for (const state of states) {
				this.engine.history('sceneState').push(state);
			}
		}

		const scene = this.engine.state('scene');
		if (scene !== '') {
			const action = this.engine.prepareAction(scene, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				await action.willApply();
				await action.apply();
				await action.didApply({ updateHistory: false, updateState: false });
			}
		}
	}

	static override async reset(): Promise<void> {
		this.engine.state({
			scene: ''
		});
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'scene';
	}

	scene: string;
	scene_elements: string[];
	scene_state: Record<string, any>;

	constructor([show, type, scene, ...classes]: string[]) {
		super();
		this.scene = scene;

		this.scene_elements = [];
		this.scene_state = {};
	}

	override async willApply(): Promise<void> {
		return Promise.resolve();
	}

	override async apply(): Promise<void> {
		const selectors = [
			'[data-screen="game"] [data-character]:not([data-visibility="invisible"])',
			'[data-screen="game"] [data-image]:not([data-visibility="invisible"])'
		];

		this.engine.element().find(selectors.join(',')).each((element: HTMLElement) => {
			this.scene_elements.push(element.outerHTML);
		});

		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as (HTMLElement & { props?: { mode?: string } }) | undefined;

		this.scene_state = {
			characters: [...this.engine.state('characters')],
			images: [...this.engine.state('images')],
			textBoxMode: textBox?.props?.mode ?? '',
		};

		const restoringState = this.engine.global('_restoring_state');

		const statement = this._statement as string;
		const action = this.engine.prepareAction(statement.replace('show scene', 'show background'), { cycle: 'Application' }) as ActionInstance | null;
		if (action !== null) {
			await action.willApply();
			await action.apply();
			await action.didApply({ updateHistory: !restoringState, updateState: !restoringState });
		}

		// Check if the engine is no loading a save file, since loading a file applies the actions on that state
		// asynchronously, there's a chance this would run after a show image/character action and would remove them
		// from the scene, which is something we don't want
		if (restoringState === false) {
			this.engine.state({
				characters: [],
				images: []
			});

			this.engine.element().find('[data-character]').remove();
			this.engine.element().find('[data-image]').remove();
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		if (updateHistory === true) {
			this.engine.history('sceneElements').push(this.scene_elements);
			this.engine.history('sceneState').push(this.scene_state as SceneStateItem);
			this.engine.history('scene').push(this._statement as string);
		}

		if (updateState === true) {
			this.engine.state({
				scene: this._statement as string
			});
		}

		const restoringState = this.engine.global('_restoring_state');
		if (restoringState === false) {
			const dialogAction = this.engine.action('Dialog');
			if (dialogAction) {
				(dialogAction as unknown as { reset: (opts: { saveNVL: boolean }) => void }).reset({ saveNVL: true });
			}
		}

		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		this.engine.element().find('[data-character]').remove();
		this.engine.element().find('[data-image]').remove();
		return Promise.resolve();
	}

	override async revert(): Promise<void> {
		const statement = this._statement as string;
		await this.engine.revert(statement.replace('show scene', 'show background'), false, false);
		// this.engine.history ('scene').pop ();
		const restoreSceneItems = () => {
			const sceneElementsHistory = this.engine.history('sceneElements') as string[][];
			if (sceneElementsHistory.length > 0) {
				const scene_elements = sceneElementsHistory.pop();

				if (typeof scene_elements === 'object' && scene_elements) {
					for (const element of scene_elements) {
						this.engine.element().find('[data-screen="game"]').append(element);
					}
				}
			}

			const sceneStateHistory = this.engine.history('sceneState') as SceneStateItem[];
			if (sceneStateHistory.length > 0) {
				const scene_state = sceneStateHistory.pop();

				if (typeof scene_state === 'object' && scene_state) {
					const state = { ...scene_state };
					const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as (HTMLElement & { setProps?: (props: { mode: string }) => void }) | undefined;

					if (textBox?.setProps) {
						textBox.setProps({ mode: state.textBoxMode ?? '' });
					}

					if (state.textBoxMode === 'nvl') {
						this.engine.global('_should_restore_nvl', true);
					}

					this.engine.state({
						characters: state.characters ?? [],
						images: state.images ?? []
					});
				}
			}
		};

		// Check if the scene history still has elements left, if it doesn't then we need to roll back
		// to the initial background defined in the CSS and not in the script.
		const sceneHistory = this.engine.history('scene') as string[];
		if (sceneHistory.length > 0) {
			this.engine.global('_scene_history_cleared_by_background', false);
			const last = sceneHistory[sceneHistory.length - 1];

			this.engine.state({
				scene: last ?? ''
			});

			sceneHistory.pop();

			restoreSceneItems();
			const dialogAction = this.engine.action('Dialog');
			if (dialogAction) {
				(dialogAction as unknown as { reset: () => Promise<void> }).reset();
			}
			return;
		}

		// If the scene history was empty, we just need to check if it was the background
		// action who cleared it. If that was the case, we still need to restore the other
		// items that we save for each scene apart from the background.
		if (this.engine.global('_scene_history_cleared_by_background') === true) {
			this.engine.global('_scene_history_cleared_by_background', false);
			restoreSceneItems();
			const dialogAction = this.engine.action('Dialog');
			if (dialogAction) {
				(dialogAction as unknown as { reset: () => Promise<void> }).reset();
			}
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Scene;