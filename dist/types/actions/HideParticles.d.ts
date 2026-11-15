import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideParticles extends Action {
    static id: string;
    static matchString([hide, type]: string[]): boolean;
    constructor([hide, type]: string[]);
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideParticles;
//# sourceMappingURL=HideParticles.d.ts.map