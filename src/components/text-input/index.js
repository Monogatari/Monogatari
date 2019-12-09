import { Component } from './../../lib/Component';

class TextInput extends Component {

	constructor () {
		super ();

		this.state = {
			active: true,
		};

		this.props = {
			text: '',
			warning: '',
			onSubmit: () => {},
			validate: () => {},
			callback: () => {},
		};
	}

	shouldProceed () {
		return Promise.reject ('Text Input is awaiting user input.');
	}

	willRollback () {
		this.remove ();
		return Promise.resolve ();
	}

	onStateUpdate (property, oldValue, newValue) {
		if (property === 'active') {
			if (newValue === true) {
				this.classList.toggle ('modal--active');
			}
		}
		return Promise.resolve ();
	}

	willMount () {
		this.classList.add ('modal', 'modal--active');
		return Promise.resolve ();
	}

	didMount () {
		this.addEventListener ('submit', (event) => {
			event.stopPropagation ();
			event.preventDefault ();

			// Retrieve the value submitted
			const inputValue = this.content ('field').value ();

			// Run the validation function asynchronously. If it returns false,
			// it means the input is invalid and we have to show the warning message.
			this.engine.assertAsync (this.props.validate, this.engine, [inputValue]).then (() => {

				// Once validation was done, we run the Save function where usually,
				// the input received will be saved on the storage or used for other
				// actions.
				this.engine.assertAsync (this.props.onSubmit, this.engine, [inputValue]).then (() => {
					// Nothing to do here
				}).catch (() => {
					// Nothing to do here
				}).finally (() => {
					this.remove ();
					this.props.callback ();
				});
			}).catch (() => {
				// Show the warning message since the input was invalid
				this.content ('warning').text (this.props.warning);
			});
		});

		this.content ('field').get (0).focus ();
		return Promise.resolve ();
	}

	render () {
		return `
			<form class="modal__content">
				<p data-content="message" >${this.props.text}</p>
				<input data-content="field" type="text">
				<small data-content="warning" class="block"></small>
				<div>
					<button type='submit'>${this.engine.string ('OK')}</button>
				</div>
			<form>
		`;
	}
}


TextInput.tag = 'text-input';


export default TextInput;