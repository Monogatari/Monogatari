import Action from './../lib/Action';
import type TextBox from './../components/text-box';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class ShowTextBox extends Action {

	static override id = 'Show::TextBox';

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'textbox';
	}

	override async apply(): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBox | undefined;
		textBox?.setState({ hidden: false });
	}

	override async didApply(): Promise<ActionApplyResult> {
		this.engine.state({ textboxHidden: false });
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as TextBox | undefined;
		textBox?.setState({ hidden: true });
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.state({ textboxHidden: true });
		return { advance: true, step: true };
	}
}

export default ShowTextBox;
