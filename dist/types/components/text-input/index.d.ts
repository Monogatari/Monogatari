import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
/**
 * Input option for select, radio, or checkbox types
 */
export interface InputOption {
    value: string | number;
    label: string;
}
/**
 * Input type for text-input component
 */
export type TextInputType = 'text' | 'password' | 'email' | 'url' | 'number' | 'color' | 'file' | 'date' | 'datetime-local' | 'month' | 'time' | 'week' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox';
/**
 * Props for TextInput component
 */
export interface TextInputProps extends Properties {
    text: string;
    type: TextInputType;
    default: string | number | null;
    options: InputOption[];
    warning: string;
    actionString: string;
    onSubmit: (value: string | string[]) => void | Promise<void>;
    validate: (value: string | string[]) => boolean | Promise<boolean>;
    callback: () => void;
    classes: string;
    attributes: Record<string, string | number | boolean>;
}
/**
 * State for TextInput component
 */
export interface TextInputState extends Properties {
    active: boolean;
}
declare class TextInput extends Component<TextInputProps, TextInputState> {
    static tag: string;
    constructor();
    shouldProceed(): Promise<void>;
    willRollback(): Promise<void>;
    onStateUpdate(property: string, _oldValue: unknown, newValue: unknown): Promise<void>;
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    render(): string;
}
export default TextInput;
//# sourceMappingURL=index.d.ts.map