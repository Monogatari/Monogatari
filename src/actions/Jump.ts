import Action from './../lib/Action';
import { FancyError } from '../lib/FancyError';
import { ActionApplyResult, ActionRevertResult, LabelHistoryItem } from '../lib/types';

export class Jump extends Action {

	static override id = 'Jump';

	static override async setup(): Promise<void> {
		this.engine.history('label');
		this.engine.history('jump');
	}

	static override async bind(selector: string): Promise<void> {
		this.engine.registerListener('jump', {
			callback: (element: any) => {
				this.engine.run(`jump ${element.data('jump')}`, false);
			}
		});
	}

	static override matchString([action]: string[]): boolean {
		return action === 'jump';
	}

	label: string;

	constructor([action, label]: string[]) {
		super();
		this.label = label;
	}

	override async willApply(): Promise<void> {
		if (typeof this.engine.script(this.label) !== 'undefined') {
			this.engine.stopAmbient();
			this.engine.showScreen('game');
			return Promise.resolve();
		}

			FancyError.show(
			`The label "${this.label}" does not exist`,
			`Monogatari attempted to jump to the label named "${this.label}" but it wasn't found on the script.`,
			{
				'Missing Label': this.label,
				'You may have meant one of these': Object.keys(this.engine.script() as Record<string, unknown>),
				'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
				'Label': this.engine.state('label'),
				'Step': this.engine.state('step'),
				'Help': {
					'_': 'Check if the label in your jump statement is correct and that you have also defined it correctly.'
				}
			}
		);

		throw new Error('Label does not exist.');
	}

	override async apply(): Promise<void> {
		(this.engine.history('jump') as Array<{ source: { label: string; step: number }; destination: { label: string; step: number } }>).push({
			source: {
				label: this.engine.state('label'),
				step: this.engine.state('step')
			},
			destination: {
				label: this.label,
				step: 0
			}
		});
		this.engine.state({
			step: 0,
			label: this.label
		});

		const textBox = this.engine.element().find('[data-component="text-box"]').get(0) as (HTMLElement & { props?: { mode?: string } }) | undefined;

		if (textBox?.props?.mode !== 'nvl') {
			const dialogAction = this.engine.action('Dialog');
			if (dialogAction) {
				(dialogAction as unknown as { reset: () => void }).reset();
			}
		}

		this.engine.run(this.engine.label()[this.engine.state('step')]);
		(this.engine.history('label') as LabelHistoryItem[]).push({ label: this.label, step: this.engine.state('step') });
	}

	// Jump is right now not reversible due to complications with the logic for it
	override async willRevert(): Promise<void> {
		if (this.engine.history('jump').length > 0) {
			return Promise.resolve();
		}
		throw new Error('No elements in history available.');
	}

	override async revert(): Promise<void> {
		const last = this.engine.history('jump')[this.engine.history('jump').length - 1];
		if (typeof last !== 'undefined') {
			this.engine.state({
				step: last.source.step,
				label: last.source.label
			});
			return Promise.resolve();
		}
		throw new Error('No elements in history available.');
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.history('jump').pop();
		this.engine.history('label').pop();
		return { advance: true, step: false };
	}
}

export default Jump;