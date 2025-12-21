import type { Properties } from '@aegis-framework/pandora';

import Component from '../../lib/Component';

/**
 * Props for TypeCharacter component.
 * Either displays a single character OR a void HTML element.
 */
export interface TypeCharacterProps extends Properties {
	/** The character to display (false if this is a void element) */
	letter: string | false;
	/** Marks this as a <br> void element */
	br?: boolean;
	/** Marks this as a <hr> void element */
	hr?: boolean;
	/** Marks this as an <img> void element */
	img?: boolean;
}

/**
 * State for TypeCharacter component.
 */
export interface TypeCharacterState extends Properties {
	/** Enclosed action IDs that apply to this character (e.g., { "style-123": true }) */
	special?: Record<string, boolean>;
	/** For void elements: HTML attributes like src, alt, class, etc. */
	[key: string]: unknown;
}

/** The void element types supported */
type VoidElementType = 'br' | 'hr' | 'img';

class TypeCharacter extends Component<TypeCharacterProps, TypeCharacterState> {
	constructor () {
		super();

		this.props = {
			letter: false
		};
	}

	/**
	 * Get the void element type if this character represents one.
	 */
	private _getVoidElementType (): VoidElementType | null {
		if (this.props.br) return 'br';
		if (this.props.hr) return 'hr';
		if (this.props.img) return 'img';
		return null;
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
