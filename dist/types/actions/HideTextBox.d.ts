import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideTextBox extends Action {
    static id: string;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static onLoad(): Promise<void>;
    static matchString([hide, type]: string[]): boolean;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideTextBox;
//# sourceMappingURL=HideTextBox.d.ts.map