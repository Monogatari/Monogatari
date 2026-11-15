import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Video extends Action {
    static id: string;
    static blocking: boolean;
    static _configuration: {
        objects: Record<string, any>;
        modes: string[];
    };
    /**
     * Properly cleanup a video element to prevent memory leaks
     */
    static cleanupVideoElement(element: HTMLVideoElement): void;
    static shouldProceed(): Promise<void>;
    static onLoad(): Promise<void>;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    /**
     * Creates an instance of a Video Action
     *
     * @param {string[]} parameters - List of parameters received from the script statement.
     * @param {string} parameters.action - In this case, action will always be 'video'
     * @param {string} [parameters.mode='modal'] - Mode in which the video element will be shown (modal, displayable, background, immersive, full-screen)
     * @param {string} parameters.name
     * @param {string} parameters.props
     */
    mode: string;
    name: string;
    props: string[];
    src: string | undefined;
    classes: string[];
    constructor([show, type, name, mode, ...props]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Video;
//# sourceMappingURL=Video.d.ts.map