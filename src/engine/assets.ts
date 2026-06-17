import type { VisualNovelEngine } from '../lib/types/Monogatari';
import { Space, SpaceAdapter, Text } from '@aegis-framework/artemis';

// ============================================================================
// Asset Registry
// ============================================================================

export function assets (engine: VisualNovelEngine, type: string | null = null, object: Record<string, string> | null = null): Record<string, Record<string, string>> | Record<string, string> | undefined {
  if (type !== null && object !== null) {
    if (typeof engine._assets[type] !== 'undefined') {
      engine._assets[type] = Object.assign ({}, engine._assets[type], object);
    } else {
      engine._assets[type] = object;
    }
  } else if (type !== null) {
    if (typeof type === 'string') {
      return engine._assets[type];
    } else if (typeof type === 'object') {
      engine._assets = Object.assign ({}, engine._assets, object);
    }
  } else {
    return engine._assets;
  }
}

export function asset (engine: VisualNovelEngine, type: string, name: string, value: string | null = null): string | undefined {
  if (typeof engine._assets[type] === 'undefined') {
    console.error (`Tried to interact with a non-existing asset type ${type}.`);
  }

  if (value !== null) {
    engine._assets[type][name] = value;
  }

  return engine._assets[type][name];
}

// ============================================================================
// Audio Buffer Cache
// ============================================================================

export function audioBufferCache(engine: VisualNovelEngine, key: string): AudioBuffer | undefined;
export function audioBufferCache(engine: VisualNovelEngine, key: string, buffer: AudioBuffer): void;
export function audioBufferCache(engine: VisualNovelEngine, key?: string, buffer?: AudioBuffer): AudioBuffer | undefined | void {
  if (buffer !== undefined && key !== undefined) {
    engine._audioBufferCache.set(key, buffer);
  } else if (key !== undefined) {
    return engine._audioBufferCache.get(key);
  }

  return undefined;
}

export function audioBufferUncache(engine: VisualNovelEngine, key: string): boolean {
  return engine._audioBufferCache.delete(key);
}

export function audioBufferClearCache(engine: VisualNovelEngine, pattern?: string): void {
  if (!pattern) {
    engine._audioBufferCache.clear();
  } else {
    for (const key of engine._audioBufferCache.keys()) {
      if (key.startsWith(pattern)) {
        engine._audioBufferCache.delete(key);
      }
    }
  }
}

// ============================================================================
// Image Cache
// ============================================================================

export function imageCache(engine: VisualNovelEngine, key: string): HTMLImageElement | undefined;
export function imageCache(engine: VisualNovelEngine, key: string, image: HTMLImageElement): void;
export function imageCache(engine: VisualNovelEngine, key?: string, image?: HTMLImageElement): HTMLImageElement | undefined | void {
  if (image !== undefined && key !== undefined) {
    engine._imageCache.set(key, image);
  } else if (key !== undefined) {
    return engine._imageCache.get(key);
  }

  return undefined;
}

export function imageUncache(engine: VisualNovelEngine, key: string): boolean {
  return engine._imageCache.delete(key);
}

export function imageClearCache(engine: VisualNovelEngine, pattern?: string): void {
  if (!pattern) {
    engine._imageCache.clear();
  } else {
    for (const key of engine._imageCache.keys()) {
      if (key.startsWith(pattern)) {
        engine._imageCache.delete(key);
      }
    }
  }
}

// ============================================================================
// Combined Cache
// ============================================================================

export function clearAllCaches(engine: VisualNovelEngine): void {
  engine._audioBufferCache.clear();
  engine._imageCache.clear();
}

// ============================================================================
// Service Worker Communication
// ============================================================================

function sendServiceWorkerMessage<T>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker?.controller) {
      reject(new Error('Service worker not available'));
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data as T);
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Service worker message timeout'));
    }, 10000);
  });
}

export async function cacheInServiceWorker(urls: string[]): Promise<{ success: boolean; cached?: number; total?: number; error?: string }> {
  try {
    return await sendServiceWorkerMessage<{ success: boolean; cached?: number; total?: number; error?: string }>({
      type: 'CACHE_ASSETS',
      data: { urls }
    });
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function isInServiceWorkerCache(url: string): Promise<boolean> {
  try {
    const result = await sendServiceWorkerMessage<{ cached: boolean }>({
      type: 'CHECK_CACHE',
      data: { url }
    });
    return result.cached;
  } catch {
    return false;
  }
}

export async function getFromServiceWorkerCache(url: string): Promise<ArrayBuffer | undefined> {
  try {
    const result = await sendServiceWorkerMessage<{ found: boolean; data?: ArrayBuffer }>({
      type: 'GET_CACHED',
      data: { url }
    });
    return result.found ? result.data : undefined;
  } catch {
    return undefined;
  }
}

// ============================================================================
// Audio Serialization
// ============================================================================

export function serializeAudioBuffer(buffer: AudioBuffer): {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
  numberOfChannels: number;
} {
  const channels: Float32Array[] = [];

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    // Create a copy of the channel data
    channels.push(new Float32Array(buffer.getChannelData(i)));
  }

  return {
    channels,
    sampleRate: buffer.sampleRate,
    length: buffer.length,
    numberOfChannels: buffer.numberOfChannels
  };
}

export function deserializeAudioBuffer(
  data: { channels: ArrayLike<number>[]; sampleRate: number; length: number; numberOfChannels: number },
  audioContext: AudioContext
): AudioBuffer {
  const buffer = audioContext.createBuffer(
    data.numberOfChannels,
    data.length,
    data.sampleRate
  );

  for (let i = 0; i < data.numberOfChannels; i++) {
    // Create a new Float32Array from the stored data to ensure correct type
    const channelData = new Float32Array(data.channels[i]);
    buffer.copyToChannel(channelData, i);
  }

  return buffer;
}

// ============================================================================
// Persistent Audio Storage (IndexedDB)
// ============================================================================

export async function audioBufferSpace(engine: VisualNovelEngine): Promise<Space | null> {
  // If we already know IndexedDB isn't available, skip
  if (engine._indexedDBAvailable === false) {
    return null;
  }

  if (!engine._audioBufferSpace) {
    try {
      engine._audioBufferSpace = new Space(SpaceAdapter.IndexedDB, {
        name: `${Text.friendly(engine.setting('Name') as string)}_AudioCache`,
        version: '1',
        store: 'decodedAudio'
      } as ConstructorParameters<typeof Space>[1]);

      await engine._audioBufferSpace.open();
      engine._indexedDBAvailable = true;
    } catch (error) {
      console.warn('IndexedDB not available for audio caching. Audio will still work but won\'t persist across sessions:', error);
      engine._indexedDBAvailable = false;
      return null;
    }
  }

  return engine._audioBufferSpace;
}

export function isIndexedDBAvailable(engine: VisualNovelEngine): boolean | null {
  return engine._indexedDBAvailable;
}

// ============================================================================
// Save Screenshot Storage (IndexedDB)
// ============================================================================

export async function screenshotSpace(engine: VisualNovelEngine): Promise<Space | null> {
  // If we already know IndexedDB isn't available, skip
  if (engine._indexedDBAvailable === false) {
    return null;
  }

  if (!engine._screenshotSpace) {
    try {
      // We use a dedicated IndexedDB Space for screenshots (blobs), so they don't interfere with the main save data.
      engine._screenshotSpace = new Space(SpaceAdapter.IndexedDB, {
        name: `${Text.friendly(engine.setting('Name') as string)}_Screenshots`,
        version: '1',
        store: 'screenshots'
      } as ConstructorParameters<typeof Space>[1]);

      await engine._screenshotSpace.open();
      engine._indexedDBAvailable = true;
    } catch (error) {
      console.warn('IndexedDB not available for save screenshots. Save thumbnails will fall back to the scene image:', error);
      engine._indexedDBAvailable = false;
      return null;
    }
  }

  return engine._screenshotSpace;
}

export async function storeAudioBufferPersistent(engine: VisualNovelEngine, key: string, buffer: AudioBuffer): Promise<void> {
  const space = await audioBufferSpace(engine);

  if (!space) {
    return; // IndexedDB not available, silently skip
  }

  try {
    const serialized = serializeAudioBuffer(buffer);
    await space.set(key, serialized);
  } catch (error) {
    console.warn('Failed to store audio buffer in IndexedDB:', error);
  }
}

export async function getAudioBufferPersistent(engine: VisualNovelEngine, key: string): Promise<AudioBuffer | undefined> {
  const space = await audioBufferSpace(engine);

  if (!space) {
    return undefined; // IndexedDB not available
  }

  try {
    const data = await space.get(key) as { channels: Float32Array[]; sampleRate: number; length: number; numberOfChannels: number } | undefined;

    if (data && data.channels && engine.audioContext) {
      return deserializeAudioBuffer(data, engine.audioContext);
    }
  } catch (error) {
    console.warn('Failed to retrieve audio buffer from IndexedDB:', error);
  }
  return undefined;
}

export async function removeAudioBufferPersistent(engine: VisualNovelEngine, key: string): Promise<void> {
  const space = await audioBufferSpace(engine);

  if (!space) {
    return; // IndexedDB not available
  }

  try {
    await space.remove(key);
  } catch (error) {
    console.warn('Failed to remove audio buffer from IndexedDB:', error);
  }
}

export async function clearAudioBufferPersistent(engine: VisualNovelEngine): Promise<void> {
  const space = await audioBufferSpace(engine);

  if (!space) {
    return; // IndexedDB not available
  }

  try {
    await space.clear();
  } catch (error) {
    console.warn('Failed to clear audio buffers from IndexedDB:', error);
  }
}
