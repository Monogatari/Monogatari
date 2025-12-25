import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Next extends Action {
	static override id = 'Next';

	static override matchString([action]: string[]): boolean {
		return action === 'next';
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: true };
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Next;
