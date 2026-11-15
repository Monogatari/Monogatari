import Action from '../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Conditional extends Action {
    static id: string;
    static blocking: boolean;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static matchObject(statement: any): boolean;
    static shouldProceed(_options?: {
        userInitiated?: boolean;
        skip?: boolean;
        autoPlay?: boolean;
    }): Promise<void>;
    static willRollback(): Promise<void>;
    static afterRevert(): Promise<void>;
    static beforeRun(): Promise<void>;
    statement: any;
    branch: string;
    result: {
        advance: boolean;
        step: boolean;
    };
    constructor(statement: any);
    apply(): Promise<void>;
    didApply({ updateHistory }?: {
        updateHistory?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Conditional;
//# sourceMappingURL=Conditional.d.ts.map