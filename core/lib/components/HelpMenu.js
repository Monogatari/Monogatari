import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class HelpMenu extends Component {

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
		$_(selector).append (HelpMenu.html ());
		return Promise.resolve ();
	}
}

HelpMenu._configuration = {};
HelpMenu._state = {};
HelpMenu._id = 'HELP_MENU';

HelpMenu._html = `
	<section data-menu="help">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Help">Help</h2>
		<div class="text--left padded">
			<p data-string="AdvanceHelp">To advance through the game, click anywhere on the game screen or press the space key.</p>
			<h3 data-string="QuickButtons">Quick Menu Buttons</h3>
			<p><span class="fas fa-arrow-left"></span> <span data-string="BackButton">Back.</span></p>
			<p><span class="fas fa-eye"></span> <span data-string="HideButton">Hide Text.</span></p>
			<p><span class="fas fa-save"></span> <span data-string="SaveButon">Open the Save Screen.</span></p>
			<p><span class="fas fa-undo"></span> <span data-string="LoadButton">Open the Load Screen.</span></p>
			<p><span class="fas fa-cog"></span> <span data-string="SettingsButton">Open the Settings Screen.</span></p>
			<p><span class="fas fa-times-circle"></span> <span data-string="QuitButton">Quit Game.</span></p>
		</div>
	</section>
`;

Monogatari.registerComponent (HelpMenu);