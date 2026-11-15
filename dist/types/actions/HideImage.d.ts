import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideImage extends Action {
    static id: string;
    static matchString([hide, type]: string[]): boolean;
    asset: string;
    element: any;
    classes: string[];
    constructor([hide, type, asset, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideImage;
//# sourceMappingURL=HideImage.d.ts.map