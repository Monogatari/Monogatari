import type { AudioEffectConfig, AudioPlayerOptions } from './types';
/**
 * AudioPlayer provides a high-level API for playing audio with effects
 * using the Web Audio API.
 */
declare class AudioPlayer {
    private audioContext;
    private sourceNode;
    private gainNode;
    private effectChainNodes;
    private _isPlaying;
    private _isPaused;
    private _loop;
    private _volume;
    private startedAt;
    private pausedAt;
    private buffer;
    private effectsConfig;
    private stoppableResources;
    private static effectRegistry;
    private static workletReadyPromises;
    /**
     * Callback fired when playback ends
     */
    onended: (() => void) | null;
    /**
     * Dataset for storing arbitrary data
     */
    dataset: Record<string, string>;
    static effect(id: string, configuration?: Omit<AudioEffectConfig, 'id'> | null): AudioEffectConfig | null;
    static effects(): AudioEffectConfig[];
    static initialize(audioContext: AudioContext): Promise<unknown[]>;
    /**
     * @param audioContext - The Web Audio API AudioContext.
     * @param buffer - The decoded audio data to play.
     * @param options - Configuration options.
     */
    constructor(audioContext: AudioContext, buffer: AudioBuffer, { outputNode, effects, loop, paused, volume }?: AudioPlayerOptions);
    private createSourceNode;
    private createEffectChain;
    private cleanup;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    get volume(): number;
    set volume(value: number);
    get loop(): boolean;
    set loop(value: boolean);
    get isPlaying(): boolean;
    get isPaused(): boolean;
    get paused(): boolean;
    get ended(): boolean;
    get hasEnded(): boolean;
    get duration(): number;
    get currentTime(): number;
    set currentTime(value: number);
    get output(): GainNode;
    private _targetVolume;
    fadeIn(duration: number, targetVolume?: number): Promise<void>;
    fadeOut(duration: number, stopAfterFade?: boolean): Promise<void>;
    destroy(): void;
}
export default AudioPlayer;
//# sourceMappingURL=AudioPlayer.d.ts.map