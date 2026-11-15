import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Placeholder extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    name: string;
    action: any;
    arguments: any[];
    constructor([action, name, ...args]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(options?: {
        updateHistory?: boolean;
        updateState?: boolean;
    }): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(context?: ActionRevertResult): Promise<ActionRevertResult>;
}
export default Placeholder;
//# sourceMappingURL=Placeholder.d.ts.map