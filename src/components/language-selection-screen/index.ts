import type { Properties } from '@aegis-framework/pandora';
import { $_ } from '@aegis-framework/artemis';
import { FancyError } from '../../lib/FancyError';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';

/**
 * Props for LanguageSelectionScreen component
 */
export interface LanguageSelectionScreenProps extends Properties {
	languages: string[];
	timeout: number;
}

/**
 * State for LanguageSelectionScreen component
 */
export interface LanguageSelectionScreenState extends ScreenState {
	index: number;
}

class LanguageSelectionScreen extends ScreenComponent<LanguageSelectionScreenProps, LanguageSelectionScreenState> {
	static override tag = 'language-selection-screen';

	private timer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		super();

		this.props = {
			languages: Object.keys(this.engine._script),
			timeout: 2000,
		};

		this.state = {
			open: false,
			index: 0,
		};
	}

	override onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		super.onStateUpdate(property, oldValue, newValue);

		if (property === 'index') {
			const { languages } = this.props;
			const translation = this.engine.translation(languages[newValue as number]);

			if (typeof translation === 'object' && translation !== null) {
				const translationObj = translation as Record<string, string>;
				const string = translationObj.SelectYourLanguage;
				if (typeof string === 'string') {
					this.content('title').text(string);
				}
			}
		}
		return Promise.resolve();
	}

	// onPropsUpdate is inherited from parent class

	override didMount(): Promise<void> {
		// Prevent doing any extra work when the game is not multilanguage
		if (this.engine.setting('MultiLanguage') === true && this.engine.setting('LanguageSelectionScreen') === true) {
			const { languages, timeout } = this.props;
			this.timer = setTimeout(() => {
				if (this.element().isVisible()) {
					const { index } = this.state;
					if (index >= (languages.length - 1)) {
						this.setState({ index: 0 });
					} else {
						this.setState({ index: index + 1 });
					}
					this.timer = setTimeout(() => this.didMount(), parseInt(String(timeout)));
				} else {
					if (this.timer) {
						clearTimeout(this.timer);
					}
				}
			}, parseInt(String(timeout)));
		}

		this.element().on('click', '[data-language]', (event: Event) => {
			const language = $_(event.target as HTMLElement).closest('[data-language]').data('language') as string | undefined;
			if (language) {
				this.engine.preference('Language', language);
				this.engine.localize();
			}
		});

		return Promise.resolve();
	}

	override willUnmount(): Promise<void> {
		// Clean up timer to prevent memory leaks
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}

		return Promise.resolve();
	}

	override render(): string {
		let buttons: string[] = [];
		// Prevent doing any extra work when the game is not multilanguage
		if (this.engine.setting('MultiLanguage') === true && this.engine.setting('LanguageSelectionScreen') === true) {
			const { languages } = this.props;
			buttons = languages.map((language) => {
				const metadata = this.engine._languageMetadata[language];

				if (typeof metadata === 'object') {
					const { icon } = metadata;
					return `
						<button data-language="${language}" title="${language}">
							${typeof icon === 'string' ? `<span data-content="icon">${icon}</span>` : ''}
							<span data-content="language">${language}</span>
						</button>
					`;
				} else {
					FancyError.show('component:language_selection_screen:metadata_not_found', {
						language: language,
						availableLanguages: Object.keys(this.engine._script)
					});
					return '';
				}
			}).filter(Boolean);
		}

		return `
			<div data-content="wrapper">
				<h1 data-content="title" data-string="SelectYourLanguage">${this.engine.string('SelectYourLanguage')}</h1>
				<div data-content="buttons">
					${buttons.join('')}
				</div>
			</div>
		`;
	}
}

export default LanguageSelectionScreen;

