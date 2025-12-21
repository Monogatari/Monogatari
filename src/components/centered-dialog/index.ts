import Component from '../../lib/Component';

class CenteredDialog extends Component {
  static override tag = 'centered-dialog';

	constructor () {
		super ();
	}

	override async willRollback () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove ();
	}

	override async onReset () {
		this.remove ();
	}

	override render (): string {
		return `
			<type-writer data-content="wrapper"></type-writer>
		`;
	}
}

export default CenteredDialog;