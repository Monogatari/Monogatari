import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
export interface SlotContainerProps extends Properties {
    type: 'load' | 'save';
    label?: string;
}
export interface SlotContainerState extends Properties {
    slots: string[];
}
declare class SlotContainer extends Component<SlotContainerProps, SlotContainerState> {
    static tag: string;
    static bind(): Promise<void>;
    constructor();
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    render(): string;
}
export default SlotContainer;
//# sourceMappingURL=index.d.ts.map