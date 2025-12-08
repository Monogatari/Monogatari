import { Component } from '../../lib/Component';

class TypeCharacter extends Component {
	constructor () {
		super();

		this.props = {
			letter: false
		};
	}

	render (): string {
		const letter = (this.props as { letter: string | false }).letter;

		const _props = (this as any)._props as Record<string, unknown>;

		const _state = (this as any)._state as Record<string, unknown>;

		const props = Object.keys(_props).map(e => (e !== 'letter' ? e : false));

		if (props[1]) {
			let text = props[1] as string;

			if (Object.values(_state).length) {
				text += ' ' + Object.entries(_state)
					.map(([key, value]) => value && key === text ? `${key}="${value}"` : '')
					.join(' ');
			}

			return `<${text} />`;
		}

		return letter || '';
	}
}

TypeCharacter.tag = 'type-character';

export default TypeCharacter;
