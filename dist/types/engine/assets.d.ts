import type { VisualNovelEngine } from '../lib/types/Monogatari';
import { Space } from '@aegis-framework/artemis';
export declare function assets(engine: VisualNovelEngine, type?: string | null, object?: Record<string, string> | null): Record<string, Record<string, string>> | Record<string, string> | undefined;
export declare function asset(engine: VisualNovelEngine, type: string, name: string, value?: string | null): string | undefined;
export declare function audioBufferCache(engine: VisualNovelEngine, key: string): AudioBuffer | undefined;
export declare function audioBufferCache(engine: VisualNovelEngine, key: string, buffer: AudioBuffer): void;
export declare function audioBufferUncache(engine: VisualNovelEngine, key: string): boolean;
export declare function audioBufferClearCache(engine: VisualNovelEngine, pattern?: string): void;
export declare function imageCache(engine: VisualNovelEngine, key: string): HTMLImageElement | undefined;
export declare function imageCache(engine: VisualNovelEngine, key: string, image: HTMLImageElement): void;
export declare function imageUncache(engine: VisualNovelEngine, key: string): boolean;
export declare function imageClearCache(engine: VisualNovelEngine, pattern?: string): void;
export declare function clearAllCaches(engine: VisualNovelEngine): void;
export declare function cacheInServiceWorker(urls: string[]): Promise<{
    success: boolean;
    cached?: number;
    total?: number;
    error?: string;
}>;
export declare function isInServiceWorkerCache(url: string): Promise<boolean>;
export declare function getFromServiceWorkerCache(url: string): Promise<ArrayBuffer | undefined>;
export declare function serializeAudioBuffer(buffer: AudioBuffer): {
    channels: Float32Array[];
    sampleRate: number;
    length: number;
    numberOfChannels: number;
};
export declare function deserializeAudioBuffer(data: {
    channels: ArrayLike<number>[];
    sampleRate: number;
    length: number;
    numberOfChannels: number;
}, audioContext: AudioContext): AudioBuffer;
export declare function audioBufferSpace(engine: VisualNovelEngine): Promise<Space | null>;
export declare function isIndexedDBAvailable(engine: VisualNovelEngine): boolean | null;
export declare function screenshotSpace(engine: VisualNovelEngine): Promise<Space | null>;
export declare function storeAudioBufferPersistent(engine: VisualNovelEngine, key: string, buffer: AudioBuffer): Promise<void>;
export declare function getAudioBufferPersistent(engine: VisualNovelEngine, key: string): Promise<AudioBuffer | undefined>;
export declare function removeAudioBufferPersistent(engine: VisualNovelEngine, key: string): Promise<void>;
export declare function clearAudioBufferPersistent(engine: VisualNovelEngine): Promise<void>;
//# sourceMappingURL=assets.d.ts.map