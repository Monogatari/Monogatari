import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';

/**
 * Choice item definition
 */
export interface ChoiceItem {
	Text: string;
	Do: string;
	Class?: string;
	Clickable?: () => boolean | Promise<boolean>;
	_key: string;
}

/**
 * Props for ChoiceContainer component
 */
export interface ChoiceContainerProps extends Properties {
	choices: ChoiceItem[];
	classes: string;
}

class ChoiceContainer extends Component<ChoiceContainerProps, Properties> {
	static override tag = 'choice-container';

	constructor() {
		super();

		this.props = {
			choices: [],
			classes: ''
		};
	}

	override shouldProceed(): Promise<void> {
		// If a choice is currently being displayed, the player should not be able
		// to advance until one is chosen.
		return Promise.reject('Choice Container awaiting for user input.');
	}

	override willRollback(): Promise<void> {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove();

		return Promise.resolve();
	}

	override onReset(): Promise<void> {
		this.remove();
		return Promise.resolve();
	}

	override willMount(): Promise<void> {
		// Check if a list of classes has been defined and if the list is not empty
		if (typeof this.props.classes === 'string' && this.props.classes !== '') {
			this.props.classes.split(' ').forEach((className) => {
				if (className) {
					this.classList.add(className);
				}
			});
		}
		return Promise.resolve();
	}

	override didMount(): Promise<void> {
		return Promise.resolve();
	}

	override render(): Promise<string> {
		const choices = this.props.choices.map((choice) => {
			const choiceText = this.engine.replaceVariables(choice.Text);

			if (typeof choice.Clickable === 'function') {
				return new Promise<string>((resolve) => {
					this.engine.assertAsync(choice.Clickable!, this.engine).then(() => {
						resolve(`<button data-do="${choice.Do}" ${choice.Class ? `class="${choice.Class}"` : ''} data-choice="${choice._key}">${choiceText}</button>`);
					}).catch(() => {
						resolve(`<button data-do="${choice.Do}" ${choice.Class ? `class="${choice.Class}"` : ''} data-choice="${choice._key}" disabled>${choiceText}</button>`);
					});
				});
			}
			return Promise.resolve(`<button data-do="${choice.Do}" ${choice.Class ? `class="${choice.Class}"` : ''} data-choice="${choice._key}">${choiceText}</button>`);
		});

		return Promise.all(choices).then((choiceButtons) => `
			<div data-content="wrapper">
				${choiceButtons.join('')}
			</div>
		`);
	}
}

export default ChoiceContainer;

