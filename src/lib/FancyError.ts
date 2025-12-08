import { $_, Text, Util, $_ready } from '@aegis-framework/artemis';
import type { FancyErrorProps, QueuedError } from './types';

declare const Prism: { highlightAll: () => void } | undefined;
declare const MonogatariDebug: object | undefined;

/**
 * FancyError provides a visual error display for development environments.
 * It shows detailed error information in a modal overlay with syntax highlighting.
 */
export class FancyError {
	static queue: QueuedError[] = [];

	static init (): void {
		// Reserved for future initialization
	}

	static pop (): void {
		if ((window.location.protocol.indexOf('file') === 0 || window.location.host === 'localhost') && typeof Prism !== 'undefined') {
			if (FancyError.queue.length > 0) {
				const object = FancyError.queue.pop()!;

				$_('body').prepend(`
					<div class='fancy-error modal modal--active' data-error='${object.id}'>
						<div class='modal__content'>
							<h2>${object.title}</h2>
							<p>${object.message}</p>
							<div class='padded  text--left'>
								<h3>Details</h3>
								${FancyError.render(object.props)}
								<hr class='separator--material'/>
								<h3>Need More Help?</h3>
								<div class='error-section'>
									<p>Remember you can always ask for more help if you need it at:</p>
									<p><b>Community Forums</b>: <a href='https://community.monogatari.io/' target='_blank' rel="noopener noreferrer">https://community.monogatari.io/</a></p>
									<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank'>https://discord.gg/gWSeDTz</a></p>
									<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank'>https://github.com/Monogatari/Monogatari/issues/</a></p>
									<p><b>Twitter</b>: <a href='https://twitter.com/monogatari' target='_blank'>https://twitter.com/monogatari</a></p>
								</div>
								<button>Ok</button>
							</div>

						</div>
					</div>
				`);

				$_(`[data-error="${object.id}"] button`).click(function () {
					$_(`[data-error="${object.id}"]`).remove();
					FancyError.pop();
				});
				Prism?.highlightAll();
			}
		}
	}

	static show (title: string = 'Error', message: string = 'An error has ocurred! Please check the console so you get more insight.', props: FancyErrorProps = {}): void {
		if (typeof MonogatariDebug === 'object') {
			const id = Util.uuid();

			const object: QueuedError = {
				id,
				title,
				message,
				props
			};


			if ($_('[data-error]').isVisible()) {
				FancyError.queue.unshift(object);
			} else {
				if ($_('body').length > 0) {
					$_('body').prepend(`
						<div class='fancy-error modal modal--active' data-error='${id}'>
							<div class='modal__content'>
								<h2>${title}</h2>
								<p>${message}</p>
								<div class='padded  text--left'>
									<h3>Details</h3>
									${FancyError.render(props)}
									<hr class='separator--material'/>
									<h3>Need More Help?</h3>
									<div class='error-section'>
										<p>Remember you can always ask for more help if you need it at:</p>
										<p><b>Community Forums</b>: <a href='https://community.monogatari.io/' target='_blank' rel="noopener noreferrer">https://community.monogatari.io/</a></p>
										<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank'>https://discord.gg/gWSeDTz</a></p>
										<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank' rel="noopener noreferrer">https://github.com/Monogatari/Monogatari/issues/</a></p>
										<p><b>Twitter</b>: <a href='https://twitter.com/monogatari' target='_blank' rel="noopener noreferrer">https://twitter.com/monogatari</a></p>
									</div>
									<button>Ok</button>
								</div>

							</div>
						</div>
					`);

					$_(`[data-error="${id}"] button`).click(function () {
						$_(`[data-error="${id}"]`).remove();
						FancyError.pop();
					});
					Prism?.highlightAll();
				} else {
					$_ready(() => {
						$_('body').prepend(`
							<div class='fancy-error modal modal--active' data-error='${id}'>
								<div class='modal__content'>
									<h2>${title}</h2>
									<p>${message}</p>
									<div class='padded  text--left'>
										<h3>Details</h3>
										${FancyError.render(props)}
										<hr class='separator--material'/>
										<h3>Need More Help?</h3>
										<div class='error-section'>
											<p>Remember you can always ask for more help if you need it at:</p>
											<p><b>Community Forums</b>: <a href='https://community.monogatari.io/' target='_blank' rel="noopener noreferrer">https://community.monogatari.io/</a></p>
											<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank'>https://discord.gg/gWSeDTz</a></p>
											<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank'>https://github.com/Monogatari/Monogatari/issues/</a></p>
											<p><b>Twitter</b>: <a href='https://twitter.com/monogatari' target='_blank'>https://twitter.com/monogatari</a></p>
										</div>
										<button>Ok</button>
									</div>

								</div>
							</div>
						`);

						$_(`[data-error="${id}"] button`).click(function () {
							$_(`[data-error="${id}"]`).remove();
							FancyError.pop();
						});
						Prism?.highlightAll();
					});
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
				html += '</ul></details></p>';
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
							html += `<details open><summary><b>${key}</b>:</summary><ul>`;
							for (const item of propValue) {
								html += `<li>${item}</li>`;
							}
							html += '</ul></details></p>';
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

