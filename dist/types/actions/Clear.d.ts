import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Clear extends Action {
    static id: string;
    static setup(): Promise<void>;
    static matchString([action]: string[]): boolean;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Clear;
//# sourceMappingURL=Clear.d.ts.map