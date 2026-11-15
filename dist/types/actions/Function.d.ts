import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ReversibleFunction extends Action {
    static id: string;
    static matchObject({ Function: fn }: any): boolean;
    statement: any;
    shouldContinue: boolean;
    constructor({ Function: fn }: any);
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    willApply(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default ReversibleFunction;
//# sourceMappingURL=Function.d.ts.map