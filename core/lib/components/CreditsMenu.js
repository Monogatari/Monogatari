import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class CreditsMenu extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return CreditsMenu._configuration[object];
			} else {
				CreditsMenu._configuration = Object.assign ({}, CreditsMenu._configuration, object);
			}
		} else {
			return CreditsMenu._configuration;
		}
	}

	static credits (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return CreditsMenu._configuration.credits[object];
			} else {
				CreditsMenu._configuration.credits = Object.assign ({}, CreditsMenu._configuration.credits, object);
			}
		} else {
			return CreditsMenu._configuration.credits;
		}
	}

	static html (html = null) {
		if (html !== null) {
			CreditsMenu._html = html;
		} else {
			return CreditsMenu._html;
		}
	}

	static setup (selector) {
		$_(selector).append (CreditsMenu.html ());
		$_(`${selector} [data-menu="main"] [data-ui="inner-menu"]`).append ('<button data-action="open-menu" data-open="credits" data-string="Credits">Credits</button>');
		Monogatari.translation ('English', {
			'Credits': 'Credits'
		});
		return Promise.resolve ();
	}

	static init (selector) {
		if (Object.keys (CreditsMenu.credits ()).length > 0) {
			$_(`${Monogatari.selector} [data-menu="credits"] [data-ui="credits"]`).html (CreditsMenu.render ());
		} else {
			// Hide Gallery if there are no images defined.
			$_(`${selector} [data-menu="credits"]`).remove ();
			$_(`${selector} [data-open="credits"]`).remove ();
		}
		return Promise.resolve ();
	}

	static render () {
		$_(`${Monogatari.selector} [data-menu="credits"] [data-ui="credits"]`).html ('');
		return Object.keys (CreditsMenu.credits ()).map ((section) => {
			let html = `<h3>${section}</h3><div>`;
			const content = CreditsMenu.credits (section);
			for (const key of Object.keys (content)) {
				if (key.indexOf ('_') === 0) {
					html += `<p class='row row--spaced'>
								<span class="row__column row__column--phone--12">${content[key]}</span>
							</p>`;
				} else {
					html += `<p class='row row--spaced'>
								<b class="row__column row__column--phone--6">${key}</b>
								<span class="row__column row__column--phone--6">${content[key]}</span>
							</p>`;
				}

			}
			html += '</div>';
			return html;
		});
	}
}

CreditsMenu._configuration = {};
CreditsMenu._state = {};
CreditsMenu._id = 'Credits';

CreditsMenu._html = `
	<section data-menu="credits">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Credits">Credits</h2>
		<div class="text--center padded" data-ui="credits"></div>
	</section>
`;

CreditsMenu._configuration = {
	credits: {}
};

Monogatari.registerComponent (CreditsMenu);