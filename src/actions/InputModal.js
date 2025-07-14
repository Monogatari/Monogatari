import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class InputModal extends Action {

	static setup () {
		this.engine.global ('_InputTimer', null);

		this.engine.global ('_input_just_rolled_back', false);

		return Promise.resolve ();
	}

	static reset () {
		this.engine.global ('_InputTimer', null);

		this.engine.global ('_input_just_rolled_back', false);

		return Promise.resolve ();
	}

	static afterRevert () {
		// When a choice gets reverted, it pushes a `true` value to this global variable.
		// As soon as it gets reverted, this function is run and it pops the `true` out of
		// the array, meaning it was just reverted and the choice should be showing on screeen again.
		if (this.engine.global ('_input_just_rolled_back')) {
			this.engine.global ('_input_just_rolled_back', false);
			return Promise.resolve ();
		}

		// If the player reverts once more while the choice is being shown, then we'll reach this part
		// and we can clean up any variables we need to.
		const timer = this.engine.global ('_InputTimer');

		if (timer !== null) {
			clearTimeout (timer.props.timer);
			if (timer.parentNode !== null) {
				timer.element ().remove ();
			}
			this.engine.global ('_InputTimer', null);
		}
		return Promise.resolve ();
	}


	static matchObject ({ Input }) {
		return typeof Input !== 'undefined';
	}

	constructor ({ Input }) {
		super ();
		this.statement = Input;

		if (typeof this.statement.Validation !== 'function') {
			this.statement.Validation = () => true;
		}

		if (typeof this.statement.Save !== 'function') {
			this.statement.Save = () => true;
		}

		if (typeof this.statement.Warning !== 'string') {
			this.statement.Warning = '';
		}

		if (typeof this.statement.actionString !== 'string') {
			this.statement.actionString = 'OK';
		}

		if (typeof this.statement.Class !== 'string') {
			this.statement.Class = '';
		}

		if (['string', 'number'].indexOf (typeof this.statement.Default) === -1 || this.statement.Default === '') {
			this.statement.Default = null;
		}

		if (typeof this.statement.Type !== 'string') {
			this.statement.Type = 'text';
		}

		if (typeof this.statement.Options !== 'object' || this.statement.Options === null) {
			this.statement.Options = [];
		}

		if (typeof this.statement.Timer !== 'object') {
			this.statement.Timer = null;
		}

		if (typeof this.statement.Attributes !== 'object') {
			this.statement.Attributes = {};
		}
	}

	apply () {
		this.engine.global ('block', true);

		const input = document.createElement ('text-input');

		const { Text, Warning, Save, Validation, actionString, Class, Type, Options, Default, Timer, Attributes } = this.statement;

		input.setProps ({
			text: this.engine.replaceVariables (Text),
			type: Type,
			options: Options,
			default: Default,
			warning: Warning,
			onSubmit: Save,
			validate: Validation,
			attributes: Attributes,
			actionString,
			callback: () => {
				const timer = this.engine.global ('_InputTimer');

				if (timer !== null) {
					clearTimeout (timer.props.timer);
					if (timer.parentNode !== null) {
						timer.element ().remove ();
					}
					this.engine.global ('_InputTimer', null);
				}

				this.engine.global ('block', false);
				this.engine.proceed ({ userInitiated: true, skip: false, autoPlay: false });
			},
			classes: Class.trim ()
		});

		if (Timer !== null) {
			const timer_display = document.createElement ('timer-display');
			timer_display.setProps (Timer);
			this.engine.global ('_InputTimer', timer_display);
			this.engine.element ().find ('[data-screen="game"]').prepend (timer_display);
		}

		this.engine.element ().find ('[data-screen="game"]').append (input);

		return Promise.resolve ();
	}

	willRevert () {
		if (typeof this.statement.Revert === 'function') {
			return Promise.resolve ();
		}
		return Promise.reject ('Input is missing a `Revert` function.');
	}

	revert () {
		return Util.callAsync (this.statement.Revert, this.engine).then (() => {
			return this.apply ();
		});
	}

	didRevert () {
		this.engine.global ('_input_just_rolled_back', true);
		return Promise.resolve ({ advance: false, step: true });
	}
}

InputModal.id = 'Input';

export default InputModal;