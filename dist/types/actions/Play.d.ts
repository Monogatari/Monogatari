import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, MediaType } from '../lib/types';
export declare class Play extends Action {
    static id: string;
    static shouldProceed(context?: any): Promise<void>;
    static willProceed(): Promise<void>;
    static willRollback(): Promise<void>;
    static setup(): Promise<void>;
    static init(selector: string): Promise<void>;
    static bind(selector: string): Promise<void>;
    static onLoad(): Promise<void>;
    static reset(): Promise<void>;
    static matchString([action]: string[]): boolean;
    static shutUp(): void;
    type: MediaType;
    directory: string;
    mediaKey: string;
    props: string[];
    mediaVolume: number;
    media: string;
    player: any;
    constructor([action, type, media, ...props]: string[]);
    createAudioPlayer(paused?: boolean, volume?: number): Promise<any>;
    parseEffects(): Record<string, any>;
    willApply(): Promise<void>;
    apply({ paused }?: {
        paused?: boolean | undefined;
    }): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Play;
//# sourceMappingURL=Play.d.ts.map