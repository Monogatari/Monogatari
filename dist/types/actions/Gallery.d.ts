import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Gallery extends Action {
    static id: string;
    mode: 'unlock' | 'lock';
    asset: string;
    static matchString([action]: string[]): boolean;
    constructor([action, mode, asset]: ['gallery', 'unlock' | 'lock', string]);
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Gallery;
//# sourceMappingURL=Gallery.d.ts.map