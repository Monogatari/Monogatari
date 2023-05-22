import { $_ } from '@aegis-framework/artemis/index';
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
			default: null,
			options: [],
			warning: '',
			actionString: 'OK',
			onSubmit: () => {},
			validate: () => {},
			callback: () => {},
			classes: '',
			attributes: {},
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
				const checked = this.element ().find ('[data-content="field"]:checked');
				if (checked.exists () > 0) {
					inputValue = checked.value ();
				} else {
					inputValue = '';
				}

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
				this.content ('warning').text (this.engine.replaceVariables (this.props.warning));
			});
		});

		// For inputs that require a text field, we place the default value after
		// mount instead of in-creation because this way, the cursor will be placed
		// at the end of the default value. If we did it in-creation, it would
		// be placed at the start.
		const text = ['text', 'textarea', 'password', 'email', 'url', 'number', 'color'];
		const { type, default: defaultValue, options } = this.props;

		if (text.indexOf (type) > -1) {
			if (defaultValue !== null && defaultValue !== '') {
				this.content ('field').value (defaultValue);
			}
		}
		this.content ('field').get (0).focus ();
		return Promise.resolve ();
	}

	render () {
		const { type, default: defaultValue, options, attributes } = this.props;
		const text = ['text', 'password', 'email', 'url', 'number', 'color', 'file', 'date', 'datetime-local', 'month', 'time', 'week', 'tel', 'range'];
		let input = '';
		let attr = '';

		if (typeof attributes === 'object' && attributes !== null) {
			attr = Object.keys (attributes).map ((key) => {
				let value = attributes[key];

				// If it's a string value, we'll do the variable interpolation
				// for it.
				if (typeof value === 'string') {
					value = this.engine.replaceVariables (value);
				}

				return `${key}="${value}"`;
			}).join (' ');
		}

		if (text.indexOf (type) > -1) {
			input = `<input data-content="field" name="field" type="${type}" tabindex="0" ${attr}>`;
		} else if (type === 'textarea') {
			input = `<textarea data-content="field" name="field" type="${type}" tabindex="0" ${attr}></textarea>`;
		} else if (type === 'select') {
			const optionElements = options.map ((o) => {
				let selected = '';
				let parsedDefault = defaultValue;

				// If the default value provided is a string, we need to do the variable
				// interpolation for it.
				if (typeof defaultValue === 'string' && defaultValue !== null && defaultValue !== '') {
					parsedDefault = this.engine.replaceVariables (defaultValue);
					// We're doing a == comparisson instead of === since the numeric
					// values could be a string.
					if (parsedDefault == this.engine.replaceVariables (o.value)) {
						selected = 'selected';
					}
				} else if (typeof defaultValue === 'number') {
					// We're doing a == comparisson instead of === since the numeric
					// values could be a string.
					if (parsedDefault == o.value) {
						selected = 'selected';
					}
				}
				return `<option value="${typeof o.value === 'string' ? this.engine.replaceVariables (o.value) : o.value}" ${selected}>${this.engine.replaceVariables (o.label)}</option>`;
			}).join ('');

			input = `<select data-content="field" name="field" tabindex="0" ${attr}>${optionElements}</select>`;

		} else if (type === 'radio' || type === 'checkbox') {
			input = options.map ((o, index) => {
				let checked = '';
				let parsedDefault = defaultValue;

				// If the default value provided is a string, we need to do the variable
				// interpolation for it.
				if (typeof defaultValue === 'string' && defaultValue !== null && defaultValue !== '') {
					parsedDefault = this.engine.replaceVariables (defaultValue);
					// We're doing a == comparisson instead of === since the numeric
					// values could be a string.
					if (parsedDefault == this.engine.replaceVariables (o.value)) {
						checked = 'checked';
					}
				} else if (typeof defaultValue === 'number') {
					// We're doing a == comparisson instead of === since the numeric
					// values could be a string.
					if (parsedDefault == o.value) {
						checked = 'checked';
					}
				}

				return `
					<div class="input-pair">
						<input data-content="field" id="field_${index}" name="field" type="${type}" value="${typeof o.value === 'string' ? this.engine.replaceVariables (o.value) : o.value}" ${checked} tabindex="0" ${attr}>
						<label for="field_${index}">${this.engine.replaceVariables (o.label)}</label>
					</div>
				`;
			}).join ('');
		}
		return `
			<form class="modal__content">
				<p data-content="message" >${this.props.text}</p>
				${input}
				<small data-content="warning" class="block"></small>
				<div>
					<button type='submit' tabindex="0">${this.engine.string (this.props.actionString)}</button>
				</div>
			<form>
		`;
	}
}


TextInput.tag = 'text-input';


export default TextInput;