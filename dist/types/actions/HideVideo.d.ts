import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideVideo extends Action {
    static id: string;
    static matchString([hide, type]: string[]): boolean;
    name: string;
    classes: string[];
    constructor([hide, type, name, separator, ...classes]: string[]);
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideVideo;
//# sourceMappingURL=HideVideo.d.ts.map