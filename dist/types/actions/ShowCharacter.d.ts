import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ShowCharacter extends Action {
    static id: string;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static onLoad(): Promise<void>;
    static matchString([show, type, identifier]: string[]): boolean;
    asset: string;
    state: string | undefined;
    sprite: string;
    character: any;
    image: any;
    classes: string[];
    constructor([show, type, asset, sprite, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default ShowCharacter;
//# sourceMappingURL=ShowCharacter.d.ts.map