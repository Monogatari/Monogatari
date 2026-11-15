import type { Properties } from '@aegis-framework/pandora';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
import { type DesktopBridge } from '../../lib/DesktopBridge';
declare global {
    interface Window {
        electron?: {
            send: (channel: string, data: unknown) => void;
            on: (channel: string, callback: (args: unknown) => void) => void;
        };
        electrobun?: {
            send: (channel: string, data: unknown) => void;
            on: (channel: string, callback: (args: unknown) => void) => void;
        };
    }
}
declare class SettingsScreen extends ScreenComponent<Properties, ScreenState> {
    static tag: string;
    static bind(): Promise<void>;
    desktop(bridge: DesktopBridge): void;
    changeWindowResolution(bridge: DesktopBridge, resolution: string): void;
    didMount(): Promise<void>;
    render(): string;
}
export default SettingsScreen;
//# sourceMappingURL=index.d.ts.map