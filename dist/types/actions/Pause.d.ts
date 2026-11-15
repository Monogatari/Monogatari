import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, MediaType } from '../lib/types';
export declare class Pause extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    type: MediaType;
    media: string;
    player: any;
    constructor([pause, type, media]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Pause;
//# sourceMappingURL=Pause.d.ts.map