import { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
export interface TimerDisplayProps extends Properties {
    callback: () => void;
    time: number;
    step: number;
    timer: ReturnType<typeof setTimeout> | null;
    tick: (() => void) | null;
}
export interface TimerDisplayState extends Properties {
    elapsed: number;
    remaining: number;
    value: number;
}
declare class TimerDisplay extends Component<TimerDisplayProps, TimerDisplayState> {
    static tag: string;
    constructor();
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    willUnmount(): Promise<void>;
    render(): Promise<string>;
}
export default TimerDisplay;
//# sourceMappingURL=index.d.ts.map