import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class HideParticles extends Action {

	static override id = 'Hide::Particles';

	static override matchString([hide, type]: string[]): boolean {
		return hide === 'hide' && type === 'particles';
	}

	constructor([hide, type]: string[]) {
		super();
	}

	override async apply(): Promise<void> {
		const particlesAction = this.engine.action('Particles') as { stop?: () => void } | undefined;
		if (particlesAction?.stop) {
			particlesAction.stop();
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		this.engine.state({
			particles: ''
		});
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const history = this.engine.history('particle') as string[];
		if (history.length > 0) {
			const last = history[history.length - 1];

			const action = this.engine.prepareAction(last, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				await action.willApply();
				await action.apply();
				await action.didApply({ updateHistory: false, updateState: true });
			}
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideParticles;