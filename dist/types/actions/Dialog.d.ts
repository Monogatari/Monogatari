import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Dialog extends Action {
    static id: string;
    static shouldProceed(): Promise<void>;
    static willProceed(): Promise<void>;
    static willRollback(): Promise<void>;
    static setup(): Promise<void>;
    static bind(selector: string): Promise<void>;
    static init(selector: string): Promise<void>;
    static reset({ keepNVL, saveNVL }?: {
        keepNVL?: boolean;
        saveNVL?: boolean;
    }): Promise<void>;
    static matchString(): boolean;
    dialog: string;
    clearDialog: string;
    nvl: boolean;
    classes: string[];
    character: any;
    image: string | undefined;
    expression: string | undefined;
    id: string;
    constructor(args: string[]);
    willApply(): Promise<void>;
    _handleCustomClasses(element: HTMLElement | undefined): void;
    _setCharacter(id: string, expression: string | undefined): void;
    displayCenteredDialog(dialog: string, clearDialog: string, character: string, animation: boolean): Promise<void>;
    displayNvlDialog(dialog: string, clearDialog: string, character: string, animation: boolean): void;
    displayDialog(dialog: string, clearDialog: string, character: string, animation: boolean): Promise<void>;
    characterDialog(): Promise<void>;
    apply({ updateLog }?: {
        updateLog?: boolean | undefined;
    }): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    willRevert(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Dialog;
//# sourceMappingURL=Dialog.d.ts.map