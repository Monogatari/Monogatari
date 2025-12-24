import type { Properties } from '@aegis-framework/pandora';

import Component from '../../lib/Component';

// Either displays a single character OR a void HTML element.
export interface TypeCharacterProps extends Properties {
	// The character to display (false if this is a void element)
	letter: string | false;
	// Marks this as a <br> void element
	br?: boolean;
	// Marks this as a <hr> void element
	hr?: boolean;
	// Marks this as an <img> void element
	img?: boolean;
	// Character index for staggered animations
	charIndex?: number;
}

export interface TypeCharacterState extends Properties {
	// Enclosed action IDs that apply to this character (e.g., { "shake-123": true })
	special?: Record<string, boolean>;
	// For void elements: HTML attributes like src, alt, class, etc.
	[key: string]: unknown;
}

// The void element types supported
type VoidElementType = 'br' | 'hr' | 'img';

class TypeCharacter extends Component<TypeCharacterProps, TypeCharacterState> {
	// Cache of currently applied effect attributes
	private _appliedEffects: Set<string> = new Set();

	constructor () {
		super();

		this.props = {
			letter: false
		};
	}

	private _getVoidElementType (): VoidElementType | null {
		if (this.props.br) return 'br';
		if (this.props.hr) return 'hr';
		if (this.props.img) return 'img';
		return null;
	}

	// Extract effect names from special state keys.
	// Keys are in format "effectName-uniqueId" (e.g., "shake-123")
	private _extractEffectNames (): string[] {
		if (!this.state.special) return [];

		return Object.keys(this.state.special)
			.filter(key => this.state.special![key])
			.map(key => {
				// Extract effect name by removing the -uniqueId suffix
				const lastDashIndex = key.lastIndexOf('-');
				return lastDashIndex > 0 ? key.substring(0, lastDashIndex) : key;
			});
	}

	// Apply effect data attributes to the element based on special state.
	private _applyEffectAttributes (): void {
		const effects = this._extractEffectNames();

		// Remove old effects that are no longer active
		for (const oldEffect of this._appliedEffects) {
			if (!effects.includes(oldEffect)) {
				this.removeAttribute(`data-effect-${oldEffect}`);
				this._appliedEffects.delete(oldEffect);
			}
		}

		// Apply new effects
		for (const effect of effects) {
			if (!this._appliedEffects.has(effect)) {
				this.setAttribute(`data-effect-${effect}`, '');
				this._appliedEffects.add(effect);
			}
		}

		// Set character index for staggered animations (wave, glitch-slow, etc.)
		if (typeof this.props.charIndex === 'number') {
			this.style.setProperty('--char-index', String(this.props.charIndex));
		}
	}

	override didMount (): Promise<void> {
		this._applyEffectAttributes();
		return Promise.resolve();
	}

	override onStateUpdate (property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		if (property === 'special') {
			this._applyEffectAttributes();
		}
		return Promise.resolve();
	}

	override onPropsUpdate (property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		if (property === 'charIndex') {
			if (typeof this.props.charIndex === 'number') {
				this.style.setProperty('--char-index', String(this.props.charIndex));
			}
		}
		return Promise.resolve();
	}

	render (): string {
		const { letter } = this.props;
		const voidType = this._getVoidElementType();

		// Render void element
		if (voidType) {
			const attrs = Object.entries(this.state)
				.filter(([key, value]) => value !== undefined && key !== 'special')
				.map(([key, value]) => `${key}="${value}"`)
				.join(' ');

			return attrs ? `<${voidType} ${attrs} />` : `<${voidType} />`;
		}

		// Render character
		return letter || '';
	}
}

TypeCharacter.tag = 'type-character';

export default TypeCharacter;
