import type { Properties } from '@aegis-framework/pandora';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';

/**
 * Credits content type - can be a string or a record of credit items
 */
export type CreditsContent = string | Record<string, string | string[]>;

/**
 * Credits configuration
 */
export type CreditsConfiguration = Record<string, CreditsContent>;

/**
 * Props for CreditsScreen component
 */
export interface CreditsScreenProps extends Properties {
	credits: CreditsConfiguration;
}

class CreditsScreen extends ScreenComponent<CreditsScreenProps, ScreenState> {
	static override tag = 'credits-screen';

	static override init(): Promise<void> {
		if (Object.keys(this.engine.configuration('credits') as object).length > 0) {
			const mainMenu = this.engine.component('main-menu') as { addButton?: (btn: { string: string; icon: string; data: { action: string; open: string } }) => void } | undefined;
			if (mainMenu?.addButton) {
				mainMenu.addButton({
					string: 'Credits',
					icon: '',
					data: {
						action: 'open-screen',
						open: 'credits'
					}
				});
			}
		}
		return Promise.resolve();
	}

	constructor() {
		super();

		this.props = {
			credits: {}
		};
	}

	override willMount(): Promise<void> {
		super.willMount();
		this.setProps({
			credits: this.engine.configuration('credits') as CreditsConfiguration
		});
		return Promise.resolve();
	}

	override render(): string {
		const items = Object.keys(this.props.credits).map((section) => {
			let html = `<h3>${this.engine.replaceVariables(section)}</h3><div>`;
			const content = this.props.credits[section];

			if (typeof content === 'string') {
				return `<p><span>${content}</span></p>`;
			}

			for (const key of Object.keys(content)) {
				const title = this.engine.replaceVariables(key);
				let value: string | string[] = content[key];

				if (value instanceof Array) {
					value = value.join(', ');
				}

				if (typeof value === 'string') {
					value = this.engine.replaceVariables(value);
				}

				if (title.indexOf('_') === 0) {
					html += `<p><span>${value}</span></p>`;
				} else {
					html += `<p><b>${title}</b><span>${value}</span></p>`;
				}
			}
			html += '</div>';

			return html;
		}).join('');

		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<h2 data-string="Credits" data-content="title">Credits</h2>
			<div data-content="credits" data-ui="credits">
				${items}
			</div>
		`;
	}
}

export default CreditsScreen;

