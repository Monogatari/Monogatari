import type { AudioEffectConfig, AudioEffectResult, AudioPlayerOptions } from './types';

/**
 * AudioPlayer provides a high-level API for playing audio with effects
 * using the Web Audio API.
 */
class AudioPlayer {
	private audioContext: AudioContext;
	private sourceNode: AudioBufferSourceNode | null = null;
	private gainNode: GainNode;
	private effectChainNodes: AudioNode[] = [];

	private _isPlaying: boolean = false;
	private _isPaused: boolean = false;
	private _loop: boolean = false;
	private startedAt: number = 0;
	private pausedAt: number = 0;

	private buffer: AudioBuffer;
	private effectsConfig: Record<string, Record<string, unknown>>;
	private stoppableResources: AudioEffectResult[] = [];

	private static effectRegistry: Map<string, AudioEffectConfig> = new Map();
	private static workletReadyPromises: WeakMap<AudioContext, Promise<unknown[]>> = new WeakMap();

	/**
	 * Callback fired when playback ends
	 */
	onended: (() => void) | null = null;

	/**
	 * Dataset for storing arbitrary data
	 */
	dataset: Record<string, string> = {};

	static effect (id: string, configuration: Omit<AudioEffectConfig, 'id'> | null = null): AudioEffectConfig | null {
		if (configuration !== null) {
			this.effectRegistry.set(id, { id, ...configuration });
		}

		return this.effectRegistry.get(id) || null;
	}

	static effects (): AudioEffectConfig[] {
		return Array.from(this.effectRegistry.values());
	}

	static async initialize (audioContext: AudioContext): Promise<unknown[]> {
		if (this.workletReadyPromises.has(audioContext)) {
			return this.workletReadyPromises.get(audioContext)!;
		}

		// Check if audioWorklet is supported
		if (!audioContext.audioWorklet) {
			console.warn('AudioWorklet not supported in this browser. Some effects may not work.');
			const readyPromise = Promise.resolve([]);
			this.workletReadyPromises.set(audioContext, readyPromise);
			return readyPromise;
		}

		const workletDefs: Record<string, string> = {
			'bitcrusher-processor': `
				class BitcrusherProcessor extends AudioWorkletProcessor {
					static get parameterDescriptors () {
						return [
							{ name: 'bits', defaultValue: 8, minValue: 1, maxValue: 16 },
							{ name: 'frequency', defaultValue: 0.1, minValue: 0, maxValue: 1 }
						];
					}

					constructor () {
						super ();
						this.phase = 0;
						this.lastSample = 0;
					}

					process (inputs, outputs, parameters) {
						const input = inputs[0];
						const output = outputs[0];
						const bits = parameters.bits[0];
						const frequency = parameters.frequency[0];
						const step = Math.pow (0.5, bits - 1);
						const sampleRateFactor = 1 / sampleRate;
						const freq = frequency * sampleRate;

						for (let channel = 0; channel < output.length; channel++) {
							const inputChannel = input[channel];
							const outputChannel = output[channel];
							for (let i = 0; i < outputChannel.length; i++) {
								this.phase += freq * sampleRateFactor;
								if (this.phase >= 1.0) {
									this.phase -= 1.0;
									this.lastSample = step * Math.floor (inputChannel[i] / step + 0.5);
								}
								outputChannel[i] = this.lastSample;
							}
						}
						return true;
					}
				}
				registerProcessor ('bitcrusher-processor', BitcrusherProcessor);
			`,
			'envelope-follower-processor': `
				class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
					static get parameterDescriptors () {
						return [
							{ name: 'attack', defaultValue: 0.01, minValue: 0, maxValue: 1 },
							{ name: 'release', defaultValue: 0.1, minValue: 0, maxValue: 1 }
						];
					}

					constructor () {
						super ();
						this._envelope = 0;
					}

					process (inputs, outputs, parameters) {
						const input = inputs[0][0]; // Mono input
						const output = outputs[0][0]; // Control signal output
						const attack = parameters.attack[0];
						const release = parameters.release[0];

						for (let i = 0; i < input.length; i++) {
							const absValue = Math.abs (input[i]);
							if (absValue > this._envelope) {
								this._envelope = attack * (this._envelope - absValue) + absValue;
							} else {
								this._envelope = release * (this._envelope - absValue) + absValue;
							}
							output[i] = this._envelope;
						}
						return true;
					}
				}
				registerProcessor ('envelope-follower-processor', EnvelopeFollowerProcessor);
			`
		};

		const workletPromises = Object.entries(workletDefs).map(async ([name, code]) => {
			const blob = new Blob([code], { type: 'application/javascript' });
			const url = URL.createObjectURL(blob);
			try {
				await audioContext.audioWorklet.addModule(url);
			} catch (e) {
				console.error(`Failed to load worklet: ${name}`, e);
			}
		});

		const readyPromise = Promise.all(workletPromises);

		this.workletReadyPromises.set(audioContext, readyPromise);

		return readyPromise;
	}

	/**
	 * @param audioContext - The Web Audio API AudioContext.
	 * @param buffer - The decoded audio data to play.
	 * @param options - Configuration options.
	 */
	constructor (audioContext: AudioContext, buffer: AudioBuffer, { outputNode = null, effects = {}, loop = false, paused = false }: AudioPlayerOptions = {}) {
		this.audioContext = audioContext;
		this.buffer = buffer;
		this.effectsConfig = effects;
		this._loop = loop;
		this._isPaused = paused;

		this.gainNode = outputNode || this.audioContext.createGain();
	}

	private createSourceNode (): AudioBufferSourceNode {
		// Disconnect and release any existing resources first.
		this.cleanup();

		const source = this.audioContext.createBufferSource();
		source.buffer = this.buffer;
		source.loop = this._loop;

		source.onended = () => {
			// Ignore if it was stopped manually, which sets onended to null
			if (source.onended === null) {
				return;
			}

			this._isPlaying = false;

			// Do not mark end as paused
			this._isPaused = false;
			this.cleanup();

			if (typeof this.onended === 'function') {
				this.onended();
			}
		};

		return source;
	}

	private createEffectChain (): void {
		let currentNode: AudioNode = this.sourceNode!;
		this.stoppableResources = [];
		this.effectChainNodes = [];

		for (const [id, params] of Object.entries(this.effectsConfig)) {
			const configuration = AudioPlayer.effect(id);

			if (!configuration) {
				console.warn(`Unknown effect type: ${id}`);
				continue;
			}

			try {
				const effect = configuration.create(this.audioContext, params || {});
				let effectNode: AudioNode;

				// Handle complex effects that return an object with a node and lifecycle methods
				if (effect && typeof (effect as AudioEffectResult).node !== 'undefined') {
					const complexEffect = effect as AudioEffectResult;
					effectNode = complexEffect.node;
					if (typeof complexEffect.stop === 'function' || typeof complexEffect.disconnect === 'function') {
						this.stoppableResources.push(complexEffect);
					}
				} else {
					effectNode = effect as AudioNode;
				}

				if (effectNode instanceof AudioNode) {
					currentNode.connect(effectNode);
					currentNode = effectNode;
					this.effectChainNodes.push(effectNode);
				}
			} catch (error) {
				console.error(`Error creating effect '${id}':`, error);
			}
		}

		// Connect the end of the chain to the main gain node
		currentNode.connect(this.gainNode);
	}

	private cleanup (): void {
		// Stop any oscillators or other managed resources from effects
		this.stoppableResources.forEach(resource => {
			if (resource.stop) {
				resource.stop();
			}

			if (resource.disconnect) {
				resource.disconnect();
			}
		});

		this.stoppableResources = [];

		// Disconnect all effect nodes
		this.effectChainNodes.forEach(node => node.disconnect());
		this.effectChainNodes = [];

		// Disconnect and nullify the source node
		if (this.sourceNode) {
			// Setting onended to null prevents the callback from firing on a manual stop
			this.sourceNode.onended = null;

			try {
				this.sourceNode.stop(0);
			} catch (e) {
				console.error('Error stopping source node:', e);
			}

			this.sourceNode.disconnect();
			this.sourceNode = null;
		}
	}

	async play (): Promise<void> {
		if (this._isPlaying) {
			return;
		}

		// Ensure worklets are ready before trying to create nodes that might use them
		const readyPromise = AudioPlayer.workletReadyPromises.get(this.audioContext) || Promise.resolve([]);

		try {
			await readyPromise;

			if (this.audioContext.state === 'suspended') {
				await this.audioContext.resume();
			}

			this.sourceNode = this.createSourceNode();

			const offset = this._isPaused ? this.pausedAt : 0;
			this.startedAt = this.audioContext.currentTime - offset;

			this.createEffectChain();

			this.sourceNode.start(0, offset);

			this._isPlaying = true;
			this._isPaused = false;
		} catch (error) {
			console.error('Error during playback:', error);
			throw error;
		}
	}

	pause (): void {
		if (!this._isPlaying) {
			return;
		}

		this.pausedAt = this.audioContext.currentTime - this.startedAt;
		this._isPlaying = false;
		this._isPaused = true;

		// This will call onended, which we suppress, and then we clean up.
		this.cleanup();
	}

	stop (): void {
		if (!this.sourceNode && !this._isPlaying) {
			return;
		}

		this.pausedAt = 0;
		this.startedAt = 0;
		this._isPlaying = false;
		this._isPaused = false;

		this.cleanup();
	}

	get volume (): number {
		return this.gainNode.gain.value;
	}

	set volume (value: number) {
		this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
	}

	get loop (): boolean {
		return this._loop;
	}

	set loop (value: boolean) {
		this._loop = value;
		if (this.sourceNode) {
			this.sourceNode.loop = value;
		}
	}

	get isPlaying (): boolean {
		return this._isPlaying;
	}

	get isPaused (): boolean {
		return this._isPaused;
	}

	get paused (): boolean {
		return this._isPaused;
	}

	get ended (): boolean {
		return !this._isPlaying && !this._isPaused;
	}

	get hasEnded (): boolean {
		return !this._isPlaying && !this._isPaused;
	}

	get duration (): number {
		return this.buffer.duration;
	}

	get currentTime (): number {
		if (this._isPaused) {
			return this.pausedAt;
		}
		if (this._isPlaying) {
			return this.audioContext.currentTime - this.startedAt;
		}
		return 0;
	}

	get output (): GainNode {
		return this.gainNode;
	}

	async fadeIn (duration: number): Promise<void> {
		if (!this._isPlaying) {
			return;
		}

		const startTime = this.audioContext.currentTime;
		const endTime = startTime + duration;

		this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, startTime);
		this.gainNode.gain.linearRampToValueAtTime(this.volume, endTime);

		// Wait for the fade to complete
		await new Promise<void>(resolve => setTimeout(resolve, duration * 1000));
	}

	async fadeOut (duration: number): Promise<void> {
		if (!this._isPlaying) {
			return;
		}

		const startTime = this.audioContext.currentTime;
		const endTime = startTime + duration;

		this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, startTime);
		this.gainNode.gain.linearRampToValueAtTime(0, endTime);

		// Wait for the fade to complete
		await new Promise<void>(resolve => setTimeout(resolve, duration * 1000));
	}
}

// Register built-in effects
AudioPlayer.effect('filter', {
	description: 'Applies a Biquad filter (lowpass, highpass, etc.)',
	params: ['type', 'frequency', 'Q', 'gain'],
	create: (audioContext, { type = 'lowpass', frequency = 800, Q = 1, gain = 0 }) => {
		const filter = audioContext.createBiquadFilter();

		filter.type = type as BiquadFilterType;
		filter.frequency.value = frequency as number;
		filter.Q.value = Q as number;
		filter.gain.value = gain as number;

		return filter;
	},
});

AudioPlayer.effect('delay', {
	description: 'A simple delay effect',
	params: ['time', 'feedback', 'mix'],
	create: (audioContext, { time = 0.4, feedback = 0.5, mix = 0.5 }) => {
		const delayNode = audioContext.createDelay(5.0);
		const feedbackGain = audioContext.createGain();
		const wetGain = audioContext.createGain();
		const dryGain = audioContext.createGain();
		const merger = audioContext.createChannelMerger(1);

		delayNode.delayTime.value = time as number;
		feedbackGain.gain.value = feedback as number;
		wetGain.gain.value = mix as number;
		dryGain.gain.value = 1 - (mix as number);

		delayNode.connect(feedbackGain);
		feedbackGain.connect(delayNode);

		const inputGain = audioContext.createGain();

		inputGain.connect(dryGain);
		inputGain.connect(delayNode);

		dryGain.connect(merger, 0, 0);
		delayNode.connect(wetGain);
		wetGain.connect(merger, 0, 0);

		return {
			node: inputGain,
			disconnect: () => wetGain.disconnect(),
		};
	},
});

AudioPlayer.effect('compressor', {
	description: 'Dynamic range compression',
	params: ['threshold', 'knee', 'ratio', 'attack', 'release'],
	create: (audioContext, { threshold = -24, knee = 30, ratio = 12, attack = 0.003, release = 0.25 }) => {
		const compressor = audioContext.createDynamicsCompressor();

		compressor.threshold.value = threshold as number;
		compressor.knee.value = knee as number;
		compressor.ratio.value = ratio as number;
		compressor.attack.value = attack as number;
		compressor.release.value = release as number;

		return compressor;
	},
});

AudioPlayer.effect('tremolo', {
	description: 'Modulates the amplitude of the signal',
	params: ['frequency', 'depth'],
	create: (audioContext, { frequency = 5, depth = 0.8 }) => {
		const tremoloGain = audioContext.createGain();

		tremoloGain.gain.value = 1;

		const lfo = audioContext.createOscillator();

		lfo.type = 'sine';
		lfo.frequency.value = frequency as number;

		const lfoGain = audioContext.createGain();

		lfoGain.gain.value = (depth as number) / 2;

		const offset = audioContext.createConstantSource();

		offset.offset.value = 1 - ((depth as number) / 2);
		offset.start();

		lfo.connect(lfoGain);
		lfoGain.connect(tremoloGain.gain);
		offset.connect(tremoloGain.gain);

		lfo.start();

		return {
			node: tremoloGain,
			stop: () => {
				lfo.stop();
				offset.stop();
			},
			disconnect: () => {
				lfo.disconnect();
				offset.disconnect();
			},
		};
	},
});

AudioPlayer.effect('distortion', {
	description: 'Applies wave-shaping distortion',
	params: ['amount', 'oversample'],
	create: (audioContext, { amount = 50, oversample = '4x' }) => {
		const waveshaper = audioContext.createWaveShaper();

		const k = typeof amount === 'number' ? amount : 50;
		const n_samples = 44100;
		const curve = new Float32Array(n_samples);
		const deg = Math.PI / 180;

		for (let i = 0; i < n_samples; ++i) {
			const x = i * 2 / n_samples - 1;
			curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
		}

		waveshaper.curve = curve;
		waveshaper.oversample = oversample as OverSampleType;

		return waveshaper;
	},
});

AudioPlayer.effect('convreverb', {
	description: 'Convolution reverb with a generated impulse response',
	params: ['seconds', 'decay', 'reverse'],
	create: (audioContext, { seconds = 2, decay = 2, reverse = false }) => {
		const convolver = audioContext.createConvolver();
		const sampleRate = audioContext.sampleRate;
		const length = sampleRate * (seconds as number);
		const impulse = audioContext.createBuffer(2, length, sampleRate);

		const impulseL = impulse.getChannelData(0);
		const impulseR = impulse.getChannelData(1);

		for (let i = 0; i < length; i++) {
			const n = reverse ? length - i : i;
			impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay as number);
			impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay as number);
		}

		convolver.buffer = impulse;
		return convolver;
	},
});

AudioPlayer.effect('bitcrusher', {
	description: 'Reduces bit depth and sample rate of the signal',
	params: ['bits', 'frequency'],
	create: (audioContext, { bits = 4, frequency = 0.1 }) => {
		try {
			if (!audioContext.audioWorklet) {
				console.warn('AudioWorklet not available, using fallback for bitcrusher');
				return audioContext.createGain();
			}

			const bitcrusherNode = new AudioWorkletNode(audioContext, 'bitcrusher-processor');

			bitcrusherNode.parameters.get('bits')!.value = bits as number;
			bitcrusherNode.parameters.get('frequency')!.value = frequency as number;

			return bitcrusherNode;
		} catch (e) {
			console.error('Failed to create Bitcrusher');
			console.error(e);

			return audioContext.createGain();
		}
	},
});

AudioPlayer.effect('autowah', {
	description: 'An envelope-following filter (auto-wah)',
	params: ['baseFrequency', 'octaves', 'sensitivity', 'Q'],
	create: (audioContext, { baseFrequency = 100, octaves = 6, sensitivity = 0.5, Q = 10 }) => {
		try {
			if (!audioContext.audioWorklet) {
				console.warn('AudioWorklet not available, using fallback for autowah');
				return audioContext.createGain();
			}

			const filter = audioContext.createBiquadFilter();

			filter.type = 'bandpass';
			filter.Q.value = Q as number;

			const follower = new AudioWorkletNode(audioContext, 'envelope-follower-processor');

			const scaler = audioContext.createGain();

			scaler.gain.value = (baseFrequency as number) * Math.pow(2, octaves as number) * (sensitivity as number);

			const baseFreqNode = audioContext.createConstantSource();

			baseFreqNode.offset.value = baseFrequency as number;
			baseFreqNode.start();

			const inputGain = audioContext.createGain();

			inputGain.connect(filter);
			inputGain.connect(follower);

			follower.connect(scaler);
			scaler.connect(filter.frequency);
			baseFreqNode.connect(filter.frequency);

			return {
				node: inputGain,
				stop: () => baseFreqNode.stop(),
				disconnect: () => {
					follower.disconnect();
					scaler.disconnect();
					baseFreqNode.disconnect();
				}
			};
		} catch (e) {
			console.error('Failed to create AutoWah');
			console.error(e);

			return audioContext.createGain();
		}
	}
});

AudioPlayer.effect('panner', {
	description: 'Positions the sound in 3D space',
	params: ['x', 'y', 'z'],
	create: (audioContext, { x = 0, y = 0, z = 0 }) => {
		const panner = audioContext.createPanner();

		panner.panningModel = 'HRTF';
		panner.positionX.value = x as number;
		panner.positionY.value = y as number;
		panner.positionZ.value = z as number;

		return panner;
	}
});

AudioPlayer.effect('phaser', {
	description: 'A sweeping phase-shifting effect',
	params: ['frequency', 'depth', 'feedback', 'stages'],
	create: (audioContext, { frequency = 0.5, depth = 1000, feedback = 0.5, stages = 4 }) => {
		const inputGain = audioContext.createGain();
		const feedbackGain = audioContext.createGain();

		feedbackGain.gain.value = feedback as number;

		const filters: BiquadFilterNode[] = [];

		for (let i = 0; i < (stages as number); i++) {
			const filter = audioContext.createBiquadFilter();

			filter.type = 'allpass';
			filter.frequency.value = 1000;
			filters.push(filter);
		}

		const lfo = audioContext.createOscillator();

		lfo.type = 'sine';
		lfo.frequency.value = frequency as number;

		const lfoGain = audioContext.createGain();

		lfoGain.gain.value = depth as number;

		lfo.connect(lfoGain);
		filters.forEach(f => lfoGain.connect(f.frequency));

		inputGain.connect(filters[0]);

		for (let i = 0; i < (stages as number) - 1; i++) {
			filters[i].connect(filters[i + 1]);
		}

		const lastFilter = filters[(stages as number) - 1];
		lastFilter.connect(feedbackGain);
		feedbackGain.connect(filters[0]);

		const merger = audioContext.createChannelMerger(1);
		inputGain.connect(merger, 0, 0);
		lastFilter.connect(merger, 0, 0);

		lfo.start();

		return {
			node: inputGain,
			stop: () => lfo.stop(),
			disconnect: () => {
				lfo.disconnect();
				merger.disconnect();
			},
		};
	}
});

AudioPlayer.effect('chorus', {
	description: 'Creates a thicker sound by modulating a delayed signal',
	params: ['frequency', 'delay', 'depth', 'mix'],
	create: (audioContext, { frequency = 1.5, delay = 0.025, depth = 0.002, mix = 0.5 }) => {
		const inputGain = audioContext.createGain();
		const delayNode = audioContext.createDelay(0.1);
		const wetGain = audioContext.createGain();
		const dryGain = audioContext.createGain();

		const lfo = audioContext.createOscillator();

		lfo.type = 'sine';
		lfo.frequency.value = frequency as number;

		const lfoGain = audioContext.createGain();

		lfoGain.gain.value = depth as number;

		delayNode.delayTime.value = delay as number;
		wetGain.gain.value = mix as number;
		dryGain.gain.value = 1.0 - (mix as number);

		lfo.connect(lfoGain);
		lfoGain.connect(delayNode.delayTime);

		inputGain.connect(delayNode);
		inputGain.connect(dryGain);
		delayNode.connect(wetGain);

		const merger = audioContext.createChannelMerger(1);

		dryGain.connect(merger);
		wetGain.connect(merger);

		lfo.start();

		return {
			node: inputGain,
			stop: () => lfo.stop(),
			disconnect: () => {
				lfo.disconnect();
				merger.disconnect();
			}
		};
	},
});

AudioPlayer.effect('wah', {
	description: 'A sweeping filter effect, like a guitar wah-wah pedal',
	params: ['baseFrequency', 'Q', 'depth', 'frequency'],
	create: (audioContext, { baseFrequency = 350, Q = 15, depth = 1500, frequency = 2 }) => {
		const filter = audioContext.createBiquadFilter();

		filter.type = 'bandpass';
		filter.Q.value = Q as number;

		const lfo = audioContext.createOscillator();

		lfo.type = 'sine';
		lfo.frequency.value = frequency as number;

		const lfoGain = audioContext.createGain();

		lfoGain.gain.value = depth as number;

		const baseFreqNode = audioContext.createConstantSource();

		baseFreqNode.offset.value = baseFrequency as number;
		baseFreqNode.start();

		lfo.connect(lfoGain);
		lfoGain.connect(filter.frequency);
		baseFreqNode.connect(filter.frequency);

		lfo.start();

		return {
			node: filter,
			stop: () => {
				lfo.stop();
				baseFreqNode.stop();
			},
			disconnect: () => {
				lfo.disconnect();
				baseFreqNode.disconnect();
			},
		};
	}
});

AudioPlayer.effect('ringmod', {
	description: 'Ring modulation for creating metallic, bell-like sounds',
	params: ['frequency', 'mix'],
	create: (audioContext, { frequency = 30, mix = 0.5 }) => {
		const inputGain = audioContext.createGain();
		const ringMod = audioContext.createGain();
		const wetGain = audioContext.createGain();
		const dryGain = audioContext.createGain();

		const modulator = audioContext.createOscillator();

		modulator.type = 'sine';
		modulator.frequency.value = frequency as number;

		wetGain.gain.value = mix as number;
		dryGain.gain.value = 1.0 - (mix as number);
		ringMod.gain.value = 0;

		modulator.connect(ringMod.gain);
		inputGain.connect(ringMod);

		const merger = audioContext.createChannelMerger(1);

		inputGain.connect(dryGain);
		ringMod.connect(wetGain);
		dryGain.connect(merger);
		wetGain.connect(merger);

		modulator.start();

		return {
			node: inputGain,
			stop: () => modulator.stop(),
			disconnect: () => {
				modulator.disconnect();
				merger.disconnect();
			},
		};
	},
});

AudioPlayer.effect('saturator', {
	description: 'Soft clipping for warmth and harmonics',
	params: ['drive'],
	create: (audioContext, { drive = 5 }) => {
		const waveshaper = audioContext.createWaveShaper();
		const curve = new Float32Array(44100);

		for (let i = 0; i < 44100; i++) {
			const x = (i * 2) / 44100 - 1;
			curve[i] = Math.tanh(x * (drive as number));
		}

		waveshaper.curve = curve;

		return waveshaper;
	},
});

AudioPlayer.effect('limiter', {
	description: 'A hard compressor to prevent signal peaks from exceeding a threshold',
	params: ['threshold', 'release'],
	create: (audioContext, { threshold = -1.0, release = 0.05 }) => {
		const limiter = audioContext.createDynamicsCompressor();

		limiter.threshold.value = threshold as number;
		limiter.knee.value = 0;
		limiter.ratio.value = 20;
		limiter.attack.value = 0.001;
		limiter.release.value = release as number;

		return limiter;
	},
});

AudioPlayer.effect('fadein', {
	description: 'Fade in effect that gradually increases volume from 0 to target',
	params: ['duration'],
	create: (audioContext, { duration = 1.0 }) => {
		const gainNode = audioContext.createGain();

		gainNode.gain.setValueAtTime(0, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + (duration as number));

		return gainNode;
	},
});

AudioPlayer.effect('fadeout', {
	description: 'Fade out effect that gradually decreases volume to 0',
	params: ['duration'],
	create: (audioContext, { duration = 1.0 }) => {
		const gainNode = audioContext.createGain();

		gainNode.gain.setValueAtTime(1, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + (duration as number));

		return gainNode;
	},
});

export default AudioPlayer;
