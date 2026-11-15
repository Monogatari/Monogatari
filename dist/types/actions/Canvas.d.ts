import Action from '../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Canvas extends Action {
    static id: string;
    static _configuration: any;
    static configuration(object?: any): any;
    static shouldProceed(): Promise<void>;
    static onLoad(): Promise<void>;
    static setup(): Promise<void>;
    static bind(): Promise<void>;
    static reset(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    static objects(object?: any): any;
    mode: string;
    name: string;
    classes: string[];
    object: any;
    element: any;
    containerSelector: string;
    /**
     * Creates an instance of a Canvas Action
     *
     * @param {string[]} parameters - List of parameters received from the script statement.
     * @param {string} parameters.action - In this case, action will always be 'canvas'
     * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, immersive)
     * @param {string} parameters.mode
     */
    constructor([show, canvas, name, mode, separator, ...classes]: string[]);
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
export default Canvas;
//# sourceMappingURL=Canvas.d.ts.map