import { $_, Text, Util, $_ready } from '@aegis-framework/artemis';
import type { FancyErrorProps, QueuedError, ErrorTemplate, ErrorContext } from './types';

declare const Prism: { highlightAll: () => void } | undefined;
declare const MonogatariDebug: object | undefined;

/**
 * FancyError provides a visual error display for development environments.
 * It shows detailed error information in a modal overlay with syntax highlighting.
 */
export class FancyError {
	static queue: QueuedError[] = [];
	static registry: Map<string, ErrorTemplate> = new Map();

	/**
	 * Check if we're in a development environment (file:// protocol or localhost)
	 */
	private static isDevEnvironment (): boolean {
		return window.location.protocol.indexOf('file') === 0 ||
			window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1';
	}

	/**
	 * Escape HTML entities to prevent XSS
	 */
	private static escapeHtml (text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Generate the modal HTML for an error
	 */
	private static generateModalHtml (error: QueuedError): string {
		return `
			<div class='fancy-error modal modal--active' data-error='${error.id}'>
				<div class='modal__content'>
					<h2>${FancyError.escapeHtml(error.title)}</h2>
					<p>${FancyError.escapeHtml(error.message)}</p>
					<div class='padded text--left'>
						<h3>Details</h3>
						${FancyError.render(error.props)}
						<hr class='separator--material'/>
						<h3>Need More Help?</h3>
						<div class='error-section'>
							<p>Remember you can always ask for more help if you need it at:</p>
							<p><b>Community Forums</b>: <a href='https://community.monogatari.io/' target='_blank' rel='noopener noreferrer'>https://community.monogatari.io/</a></p>
							<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank' rel='noopener noreferrer'>https://discord.gg/gWSeDTz</a></p>
							<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank' rel='noopener noreferrer'>https://github.com/Monogatari/Monogatari/issues/</a></p>
							<p><b>Twitter</b>: <a href='https://twitter.com/monogatari' target='_blank' rel='noopener noreferrer'>https://twitter.com/monogatari</a></p>
						</div>
						<button>Ok</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Attach click handler to dismiss an error modal
	 */
	private static attachDismissHandler (id: string): void {
		$_(`[data-error="${id}"] button`).click(function () {
			$_(`[data-error="${id}"]`).remove();
			FancyError.pop();
		});
		Prism?.highlightAll();
	}

	/**
	 * Register an error template by ID.
	 * IDs follow the convention: type:identifier:error_id (snake_case)
	 * Examples:
	 *   - action:jump:label_not_found
	 *   - component:language_selection_screen:metadata_not_found
	 *   - engine:translation:key_not_found
	 */
	static register (id: string, template: ErrorTemplate): void {
		FancyError.registry.set(id, template);
	}

	/**
	 * Interpolate placeholders in a string with context values.
	 * Placeholders use the format: {{key}}
	 */
	private static interpolate (text: string, context: ErrorContext): string {
		return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			const value = context[key];
			if (value === undefined) {
				return match; // Keep placeholder if no value provided
			}
			return String(value);
		});
	}

	/**
	 * Deep interpolate an object, replacing all string placeholders with context values.
	 */
	private static interpolateProps (props: FancyErrorProps, context: ErrorContext): FancyErrorProps {
		const result: FancyErrorProps = {};

		for (const key of Object.keys(props)) {
			const value = props[key];

			if (typeof value === 'string') {
				result[key] = FancyError.interpolate(value, context);
			} else if (Array.isArray(value)) {
				result[key] = value.map(item =>
					typeof item === 'string' ? FancyError.interpolate(item, context) : item
				);
			} else if (typeof value === 'object' && value !== null && !(value instanceof NodeList)) {
				result[key] = FancyError.interpolateProps(value as FancyErrorProps, context);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	static pop (): void {
		if (FancyError.isDevEnvironment() && typeof Prism !== 'undefined') {
			if (FancyError.queue.length > 0) {
				const error = FancyError.queue.pop()!;
				$_('body').prepend(FancyError.generateModalHtml(error));
				FancyError.attachDismissHandler(error.id);
			}
		}
	}

	/**
	 * Show an error by registered ID with context, or with explicit title/message/props.
	 *
	 * Usage with registered error ID:
	 *   FancyError.show('action:jump:label_not_found', { label: 'my_label', step: 5 });
	 *
	 * Usage with explicit parameters (legacy):
	 *   FancyError.show('Error Title', 'Error message', { prop: 'value' });
	 */
	static show (idOrTitle: string, contextOrMessage?: ErrorContext | string, propsArg?: FancyErrorProps): void {
		if (typeof MonogatariDebug === 'object') {
			let title: string;
			let message: string;
			let props: FancyErrorProps;

			// Check if this is a registered error ID
			const template = FancyError.registry.get(idOrTitle);

			if (template && typeof contextOrMessage !== 'string') {
				// ID-based call: FancyError.show('error:id', { context })
				const context = (contextOrMessage || {}) as ErrorContext;
				title = FancyError.interpolate(template.title, context);
				message = FancyError.interpolate(template.message, context);
				props = FancyError.interpolateProps(template.props, context);

				// Merge any additional context properties that look like display props
				// (keys starting with capital letter or containing spaces) into the final props
				for (const key of Object.keys(context)) {
					if (/^[A-Z]/.test(key) || key.includes(' ')) {
						props[key] = context[key];
					}
				}
			} else {
				// Legacy call: FancyError.show('title', 'message', { props })
				title = idOrTitle || 'Error';
				message = (contextOrMessage as string) || 'An error has occurred! Please check the console so you get more insight.';
				props = propsArg || {};
			}

			const id = Util.uuid();

			const error: QueuedError = {
				id,
				title,
				message,
				props
			};

			if ($_('[data-error]').isVisible()) {
				FancyError.queue.unshift(error);
			} else {
				const showError = (): void => {
					$_('body').prepend(FancyError.generateModalHtml(error));
					FancyError.attachDismissHandler(id);
				};

				if ($_('body').length > 0) {
					showError();
				} else {
					$_ready(showError);
				}
			}
		}
	}

	static render (props: FancyErrorProps = {}): string {
		let html = '<div class="error-section">';
		for (const key of Object.keys(props)) {
			const value = props[key];
			if (typeof value === 'string' || typeof value === 'number') {
				html += `<p><b>${key}</b>: ${value}</p>`;
			} else if (value instanceof Array) {
				html += `<details open><summary><b>${key}</b>:</summary><ul>`;
				for (const item of value) {
					html += `<li>${item}</li>`;
				}
				html += '</ul></details>';
			} else if (value instanceof NodeList) {
				html += `<p><b>${key}</b>:<br><pre>`;
				for (const item of value) {
					if (item instanceof Element) {
						html += `<code class='language-markup'>${item.outerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</code>`;
					}
				}
				html += '</pre></p>';
			}
		}
		html += '</div>';

		for (const key of Object.keys(props)) {
			const value = props[key];
			if (typeof value === 'object' && !(value instanceof Array) && !(value instanceof NodeList)) {
				const obj = value as FancyErrorProps;
				html += `<hr class='separator--material'/><h3>${Text.capitalize(key)}</h3><div class='error-section'>`;
				for (const property of Object.keys(obj)) {
					if (property.indexOf('_') === 0) {
						html += `<p>${obj[property]}</p>`;
					} else {
						const propValue = obj[property];
						if (typeof propValue === 'string' || typeof propValue === 'number') {
							html += `<p><b>${property}</b>: ${propValue}</p>`;
						} else if (propValue instanceof Array) {
							html += `<details open><summary><b>${property}</b>:</summary><ul>`;
							for (const item of propValue) {
								html += `<li>${item}</li>`;
							}
							html += '</ul></details>';
						} else if (propValue instanceof NodeList) {
							html += `<p><b>${property}</b>:<br><pre>`;
							for (const item of propValue) {
								if (item instanceof Element) {
									html += `<code class='language-markup'>${item.outerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</code>`;
								}
							}
							html += '</pre></p>';
						}
					}
				}
				html += '</div>';
			}
		}
		return html;
	}
}

