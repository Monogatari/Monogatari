import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, MediaType } from '../lib/types';
export declare class Stop extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    type: MediaType;
    media: string;
    props: string[];
    player: any;
    constructor([action, type, media, ...props]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Stop;
//# sourceMappingURL=Stop.d.ts.map