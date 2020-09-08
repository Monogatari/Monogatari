import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class InputModal extends Action {

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

		if (typeof this.statement.Default !== 'string') {
			this.statement.Default = '';
		}

		if (typeof this.statement.Type !== 'string') {
			this.statement.Type = 'text';
		}

		if (typeof this.statement.Options !== 'object' || this.statement.Options === null) {
			this.statement.Options = [];
		}
	}

	apply () {
		this.engine.global ('block', true);

		const input = document.createElement ('text-input');

		const { Text, Warning, Save, Validation, actionString, Class, Type, Options, Default } = this.statement;

		input.setProps ({
			text: this.engine.replaceVariables (Text),
			type: Type,
			options: Options,
			default: Default,
			warning: Warning,
			onSubmit: Save,
			validate: Validation,
			actionString,
			callback: () => {
				this.engine.global ('block', false);
				this.engine.proceed ({ userInitiated: true, skip: false, autoPlay: false });
			},
			classes: Class.trim ()
		});

		this.engine.element ().find ('[data-screen="game"]').append (input);
		return Promise.resolve ();
	}

	willRevert () {
		if (typeof this.statement.Revert === 'function') {
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	revert () {
		return Util.callAsync (this.statement.Revert, this.engine).then (() => {
			return this.apply ();
		});
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}
}

InputModal.id = 'Input';

export default InputModal;