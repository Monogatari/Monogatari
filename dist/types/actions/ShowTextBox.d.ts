import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ShowTextBox extends Action {
    static id: string;
    static matchString([show, type]: string[]): boolean;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default ShowTextBox;
//# sourceMappingURL=ShowTextBox.d.ts.map