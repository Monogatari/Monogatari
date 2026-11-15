import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import type { Character } from '../../lib/types';
/**
 * Dialog entry for the log
 */
export interface DialogEntry {
    id: string;
    character: Character;
    dialog: string;
}
/**
 * State for DialogLog component
 */
export interface DialogLogState extends Properties {
    active: boolean;
}
declare class DialogLog extends Component<Properties, DialogLogState> {
    static tag: string;
    static setup(): Promise<void>;
    static bind(): Promise<void>;
    constructor();
    onReset(): Promise<void>;
    write({ id, character, dialog }: DialogEntry): void;
    pop(): void;
    onStateUpdate(property: string, _oldValue: unknown, newValue: unknown): Promise<void>;
    willMount(): Promise<void>;
    render(): string;
}
export default DialogLog;
//# sourceMappingURL=index.d.ts.map