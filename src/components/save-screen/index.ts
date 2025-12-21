import { ScreenComponent } from '../../lib/ScreenComponent';
import { DateTime } from 'luxon';

class SaveScreen extends ScreenComponent {
  static override tag = 'save-screen';

	static override async bind (_selector?: string): Promise<void> {
		this.instances().on('click', '[data-action="save"]', () => {
			const value = this.instances().find('[data-content="slot-name"]').value();
			const slotName = (typeof value === 'string' ? value : '').trim();

			if (slotName !== '') {
			  this.engine.saveTo('SaveLabel', null, slotName);
			}
		});
	}

	override async onStateUpdate (property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		super.onStateUpdate(property, oldValue, newValue);

		if (property === 'open' && newValue === true) {
      const currentTime = DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
			this.content('slot-name').value(currentTime);
		}
	}

	render (): string {
		const engine = this.engine;
    const saveLabel = engine.setting('SaveLabel') as string;

		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<div class="horizontal horizontal--center">
				<input type="text" placeholder="Save Slot Name" data-input="slotName" data-content="slot-name" required>
				<button data-string="Save" data-action="save">Save</button>
			</div>
			<div data-ui="slots" data-content="slots" class="row row--spaced padded">
			<slot-container label=${saveLabel} type="save"></slot-container>
			</div>
		`;
	}
}

export default SaveScreen;
