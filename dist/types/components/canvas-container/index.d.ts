import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
/**
 * Canvas object configuration
 */
export interface CanvasObject {
    start: (engine: unknown, layers: Record<string, HTMLCanvasElement | null>, props: Record<string, unknown>, state: Record<string, unknown>, container: CanvasContainer) => unknown;
    stop: () => void;
    restart: () => void;
    layers: string[];
    state: Record<string, unknown>;
    props: Record<string, unknown>;
}
/**
 * Props for CanvasContainer component
 */
export interface CanvasContainerProps extends Properties {
    mode: string | null;
    canvas: string | null;
    character: string | null;
    object: CanvasObject;
    classes: string[];
}
/**
 * State for CanvasContainer component
 */
export interface CanvasContainerState extends Properties {
    layers: Record<string, HTMLCanvasElement | null>;
}
declare class CanvasContainer extends Component<CanvasContainerProps, CanvasContainerState> {
    static tag: string;
    layers: Record<string, HTMLCanvasElement | null>;
    constructor();
    onPropsUpdate(_property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    render(): string;
}
export default CanvasContainer;
//# sourceMappingURL=index.d.ts.map