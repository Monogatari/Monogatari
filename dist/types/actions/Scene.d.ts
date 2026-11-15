import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Scene extends Action {
    static id: string;
    static loadingOrder: number;
    static setup(): Promise<void>;
    static onLoad(): Promise<void>;
    static reset(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    scene: string;
    scene_elements: string[];
    scene_state: Record<string, any>;
    constructor([show, type, scene, ...classes]: string[]);
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
export default Scene;
//# sourceMappingURL=Scene.d.ts.map