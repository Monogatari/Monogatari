import { $_, Text, Util } from '@aegis-framework/artemis';
/* global Prism */

export class FancyError {

	static init () {

		window.onerror = () => {

		};
	}

	static pop () {
		if (FancyError.queue.length > 0) {
			const object = FancyError.queue.pop ();

			$_('body').prepend (`
				<div class='fancy-error modal modal--active' data-error='${object.id}'>
					<div class='modal__content'>
						<h2>${object.title}</h2>
						<p>${object.message}</p>
						<div class='padded  text--left'>
							<h3>Details</h3>
							${FancyError.render (object.props)}
							<hr class='separator--material'/>
							<h3>Need More Help?</h3>
							<div class='error-section'>
								<p>Remember you can always ask for more help if you need it at:</p>
								<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank'>https://discord.gg/gWSeDTz</a></p>
								<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank'>https://github.com/Monogatari/Monogatari/issues/</a></p>
								<p><b>Email</b>: <a href='mailto:diego@hyuchia.com' target='_blank'>Send a mail to the creator</a></p>
							</div>
							<button>Ok</button>
						</div>

					</div>
				</div>
			`);

			$_(`[data-error="${object.id}"] button`).click (function () {
				$_(`[data-error="${object.id}"]`).remove ();
				FancyError.pop ();
			});

			if (typeof Prism !== 'undefined') {
				Prism.highlightAll ();
			}
		}
	}

	static show (title = 'Error', message = 'An error has ocurred! Please check the console so you get more insight.', props = {}) {
		const id = Util.uuid ();

		const object = {
			id,
			title,
			message,
			props
		};


		if ($_('[data-error]').isVisible ()) {
			FancyError.queue.unshift (object);
		} else {
			$_('body').prepend (`
				<div class='fancy-error modal modal--active' data-error='${id}'>
					<div class='modal__content'>
						<h2>${title}</h2>
						<p>${message}</p>
						<div class='padded  text--left'>
							<h3>Details</h3>
							${FancyError.render (props)}
							<hr class='separator--material'/>
							<h3>Need More Help?</h3>
							<div class='error-section'>
								<p>Remember you can always ask for more help if you need it at:</p>
								<p><b>Discord</b>: <a href='https://discord.gg/gWSeDTz' target='_blank'>https://discord.gg/gWSeDTz</a></p>
								<p><b>GitHub</b>: <a href='https://github.com/Monogatari/Monogatari/issues/' target='_blank'>https://github.com/Monogatari/Monogatari/issues/</a></p>
								<p><b>Email</b>: <a href='mailto:diego@hyuchia.com' target='_blank'>Send a mail to the creator</a></p>
							</div>
							<button>Ok</button>
						</div>

					</div>
				</div>
			`);

			$_(`[data-error="${id}"] button`).click (function () {
				$_(`[data-error="${id}"]`).remove ();
				FancyError.pop ();
			});

			if (typeof Prism !== 'undefined') {
				Prism.highlightAll ();
			}
		}
	}

	static render (props = {}) {
		let html = '<div class="error-section">';
		for (const key of Object.keys (props)) {
			if (typeof props[key] === 'string') {
				html += `<p><b>${key}</b>: ${props[key]}</p>`;
			} else if (props[key] instanceof Array) {
				html += `<p><b>${key}</b>: ${props[key].toString ().replace (/,/g, ', ')}</p>`;
			}

		}
		html += '</div>';

		for (const key of Object.keys (props)) {
			if (typeof props[key] === 'object' && !(props[key] instanceof Array)) {
				html += `<hr class='separator--material'/><h3>${Text.capitalize (key)}</h3><div class='error-section'>`;
				for (const property of Object.keys (props[key])) {
					if (property.indexOf ('_') === 0) {
						html += `<p>${props[key][property]}</p>`;
					} else {
						if (typeof props[key][property] === 'string') {
							html += `<p><b>${property}</b>: ${props[key][property]}</p>`;
						} else if (props[key][property] instanceof Array) {
							html += `<p><b>${property}</b>: ${props[key][property].toString ().replace (/,/g, ', ')}</p>`;
						}
					}
				}
				html += '</div>';
			}
		}
		return html;
	}


}

FancyError.queue = [];