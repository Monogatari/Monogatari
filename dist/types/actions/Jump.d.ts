import Action from './../lib/Action';
import { ActionRevertResult } from '../lib/types';
export declare class Jump extends Action {
    static id: string;
    static setup(): Promise<void>;
    static bind(selector: string): Promise<void>;
    static matchString([action]: string[]): boolean;
    label: string;
    constructor([action, label]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Jump;
//# sourceMappingURL=Jump.d.ts.map