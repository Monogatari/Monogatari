import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class HelpScreen extends Component {

	static setup (selector) {
		$_(selector).append (HelpScreen.html ());
		return Promise.resolve ();
	}
}

HelpScreen._configuration = {};
HelpScreen._state = {};
HelpScreen._id = 'help-screen';

HelpScreen._html = `
	<section data-component="help-screen" data-screen="help">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Help">Help</h2>
		<div class="row row--spaced" data-content="help">
			<p data-string="AdvanceHelp" class="row__column--12">To advance through the game, left-click or tap anywhere on the game screen or press the space key</p>
			<div class="row__column--12 row__column--tablet--6 text--left row row--spaced">
				<div class="row__column--12">
					<h3 data-string="QuickMenu">Quick Menu</h3>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2 row" data-content="symbols">
						<span class="fas fa-arrow-left" data-content="icon"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="BackButton">Go back</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-eye"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="HideButton">Hide the text box</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="far fa-comments"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="DialogLogButton">Show the dialog log</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-play-circle"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="AutoPlayButton">Enable auto play</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-fast-forward"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SkipButton">Enter skip mode</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-save"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SaveButton">Open the Save Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-undo"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="LoadButton">Open the Load Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
				<div class="row__column--2" data-content="symbols">
					<span class="fas fa-cog"></span>
						</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SettingsButton">Open the Settings Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span class="fas fa-times-circle"></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="QuitButton">Quit Game</span>
					</div>
				</div>
			</div>
			<div class="row__column--12 row__column--tablet--6 text--left row row--spaced">
				<div class="row__column--12">
					<h3 data-string="KeyboardShortcuts">Keyboard Shortcuts</h3>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2 row" data-content="symbols">
						<span data-content="shortcut"><span class="fas fa-arrow-left" data-content="icon"></span></span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="BackButton">Go Back</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">H</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="HideButton">Hide the text box</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">A</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="AutoPlayButton">Enable auto play</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">S</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SkipButton">Enter skip mode</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ S</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SaveButton">Open the Save Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ L</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="LoadButton">Open the Load Screen</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">ESC</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="SettingsButton">Open the Settings Screen.</span>
					</div>
				</div>
				<div class="row__column--12 row">
					<div class="row__column--2" data-content="symbols">
						<span data-content="shortcut">⇧ Q</span>
					</div>
					<div class="row__column--10" data-content="instruction">
						<span data-string="QuitButton">Quit Game</span>
					</div>
				</div>
			</div>
		</div>
	</section>
`;

Monogatari.registerComponent (HelpScreen);