import { $_ } from '@aegis-framework/artemis';
import { ShadowComponent as PandoraShadowComponent } from '@aegis-framework/pandora';
import { applyComponentMixin } from './ComponentMixin';

/**
 * A shadow component represents an object or content in the game that uses
 * Shadow DOM for style encapsulation. It functions like Component but renders
 * into a shadow root instead of the light DOM.
 *
 * The life cycle follows the same Mounting cycle as Component:
 *
 * 1. Setup - Set up HTML content, configuration, and state variables
 * 2. Bind - Bind event listeners and perform DOM operations
 * 3. Init - Perform final operations
 *
 * @class ShadowComponent
 */
class ShadowComponent extends applyComponentMixin(PandoraShadowComponent) {
	/**
	 * Attempts to find a content element inside of this
	 * component's shadow DOM
	 *
	 * @param name - Name of the content element to find
	 * @returns An Artemis DOM instance with the found elements
	 */
	content (name: string): ReturnType<typeof $_> {
		// Ensure we use the shadow DOM query method instead of light DOM
		const element = this.query(`[data-content="${name}"]`);

		return $_(element);
	}
}

export { ShadowComponent };

