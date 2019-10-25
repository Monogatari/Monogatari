import { Component } from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class ChoiceContainer extends Component {

	constructor () {
		super ();

		this.props = {
			choices: [],
			classes: ''
		};
	}

	shouldProceed () {
		// If a choice is currently being displayed, the player should not be able
		// to advance until one is chosen.
		return Promise.reject ('Choice Container awaiting for user input.');
	}

	willRollback () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove ();

		return Promise.resolve ();
	}

	onReset () {
		this.remove ();
		return Promise.resolve ();
	}

	willMount () {
		// Check if a list of classes has been defined and if the list is not empty
		if (typeof this.props.classes === 'string' && this.props.classes !== '') {
			this.props.classes.split (' ').forEach ((className) => {
				if (className) {
					this.classList.add (className);
				}
			});
		}
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	render () {
		const choices = this.props.choices.map ((choice) => {
			const choiceText = this.engine.replaceVariables (choice.Text);

			if (typeof choice.Clickable === 'function') {
				return new Promise ((resolve, reject) => {
					this.engine.assertAsync (choice.Clickable, this.engine).then (() => {
						resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}">${choiceText}</button>`);
					}).catch (() => {
						resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}" disabled>${choiceText}</button>`);
					});

				});
			}
			return Promise.resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}">${choiceText}</button>`);
		});

		return Promise.all (choices).then ((choices) => `
			<div data-content="wrapper">
				${ choices.join('') }
			</div>
		`);
	}
}

ChoiceContainer.tag = 'choice-container';


Monogatari.registerComponent (ChoiceContainer);