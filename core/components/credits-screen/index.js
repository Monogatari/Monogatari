import { ScreenComponent } from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';

class CreditsScreen extends ScreenComponent {

	static init () {
		if (Object.keys (this.engine.configuration ('credits')).length > 0) {
			this.engine.component ('main-menu').addButton ({
				string: 'Credits',
				data: {
					action: 'open-menu',
					open: 'credits'
				}
			});
		}
		return Promise.resolve ();
	}

	constructor () {
		super ();

		this.props = {
			credits: {}
		};
	}

	willMount () {
		super.willMount ();
		this.setProps ({
			credits: this.engine.configuration ('credits')
		});
		return Promise.resolve ();
	}

	render () {
		const items = Object.keys (this.props.credits).map ((section) => {
			let html = `<h3>${section}</h3><div>`;
			const content = this.props.credits[section];

			if (typeof content === 'string') {
				return `
					<p class='row row--spaced'>
						<span class="row__column row__column--phone--12">${content}</span>
					</p>`;
			}

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

		return `
			<button class="fas fa-arrow-left top left" data-action="back"></button>
			<h2 data-string="Credits" data-content="title">Credits</h2>
			<div data-content="credits" data-ui="credits">
				${items}
			</div>
		`;
	}
}

CreditsScreen.tag = 'credits-screen';

Monogatari.registerComponent (CreditsScreen);