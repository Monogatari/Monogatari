import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class SettingsMenu extends Component {

	static html (html = null) {
		if (html !== null) {
			SettingsMenu._html = html;
		} else {
			return SettingsMenu._html;
		}
	}

	static setup (selector) {
		$_(selector).append (SettingsMenu.html ());
		return Promise.resolve ();
	}
}

SettingsMenu._configuration = {};
SettingsMenu._state = {};
SettingsMenu._id = 'Settings';

SettingsMenu._html = `
	<section data-menu="settings" class="text--center">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Settings">Settings</h2>
		<div class="row row--spaced padded text---center">
			<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">
				<div data-settings="audio" class="vertical vertical--center text--center">
					<h3 data-string="Audio">Audio</h3>
					<span data-string="Music">Music Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="music">
					<span data-string="Sound">Sound Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="sound">
					<span data-string="Voice">Voice Volume:</span>
					<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="voice">
				</div>
			</div>

			<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">

				<div data-settings="text-speed">
					<h3 data-string="TextSpeed">Text Speed</h3>
					<input type="range" min="1" max="50" step="1" data-action="set-text-speed">
				</div>

				<div data-settings="auto-play-speed">
					<h3 data-string="AutoPlaySpeed">Auto Play Speed</h3>
					<input type="range" min="0" max="60" step="1" data-action="set-auto-play-speed">
				</div>
				<div data-settings="language">
					<h3 data-string="Language">Language</h3>
					<div class="horizontal horizontal--center">
						<select data-action="set-language">
								<option value="English">English</option>
								<option value="Español">Español</option>
								<option value="Français">Français</option>
								<option value="日本語">日本語</option>
								<option value="Nederlands">Nederlands</option>
							</select>
						<span class="fas fa-sort" data-select="set-language"></span>
					</div>

				</div>

				<div data-settings="resolution" data-platform="electron">
					<h3 data-string="Resolution">Resolution</h3>
					<div class="horizontal">
						<select data-action="set-resolution"></select>
						<span class="fas fa-sort" data-select="set-resolution"></span>
					</div>
				</div>
			</div>
		</div>
	</section>
`;

Monogatari.registerComponent (SettingsMenu);