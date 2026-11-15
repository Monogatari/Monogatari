import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
/**
 * Character definition for sprite rendering
 */
export interface CharacterDefinition {
    layers: string[];
    layer_assets?: Record<string, Record<string, string>>;
}
/**
 * Layer state configuration
 */
export interface LayerState {
    asset: string;
    classes: string[];
}
/**
 * Props for CharacterSprite component
 */
export interface CharacterSpriteProps extends Properties {
    character: CharacterDefinition | string;
    src: string;
    directory: string;
    width: number;
    height: number;
    ratio: number;
}
/**
 * State for CharacterSprite component
 */
export interface CharacterSpriteState extends Properties {
    layers: Record<string, LayerState | null>;
}
declare class CharacterSprite extends Component<CharacterSpriteProps, CharacterSpriteState> {
    static tag: string;
    private _resizeHandler;
    constructor();
    onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    onPropsUpdate(property: string, _oldValue: unknown, newValue: unknown, _oldObject: CharacterSpriteProps, newObject: CharacterSpriteProps): Promise<void>;
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    willUnmount(): Promise<void>;
    resize(): void;
    render(): Promise<string>;
}
export default CharacterSprite;
//# sourceMappingURL=index.d.ts.map