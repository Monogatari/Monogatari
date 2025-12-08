import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Clear extends Action {
	static override id = 'Clear';

	static override async setup(): Promise<void> {
		this.engine.history('clear');
	}

	static override matchString([action]: string[]): boolean {
		return action === 'clear';
	}

	override async apply(): Promise<void> {
    const dialogAction = this.engine.action('Dialog');

    if (dialogAction) {
      dialogAction.reset({ keepNVL: true, saveNVL: true });
    }
	}

	override async didApply(): Promise<ActionApplyResult> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as any;

		this.engine.history('clear').push(textBox.props.mode);

		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		if (this.engine.history('clear').length > 0) {
			return;
		}

		throw new Error('No items left on the clear history to revert it.');
	}

	override async revert(): Promise<void> {
		const last = this.engine.history('clear').pop();

		if (last === 'nvl') {
			this.engine.global('_should_restore_nvl', true);
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Clear;