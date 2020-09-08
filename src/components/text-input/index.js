import { $_ } from '@aegis-framework/artemis';
import { Component } from './../../lib/Component';

class TextInput extends Component {

	constructor () {
		super ();

		this.state = {
			active: true,
		};

		this.props = {
			text: '',
			type: 'text',
			default: '',
			options: [],
			warning: '',
			actionString: 'OK',
			onSubmit: () => {},
			validate: () => {},
			callback: () => {},
			classes: ''
		};
	}

	shouldProceed () {
		return Promise.reject ('Input is awaiting user input.');
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
		this.addEventListener ('submit', (event) => {
			event.stopPropagation ();
			event.preventDefault ();
			let inputValue = '';
			// Retrieve the value submitted
			if (this.props.type === 'radio') {
				inputValue = this.element ().find ('[data-content="field"]:checked').value ();
			} else if (this.props.type === 'checkbox') {
				inputValue = [];
				this.element ().find ('[data-content="field"]:checked').each ((element) => {
					inputValue.push($_(element).value ());
				});
			} else {
				inputValue = this.content ('field').value ();
			}


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
		const { type, default: defaultValue, options } = this.props;
		const text = ['text', 'password', 'email', 'url', 'number', 'color'];
		let input = '';

		if (text.indexOf (type) > -1) {
			input = `<input data-content="field" name="field" type="${type}" ${defaultValue !== '' ? `value="${defaultValue}"` : ''} >`;
		} else if (type === 'select') {
			input = `
				<select data-content="field" name="field">
				${options.map ((o) => `<option value="${o.value}" ${defaultValue !== '' && defaultValue == o.value ? 'selected' : ''}>${o.label}</option>`).join ('')}
				</select>
			`;

		} else if (type === 'radio' || type === 'checkbox') {
			input = options.map ((o, index) => `<div class="input-pair"><input data-content="field" id="field_${index}" name="field" type="${type}" value="${o.value}" ${defaultValue !== '' && defaultValue == o.value ? 'checked' : ''}><label for="field_${index}">${o.label}</label></div>`).join ('');
		}
		return `
			<form class="modal__content">
				<p data-content="message" >${this.props.text}</p>
				${input}
				<small data-content="warning" class="block"></small>
				<div>
					<button type='submit'>${this.engine.string (this.props.actionString)}</button>
				</div>
			<form>
		`;
	}
}


TextInput.tag = 'text-input';


export default TextInput;