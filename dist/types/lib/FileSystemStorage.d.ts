import type { DesktopBridge } from './DesktopBridge';
import type { StorageInterface } from './types/Monogatari';
export declare class FileSystemStorage implements StorageInterface {
    private bridge;
    private _config;
    private _callbacks;
    private _transformations;
    private _pendingRequests;
    private _upgradeCallbacks;
    constructor(bridge: DesktopBridge);
    private sendRequest;
    private applyGetTransformations;
    private applySetTransformations;
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<unknown>;
    update(key: string, value: unknown): Promise<unknown>;
    remove(key: string): Promise<void>;
    getAll(): Promise<Record<string, unknown>>;
    each(callback: (key: string, value: unknown) => unknown): Promise<unknown[]>;
    clear(): Promise<void>;
    key(index: number, _full?: boolean): Promise<string>;
    keys(_full?: boolean): Promise<string[]>;
    contains(key: string): Promise<void>;
    open(): Promise<this>;
    configuration(object?: Record<string, unknown> | null): Record<string, unknown> | undefined;
    rename(_name: string): Promise<void>;
    upgrade(oldVersion: string, newVersion: string, callback: (...args: unknown[]) => Promise<void>): Promise<this>;
    onCreate(callback: (key: string, value: unknown) => void): void;
    onUpdate(callback: (key: string, value: unknown) => void): void;
    onDelete(callback: (key: string, value: unknown) => void): void;
    addTransformation(transformation: {
        id: string;
        get?: ((key: string, value: unknown) => unknown) | null;
        set?: ((key: string, value: unknown) => unknown) | null;
    }): void;
    removeTransformation(id: string): void;
}
//# sourceMappingURL=FileSystemStorage.d.ts.map