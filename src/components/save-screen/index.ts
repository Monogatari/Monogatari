import { ScreenComponent } from '../../lib/ScreenComponent';
import { DateTime } from 'luxon';

class SaveScreen extends ScreenComponent {
	static override bind (_selector?: string): Promise<void> {
		this.instances().on('click', '[data-action="save"]', () => {
			const value = this.instances().find('[data-content="slot-name"]').value();
			const slotName = (typeof value === 'string' ? value : '').trim();
			if (slotName !== '') {

				(this.engine as any).saveTo('SaveLabel', null, slotName);
			}
		});
		return Promise.resolve();
	}

	override onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		super.onStateUpdate(property, oldValue, newValue);
		if (property === 'open' && newValue === true) {
			this.content('slot-name').value(DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS));
		}
		return Promise.resolve();
	}

	render (): string {

		const engine = this.engine as any;
		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<div class="horizontal horizontal--center">
				<input type="text" placeholder="Save Slot Name" data-input="slotName" data-content="slot-name" required>
				<button data-string="Save" data-action="save">Save</button>
			</div>
			<div data-ui="slots" data-content="slots" class="row row--spaced padded">
			<slot-container label=${engine.setting('SaveLabel')} type="save"></slot-container>
			</div>
		`;
	}
}

SaveScreen.tag = 'save-screen';

export default SaveScreen;
