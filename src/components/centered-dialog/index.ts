import Component from '../../lib/Component';
import type TypeWriter from '../type-writer';

class CenteredDialog extends Component {
	static override tag = 'centered-dialog';

	constructor () {
		super ();
	}

	/**
	 * Cleanup any running type-writer animation before removal
	 */
	private _cleanupTypeWriter (): void {
		const typeWriter = this.querySelector('type-writer') as TypeWriter | null;
		if (typeWriter && typeof typeWriter.destroy === 'function') {
			typeWriter.destroy();
		}
	}

	override async willRollback () {
		// Clean up type-writer animation before removing
		this._cleanupTypeWriter();
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove ();
	}

	override async onReset () {
		this._cleanupTypeWriter();
		this.remove ();
	}

	override async willUnmount () {
		this._cleanupTypeWriter();
	}

	override render (): string {
		return `
			<type-writer data-content="wrapper"></type-writer>
		`;
	}
}

export default CenteredDialog;