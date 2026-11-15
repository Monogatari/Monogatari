import type { Properties } from '@aegis-framework/pandora';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
/**
 * Credits content type - can be a string or a record of credit items
 */
export type CreditsContent = string | Record<string, string | string[]>;
/**
 * Credits configuration
 */
export type CreditsConfiguration = Record<string, CreditsContent>;
/**
 * Props for CreditsScreen component
 */
export interface CreditsScreenProps extends Properties {
    credits: CreditsConfiguration;
}
declare class CreditsScreen extends ScreenComponent<CreditsScreenProps, ScreenState> {
    static tag: string;
    static init(): Promise<void>;
    constructor();
    willMount(): Promise<void>;
    render(): string;
}
export default CreditsScreen;
//# sourceMappingURL=index.d.ts.map