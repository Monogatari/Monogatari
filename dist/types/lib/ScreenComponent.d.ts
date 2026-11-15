import type { Properties } from '@aegis-framework/pandora';
import Component from './Component';
export interface ScreenState extends Properties {
    open: boolean;
}
/**
 * ScreenComponent is a base class for screen-type components.
 * Screens can be opened and closed, with visual state managed automatically.
 *
 * @class ScreenComponent
 * @template P - The type of the component's props (must extend Properties)
 * @template S - The type of the component's state (must extend ScreenState)
 */
declare class ScreenComponent<P extends Properties = Properties, S extends ScreenState = ScreenState> extends Component<P, S> {
    constructor();
    willMount(): Promise<void>;
    onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    render(): string;
}
export default ScreenComponent;
export { ScreenComponent };
//# sourceMappingURL=ScreenComponent.d.ts.map