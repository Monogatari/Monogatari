import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Wait extends Action {
    static id: string;
    static blocking: boolean;
    static matchString([action]: string[]): boolean;
    static shouldProceed(_options?: {
        userInitiated?: boolean;
        skip?: boolean;
        autoPlay?: boolean;
    }): Promise<void>;
    static willRollback(): Promise<void>;
    time: number | null;
    constructor([action, time]: string[]);
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Wait;
//# sourceMappingURL=Wait.d.ts.map