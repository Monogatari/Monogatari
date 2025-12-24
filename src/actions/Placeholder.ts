import Action from './../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Placeholder extends Action {
	static override id = 'Placeholder';

	static override matchString([action]: string[]): boolean {
		return action === '$';
	}

	name: string;
	action: any;
	arguments: any[];

	constructor([action, name, ...args]: string[]) {
		super();

		this.name = name;
		this.action = this.engine.$(name);
		this.arguments = args;
	}

	override async willApply(): Promise<void> {
		if (this.name.indexOf('_') === 0) {
			this.action = await Util.callAsync(this.action, this.engine, ...this.arguments);
		}

		this.action = this.engine.prepareAction(this.action, { cycle: this._cycle as 'Application' | 'Revert' });

		await this.action.willApply();
	}

	override async apply(): Promise<void> {
		await this.action.apply();
	}

	override async didApply(context: ActionApplyResult = { advance: true }): Promise<ActionApplyResult> {
		return await this.action.didApply(context);
	}

	override async willRevert(): Promise<void> {
		if (this.name.indexOf('_') === 0) {
			this.action = await Util.callAsync(this.action, this.engine, ...this.arguments);
		}

		this.action = this.engine.prepareAction(this.action, { cycle: this._cycle as 'Application' | 'Revert' });

		await this.action.willRevert();
	}

	override async revert(): Promise<void> {
		await this.action.revert();
	}

	override async didRevert(context: ActionRevertResult = { advance: true, step: true }): Promise<ActionRevertResult> {
		return await this.action.didRevert(context);
	}
}

export default Placeholder;
