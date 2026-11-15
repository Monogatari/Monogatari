import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class ShowCharacterLayer extends Action {
    static id: string;
    static _experimental: boolean;
    static loadingOrder: number;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static onLoad(): Promise<void>;
    static matchString([show, type, identifier]: string[]): boolean;
    asset: string;
    layer: string;
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
export default ShowCharacterLayer;
//# sourceMappingURL=ShowCharacterLayer.d.ts.map