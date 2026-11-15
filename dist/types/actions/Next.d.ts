import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Next extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    didApply(): Promise<ActionApplyResult>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Next;
//# sourceMappingURL=Next.d.ts.map