import Action from '../lib/Action';
import Component from '../lib/Component';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class Canvas extends Action {
	static override id = 'Canvas';

	static _configuration: any = {
		objects: {},
		modes: ['modal', 'displayable', 'immersive', 'background', 'character']
	};

	static configuration(object: any = null): any {
		if (object === null) {
      return Canvas._configuration;
    }

    if (typeof object === 'string') {
      return Canvas._configuration[object];
    }

    Canvas._configuration = Object.assign({}, Canvas._configuration, object);
	}

	static override async shouldProceed(): Promise<void> {
    const element = this.engine.element();

    element.find('[data-component="canvas-container"]').each((element: any) => {
      const { mode, canvas } = element.props;
      if (['immersive', 'modal'].indexOf(mode) > -1) {
        throw new Error(`Canvas "${canvas}" must be removed before proceeding.`);
      }
    });
	}

	static override async onLoad(): Promise<void> {
		const state = this.engine.state('canvas');

		if (state.length === 0) {
			return;
		}

		const promises = [];
		for (const canvas of state) {
			const action: ActionInstance | null = this.engine.prepareAction(canvas, { cycle: 'Application' });

      if (action === null) {
        continue;
      }

			const promise = action.willApply().then(() => {
				return action.apply().then(() => {
					return action.didApply({ updateHistory: false, updateState: false });
				});
			});

			promises.push(promise);
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}
	}

	static override async setup(): Promise<void> {
		this.engine.history('canvas');
		this.engine.state({
			canvas: []
		});
	}

	static override async bind(): Promise<void> {
		window.addEventListener('resize', () => {
			this.engine.element().find('[data-component="canvas-container"][mode="background"], [data-component="canvas-container"][mode="immersive"]').each((canvasContainer: any) => {
				const { object } = canvasContainer.props;
				if (typeof object.resize === 'function') {
					Util.callAsync(object.resize, this.engine, canvasContainer.layers, object.props, object.state, canvasContainer);
				}
			});
		});
	}

	static override async reset(): Promise<void> {
		const promises: Promise<any>[] = [];

		// Go through each canvas element being shown so it can be properly
		// stopped and then removed.
		this.engine.element().find('[data-component="canvas-container"]').each((canvasContainer: any) => {
			const { object } = canvasContainer.props;

			promises.push(Util.callAsync(object.stop, this.engine, canvasContainer.layers, object.props, object.state, canvasContainer).then(() => {
				canvasContainer.remove();
			}));
		});

		this.engine.history({
			canvas: []
		});

		this.engine.state({
			canvas: []
		});

		await Promise.all(promises);
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'canvas';
	}

	static objects(object: any = null): any {
		if (object === null) {
      return Canvas._configuration.objects;
    }

    if (typeof object === 'string') {
      return Canvas._configuration.objects[object];
    }

    Canvas._configuration.objects = {
      ...Canvas._configuration.objects,
      ...object
    };
	}

	mode: string;
	name: string;
	classes: string[];
	object: any;
	element: any;
	containerSelector: string;

	/**
	 * Creates an instance of a Canvas Action
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'canvas'
	 * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, immersive)
	 * @param {string} parameters.mode
	 */
	constructor([show, canvas, name, mode = 'displayable', separator, ...classes]: string[]) {
		super();

		this.mode = mode;
		this.name = name;
		this.containerSelector = '';

		this.classes = typeof classes !== 'undefined' ? ['animated', ...classes.filter((c) => c !== 'with')] : [];
	}

	override async willApply(): Promise<void> {
		if (Canvas._configuration.modes.indexOf(this.mode) === -1) {
			FancyError.show('action:canvas:invalid_mode', {
				mode: this.mode,
				validModes: (this.constructor as any)._configuration.modes,
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
			return Promise.reject('Invalid canvas mode provided.');
		}

		this.object = Canvas.objects(this.name);

		if (typeof this.object !== 'object') {
			FancyError.show('action:canvas:object_not_found', {
				name: this.name,
				availableObjects: Object.keys(Canvas.objects()),
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});

			return Promise.reject('Canvas object did not exist or is invalid');
		}

		this.element = document.createElement('canvas-container');

		this.containerSelector = `[data-component="canvas-container"][canvas="${this.name}"][mode="${this.mode}"]`;

		return Promise.resolve();

	}

	override async apply(): Promise<void> {
		const defaultFunction = () => Promise.resolve();

		this.element.setProps({
			mode: this.mode,
			canvas: this.name,
			// We need to pass the object this way so we can clone the state
			// property instead of pasing it by reference. Otherwise, any changes
			// made to it during execution would be kept there and the next time we
			// use the same object, we'll receive the modified state object instead
			// of a clean one.
			object: {
				layers: this.object.layers || ['base'],
				props: this.object.props || {},
				state: { ...(this.object.state || {}) },
				start: this.object.start || defaultFunction,
				stop: this.object.stop || defaultFunction,
				resize: this.object.resize || defaultFunction,
			},
			classes: this.classes
		});

		const gameScreen = this.engine.element().find('[data-screen="game"]');

		if (this.mode === 'background') {
			gameScreen.find('[data-ui="background"]').append(this.element);
		} else if (this.mode === 'immersive') {
			gameScreen.append(this.element);
		} else if (this.mode === 'displayable' || this.mode === 'modal' || this.mode === 'character') {
			(gameScreen.get(0) as unknown as Component)?.content('visuals')?.append(this.element);
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		const statement = this._statement as string;
		if (updateHistory === true) {
			this.engine.history('canvas').push(statement);
		}

		if (updateState === true) {
			this.engine.state({
				canvas: [...this.engine.state('canvas'), statement]
			});
		}

		if (this.mode === 'background' || this.mode === 'character' || this.mode === 'displayable') {
			return { advance: true };
		}

		return { advance: false };
	}

	override async willRevert(): Promise<void> {
		this.containerSelector = `[data-component="canvas-container"][canvas="${this.name}"][mode="${this.mode}"]`;
		this.element = document.querySelector(this.containerSelector);

		if (this.element === null) {
			throw new Error(`Canvas element "${this.name}" (mode: ${this.mode}) not found in the DOM.`);
		}

		this.object = this.element.props.object;
	}

	override async revert(): Promise<void> {
		await Util.callAsync(this.element.props.object.stop, this.engine, this.element.layers, this.element.props.object.props, this.element.props.object.state, this.element);
		this.engine.element().find(this.containerSelector).remove();
	}

	override async didRevert(): Promise<ActionRevertResult> {
		let foundState = false;
		this.engine.state({
			canvas: this.engine.state('canvas').filter((item: string) => {
				if (!foundState) {
					const [, , name, mode] = item.split(' ');
					if (name === this.name && mode === this.mode) {
						foundState = true;
						return false;
					}
				}
				return true;
			})
		});

		const history = this.engine.history('canvas') as string[];
		for (let i = history.length - 1; i >= 0; i--) {
			const [, , name] = history[i].split(' ');
			if (name === this.name) {
				history.splice(i, 1);
				break;
			}
		}

		return { advance: true, step: true };
	}
}

export default Canvas;