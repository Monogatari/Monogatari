import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ShowBackground extends Action {
    static id: string;
    static setup(): Promise<void>;
    static onLoad(): Promise<void>;
    static reset(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    background: string;
    property: string;
    value: string;
    classes: string[];
    constructor([show, type, background, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default ShowBackground;
//# sourceMappingURL=ShowBackground.d.ts.map