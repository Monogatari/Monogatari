import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideCanvas extends Action {
    static id: string;
    static matchString([hide, type]: string[]): boolean;
    name: string;
    object: any;
    element: any;
    classes: string[];
    constructor([hide, canvas, name, separator, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideCanvas;
//# sourceMappingURL=HideCanvas.d.ts.map