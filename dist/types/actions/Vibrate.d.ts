import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Vibrate extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    time: number[] | undefined;
    constructor([action, ...time]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Vibrate;
//# sourceMappingURL=Vibrate.d.ts.map