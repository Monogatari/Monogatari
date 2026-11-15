import Action from '../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Choice extends Action {
    static id: string;
    static blocking: boolean;
    static setup(): Promise<void>;
    static bind(): Promise<void>;
    static reset(): Promise<void>;
    static afterRevert(): Promise<void>;
    static shouldProceed(_options?: {
        userInitiated?: boolean;
        skip?: boolean;
        autoPlay?: boolean;
    }): Promise<void>;
    static willRollback(): Promise<void>;
    static matchObject(statement: any): boolean;
    statement: any;
    result: ActionApplyResult;
    constructor(statement: any);
    apply({ updateLog }?: {
        updateLog?: boolean | undefined;
    }): Promise<void>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Choice;
//# sourceMappingURL=Choice.d.ts.map