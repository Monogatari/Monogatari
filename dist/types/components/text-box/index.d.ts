import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
interface TextBoxProps extends Properties {
    mode: 'adv' | 'nvl';
}
interface TextBoxState extends Properties {
    hidden: boolean;
}
declare class TextBox extends Component<TextBoxProps, TextBoxState> {
    constructor();
    onStateUpdate(property: string, _oldValue: unknown, newValue: unknown): Promise<void>;
    show(): void;
    /**
     * checkUnread - This function is used to add the unread class to the
     * text box if new contents (dialogs) were added to it causing it to overflow
     * but are not visible on screen right now so the player knows there is more
     * and scrolls the element.
     */
    checkUnread(): void;
    render(): Promise<string>;
}
export default TextBox;
//# sourceMappingURL=index.d.ts.map