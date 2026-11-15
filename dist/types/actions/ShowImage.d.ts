import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ShowImage extends Action {
    static id: string;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static onLoad(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    asset: string;
    classes: string[];
    image: string;
    constructor([show, type, asset, ...props]: string[]);
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default ShowImage;
//# sourceMappingURL=ShowImage.d.ts.map