import Action from './../lib/Action';
import type TextBox from './../components/text-box';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class HideTextBox extends Action {

	static override id = 'Hide::TextBox';

	static override async setup(): Promise<void> {
		this.engine.state({
			textboxHidden: false
		});
	}

	static override async reset(): Promise<void> {
		this.engine.state({
			textboxHidden: false
		});
	}

	static override async onLoad(): Promise<void> {
		if (this.engine.state('textboxHidden') === true) {
			const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBox | undefined;
			textBox?.setState({ hidden: true });
		}
	}

	static override matchString([hide, type]: string[]): boolean {
		return hide === 'hide' && type === 'textbox';
	}

	override async apply(): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBox | undefined;
		textBox?.setState({ hidden: true });
	}

	override async didApply(): Promise<ActionApplyResult> {
		this.engine.state({ textboxHidden: true });
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBox | undefined;
		textBox?.setState({ hidden: false });
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.state({ textboxHidden: false });
		return { advance: true, step: true };
	}
}

export default HideTextBox;
