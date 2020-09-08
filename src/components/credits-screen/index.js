import { ScreenComponent } from './../../lib/ScreenComponent';

class CreditsScreen extends ScreenComponent {

	static init () {
		if (Object.keys (this.engine.configuration ('credits')).length > 0) {
			this.engine.component ('main-menu').addButton ({
				string: 'Credits',
				data: {
					action: 'open-screen',
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
			let html = `<h3>${this.engine.replaceVariables (section)}</h3><div>`;
			const content = this.props.credits[section];

			if (typeof content === 'string') {
				return `
					<p class='row row--spaced'>
						<span class="row__column row__column--phone--12">${content}</span>
					</p>`;
			}

			for (const key of Object.keys (content)) {
				const title = this.engine.replaceVariables (key);
				let value = content[key];

				if (value instanceof Array) {
					value = value.join (', ');
				}

				if (typeof value === 'string') {
					value = this.engine.replaceVariables (value);
				}

				if (title.indexOf ('_') === 0) {
					html += `<p class='row row--spaced'>
								<span class="row__column row__column--phone--12">${value}</span>
							</p>`;
				} else {
					html += `<p class='row row--spaced'>
								<b class="row__column row__column--phone--6">${title}</b>
								<span class="row__column row__column--phone--6">${value}</span>
							</p>`;
				}

			}
			html += '</div>';

			return html;
		}).join ('');

		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<h2 data-string="Credits" data-content="title">Credits</h2>
			<div data-content="credits" data-ui="credits">
				${items}
			</div>
		`;
	}
}

CreditsScreen.tag = 'credits-screen';


export default CreditsScreen;