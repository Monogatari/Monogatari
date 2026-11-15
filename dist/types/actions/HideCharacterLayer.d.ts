import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class HideCharacterLayer extends Action {
    static id: string;
    static _experimental: boolean;
    static matchString([hide, type, identifier]: string[]): boolean;
    asset: string;
    layer: string;
    parent: any;
    element: any;
    classes: string[];
    constructor([hide, type, asset, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default HideCharacterLayer;
//# sourceMappingURL=HideCharacterLayer.d.ts.map