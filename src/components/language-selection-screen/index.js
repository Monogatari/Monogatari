import { $_ } from '@aegis-framework/artemis';

import { FancyError } from './../../lib/FancyError';
import { ScreenComponent } from './../../lib/ScreenComponent';

class LanguageSelectionScreen extends ScreenComponent {

	constructor (...args) {
		super (...args);

		this.props = {
			languages: Object.keys (this.engine._script),
			timeout: 2000,
		};

		this.setState ({
			index: 0,
		});

		this.timer = null;
	}

	onStateUpdate (property, oldValue, newValue) {
		super.onStateUpdate (property, oldValue, newValue);

		if (property === 'index') {
			const { languages } = this.props;
			const translation = this.engine.translation (languages[newValue]);

			if (typeof translation === 'object') {
				const string = translation.SelectYourLanguage;
				if (typeof string === 'string') {
					this.content ('title').text (string);
				}
			}
		}
		return Promise.resolve ();
	}

	onPropsUpdate (property, oldValue, newValue) {
		super.onPropsUpdate (property, oldValue, newValue);
	}

	didMount () {
		const { languages, timeout } = this.props;
		this.timer = setTimeout (() => {
			if (this.element ().isVisible ()) {
				const { index } = this.state;
				if (index >= (languages.length - 1)) {
					this.setState ({ index: 0});
				} else {
					this.setState ({ index: index + 1});
				}
				this.timer = setTimeout (() => this.didMount (), parseInt(timeout));
			} else {
				clearTimeout (this.timer);
			}
		}, parseInt(timeout));

		this.element ().on ('click', '[data-language]', (event) => {
			const language = $_(event.target).closest('[data-language]').data ('language');
			this.engine.preference ('Language', language);
			this.engine.localize ();
		});
		return Promise.resolve ();
	}

	render () {
		const { languages } = this.props;
		const buttons = languages.map ((language) =>{
			const metadata = this.engine._languageMetadata[language];

			if (typeof metadata === 'object') {
				const { code, icon } = metadata;
				return `
					<button data-language="${language}" title="${language}">
						${ typeof icon === 'string' ? `<span data-content="icon">${icon}</span>` : '' }
						<span data-content="language">${language}</span>
					</button>
				`;
			} else {
				FancyError.show (
					`Metadata for language "${language}" could not be found.`,
					'Monogatari attempted to retrieve the metadata for this language but it does not exists',
					{
						'Language Not Found': language,
						'You may have meant one of these': Object.keys (this.engine._script),
						'Help': {
							'_': 'Please check that youi have defined the metadata for this language. Remember the metadata is defined as follows:',
							'_1': `
								<pre>
									<code class='language-javascript'>
									monogatari.languageMetadata ("Español", {
										"code": "es",
										"icon": "🇲🇽"
									});
									</code>
								</pre>
							`,
							'Documentation': '<a href="https://developers.monogatari.io/documentation/v/develop/configuration-options/game-configuration/internationalization/" target="_blank">Internationalization</a>'
						}
					}
				);
			}
		}).join ('');

		return `
			<div data-content="wrapper">
				<h1 data-content="title" data-string="SelectYourLanguage">${this.engine.string ('SelectYourLanguage')}</h1>
				<div data-content="buttons">
					${buttons}
				</div>
			</div>
		`;
	}
}

LanguageSelectionScreen.tag = 'language-selection-screen';


export default LanguageSelectionScreen;