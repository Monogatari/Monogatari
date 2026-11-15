export interface DesktopBridge {
    send(channel: string, data?: unknown): void;
    on(channel: string, callback: (args: unknown) => void): void;
}
export declare function getDesktopBridge(): DesktopBridge | null;
//# sourceMappingURL=DesktopBridge.d.ts.map