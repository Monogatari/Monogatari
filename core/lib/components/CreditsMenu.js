import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class CreditsMenu extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			} else {
				this._configuration = Object.assign ({}, this._configuration, object);
			}
		} else {
			return this._configuration;
		}
	}

	static credits (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration.credits[object];
			} else {
				this._configuration.credits = Object.assign ({}, this._configuration.credits, object);
			}
		} else {
			return this._configuration.credits;
		}
	}

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static setup (selector) {
		$_(selector).append (this.html ());
		return Promise.resolve ();
	}

	static init (selector) {
		if (Object.keys (this.credits ()).length > 0) {
			$_(selector).append (this.html ());
			$_(`${selector} [data-menu="main"] [data-ui="inner-menu"]`).append ('<button data-action="open-menu" data-open="credits" data-string="Credits">Credits</button>');
			$_(`${Monogatari.selector} [data-menu="credits"] [data-ui="credits"]`).html (this.render ());
		}
		return Promise.resolve ();
	}

	static render () {
		const items = Object.keys (this.credits ()).map ((section) => {
			return Monogatari.component ('CREDITS_MENU_ITEM').render (section, this.credits (section));
		});

		$_(`${Monogatari.selector} [data-menu="credits"] [data-ui="credits"]`).html (items);
	}
}

CreditsMenu._state = {};
CreditsMenu._id = 'CREDITS_MENU';

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