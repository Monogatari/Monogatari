import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
export interface TypeCharacterProps extends Properties {
    letter: string | false;
    br?: boolean;
    hr?: boolean;
    img?: boolean;
    charIndex?: number;
}
export interface TypeCharacterState extends Properties {
    special?: Record<string, boolean>;
    [key: string]: unknown;
}
declare class TypeCharacter extends Component<TypeCharacterProps, TypeCharacterState> {
    private _appliedEffects;
    constructor();
    private _getVoidElementType;
    private _extractEffectNames;
    private _applyEffectAttributes;
    didMount(): Promise<void>;
    onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    onPropsUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    render(): string;
}
export default TypeCharacter;
//# sourceMappingURL=index.d.ts.map