import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class CreditsScreen extends Component {

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

	static setup (selector) {
		$_(selector).append (this.html ());
		return Promise.resolve ();
	}

	static init (selector) {
		if (Object.keys (this.credits ()).length > 0) {
			$_(`${selector} [data-screen="main"] [data-ui="inner-menu"]`).append ('<button data-action="open-screen" data-open="credits" data-string="Credits">Credits</button>');
			this.render ();
		}
		return Promise.resolve ();
	}

	static render () {
		const items = Object.keys (this.credits ()).map ((section) => {
			return Monogatari.component ('credits-screen__item').render (section, this.credits (section));
		});

		this.content ('credits').html (items);
		return Promise.resolve ();
	}
}

CreditsScreen._id = 'credits-screen';

CreditsScreen._html = `
	<section data-component="credits-screen" data-screen="credits">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Credits" data-content="title">Credits</h2>
		<div data-content="credits" data-ui="credits"></div>
	</section>
`;

CreditsScreen._configuration = {
	credits: {}
};

Monogatari.registerComponent (CreditsScreen);