import Action from '../lib/Action';
import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class Particles extends Action {

	static override id = 'Particles';
	static _configuration: { particles: Record<string, any> } = {
		particles: {}
	};

	static stop() {
		try {
			const particles = tsParticles.domItem(0);
			if (typeof particles !== 'undefined') {
				particles.stop();
				this.engine.element().find('#tsparticles').html('');
			}
		} catch (e) {
			console.error('An error ocurred while trying to stop particle system.', e);
		}
	}


	static override async setup(): Promise<void> {
		this.engine.history('particle');
		this.engine.state({
			particles: ''
		});
		await loadSlim(tsParticles);
	}

	static override async reset(): Promise<void> {
		this.engine.state({
			particles: ''
		});
		this.stop();
	}

	static override async onLoad(): Promise<void> {
		const particles = this.engine.state('particles');
		if (particles !== '') {
			const action = this.engine.prepareAction(particles, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				await action.willApply();
				await action.apply();
				await action.didApply({ updateHistory: false, updateState: false });
			}
		}
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'particles';
	}

	static particles(object: Record<string, any> | string | null = null): any {
		if (object !== null) {
			if (typeof object === 'string') {
				return Particles._configuration.particles[object];
			} else {
				Particles._configuration.particles = Object.assign({}, Particles._configuration.particles, object);
			}
		} else {
			return Particles._configuration.particles;
		}
	}

	particles: any;
	name: string | undefined;

	constructor([show, type, name]: string[]) {
		super();
		if (typeof Particles.particles(name) !== 'undefined') {
			this.particles = Particles.particles(name);
			this.name = name;
		} else {
			console.error(`The Particles ${name} could not be shown because it doesn't exist in the particles object.`);
		}
	}

	override async willApply(): Promise<void> {
		if (typeof this.particles !== 'undefined') {
			return;
		} else {
			throw new Error('Particle system object does not exist.');
		}
	}

	override async apply(): Promise<void> {
		await tsParticles.load({ id: 'tsparticles', options: this.particles });
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		if (updateHistory === true) {
			(this.engine.history('particle') as string[]).push(this._statement as string);
		}

		if (updateState === true) {
			this.engine.state({
				particles: this._statement as string
			});
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		Particles.stop();
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.history('particle').pop();
		this.engine.state({
			particles: ''
		});
		return { advance: true, step: true };
	}
}

export default Particles;
