import Action from './../lib/Action';
import { ActionRevertResult } from '../lib/types';
export declare class InputModal extends Action {
    static id: string;
    static blocking: boolean;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static afterRevert(): Promise<void>;
    static shouldProceed(_options?: {
        userInitiated?: boolean;
        skip?: boolean;
        autoPlay?: boolean;
    }): Promise<void>;
    static willRollback(): Promise<void>;
    static matchObject({ Input }: any): boolean;
    statement: any;
    constructor({ Input }: any);
    apply(): Promise<void>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default InputModal;
//# sourceMappingURL=InputModal.d.ts.map