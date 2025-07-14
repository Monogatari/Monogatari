class AudioPlayer {
	#audioContext;
	#sourceNode = null;
	#gainNode;
	#effectChainNodes = [];

	#isPlaying = false;
	#isPaused = false;
	#loop = false;
	#startedAt = 0;
	#pausedAt = 0;

	#buffer;
	#effectsConfig;
	#stoppableResources = [];
	
	/**
	 * @type { (() => void) | null}
	 */
	onended = null;
	
	dataset = {};

	static #effectRegistry = new Map ();

	static #workletReadyPromises = new WeakMap ();

	static effect (id, configuration = null) {
		if (configuration !== null) {
			this.#effectRegistry.set (id, { id, ...configuration });
		}

		return this.#effectRegistry.get (id) || null;
	}

	static effects () {
		return Array.from (this.#effectRegistry.values ());
	}

	static initialize (audioContext) {
		if (this.#workletReadyPromises.has (audioContext)) {
			return this.#workletReadyPromises.get (audioContext);
		}

		// Check if audioWorklet is supported
		if (!audioContext.audioWorklet) {
			console.warn ('AudioWorklet not supported in this browser. Some effects may not work.');
			const readyPromise = Promise.resolve ();
			this.#workletReadyPromises.set (audioContext, readyPromise);
			return readyPromise;
		}

		const workletDefs = {
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
		
		const workletPromises = Object.entries (workletDefs).map (([name, code]) => {
			const blob = new Blob ([code], { type: 'application/javascript' });
			const url = URL.createObjectURL (blob);
			return audioContext.audioWorklet.addModule (url).catch (e => {
				console.error (`Failed to load worklet: ${name}`, e);
			});
		});

		const readyPromise = Promise.all (workletPromises);

		this.#workletReadyPromises.set (audioContext, readyPromise);

		return readyPromise;
	}

	/**
	 * @param {AudioContext} audioContext - The Web Audio API AudioContext.
	 * @param {AudioBuffer} buffer - The decoded audio data to play.
	 * @param {object} options - Configuration options.
	 * @param {GainNode} [options.outputNode] - An existing gain node to connect to. If not provided, one will be created.
	 * @param {object} [options.effects={}] - A map of effects to apply, e.g., { filter: { type: 'lowpass' } }.
	 * @param {boolean} [options.loop=false] - Whether the audio should loop.
	 * @param {boolean} [options.paused=false] - Whether the audio should start in a paused state.
	 */
	constructor (audioContext, buffer, { outputNode = null, effects = {}, loop = false, paused = false } = {}) {
		this.#audioContext = audioContext;
		this.#buffer = buffer;
		this.#effectsConfig = effects;
		this.#loop = loop;
		this.#isPaused = paused;

		this.#gainNode = outputNode || this.#audioContext.createGain ();
	}

	#createSourceNode () {
		// Disconnect and release any existing resources first.
		this.#cleanup ();

		const source = this.#audioContext.createBufferSource ();
		source.buffer = this.#buffer;
		source.loop = this.#loop;

		source.onended = () => {
			// Ignore if it was stopped manually, which sets onended to null
			if (source.onended === null) {
				return;
			}

			this.#isPlaying = false;

			// Do not mark end as paused
			this.#isPaused = false;
			this.#cleanup ();

			if (typeof this.onended === 'function') {
				this.onended ();
			}
		};

		return source;
	}

	#createEffectChain () {
		let currentNode = this.#sourceNode;
		this.#stoppableResources = [];
		this.#effectChainNodes = [];

		for (const [id, params] of Object.entries (this.#effectsConfig)) {
			const configuration = AudioPlayer.effect (id);

			if (!configuration) {
				console.warn (`Unknown effect type: ${id}`);
				continue;
			}

			try {
				const effect = configuration.create (this.#audioContext, params || {});
				let effectNode;

				// Handle complex effects that return an object with a node and lifecycle methods
				if (effect && typeof effect.node !== 'undefined') {
					effectNode = effect.node;
					if (typeof effect.stop === 'function' || typeof effect.disconnect === 'function') {
						this.#stoppableResources.push (effect);
					}
				} else {
					effectNode = effect;
				}
				
				if (effectNode instanceof AudioNode) {
					currentNode.connect (effectNode);
					currentNode = effectNode;
					this.#effectChainNodes.push (effectNode);
				}
			} catch (error) {
				console.error (`Error creating effect '${id}':`, error);
			}
		}

		// Connect the end of the chain to the main gain node
		currentNode.connect (this.#gainNode);
	}

	#cleanup () {
		// Stop any oscillators or other managed resources from effects
		this.#stoppableResources.forEach (resource => {
			if (resource.stop) {
				resource.stop ();
			}

			if (resource.disconnect) {
				resource.disconnect ();
			}
		});

		this.#stoppableResources = [];

		// Disconnect all effect nodes
		this.#effectChainNodes.forEach (node => node.disconnect ());
		this.#effectChainNodes = [];

		// Disconnect and nullify the source node
		if (this.#sourceNode) {
			// Setting onended to null prevents the callback from firing on a manual stop
			this.#sourceNode.onended = null; 
			
			try {
				this.#sourceNode.stop (0);
			} catch (e) {
				console.error ('Error stopping source node:', e);
			}

			this.#sourceNode.disconnect ();
			this.#sourceNode = null;
		}
	}

	play () {
		if (this.#isPlaying) {
			return Promise.resolve ();
		}

		// Ensure worklets are ready before trying to create nodes that might use them
		const readyPromise = AudioPlayer.#workletReadyPromises.get (this.#audioContext) || Promise.resolve ();
		
		return readyPromise.then ( () => {
			if (this.#audioContext.state === 'suspended') {
				this.#audioContext.resume ();
			}

			this.#sourceNode = this.#createSourceNode ();
			
			const offset = this.#isPaused ? this.#pausedAt : 0;
			this.#startedAt = this.#audioContext.currentTime - offset;
			
			this.#createEffectChain ();
			
			this.#sourceNode.start (0, offset);

			this.#isPlaying = true;
			this.#isPaused = false;
		}).catch (error => {
			console.error ('Error during playback:', error);
			return Promise.reject (error);
		});
	}

	pause () {
		if (!this.#isPlaying) {
			return;
		}
		
		this.#pausedAt = this.#audioContext.currentTime - this.#startedAt;
		this.#isPlaying = false;
		this.#isPaused = true;
		
		// This will call onended, which we suppress, and then we clean up.
		this.#cleanup ();
	}

	stop () {
		if (!this.#sourceNode && !this.#isPlaying) {
			return;
		}
		
		this.#pausedAt = 0;
		this.#startedAt = 0;
		this.#isPlaying = false;
		this.#isPaused = false;
		
		this.#cleanup ();
	}
	
	get volume () {
		return this.#gainNode.gain.value;
	}

	set volume (value) {
		this.#gainNode.gain.setValueAtTime (value, this.#audioContext.currentTime);
	}
	
	get loop () {
		return this.#loop;
	}

	set loop (value) {
		this.#loop = value;
		if (this.#sourceNode) {
			this.#sourceNode.loop = value;
		}
	}

	get isPlaying () {
		return this.#isPlaying;
	}

	get isPaused () {
		return this.#isPaused;
	}
	
	get paused () {
		return this.#isPaused;
	}
	
	get ended () {
		return !this.#isPlaying && !this.#isPaused;
	}
	
	get hasEnded () {
		return !this.#isPlaying && !this.#isPaused;
	}
	
	get duration () {
		return this.#buffer.duration;
	}
	
	get currentTime () {
		if (this.#isPaused) {
			return this.#pausedAt;
		}
		if (this.#isPlaying) {
			return this.#audioContext.currentTime - this.#startedAt;
		}
		return 0;
	}
	
	get output () {
		return this.#gainNode;
	}

	fadeIn (duration) {
		if (!this.#isPlaying) {
			return Promise.resolve ();
		}

		return new Promise ( (resolve) => {
			const startTime = this.#audioContext.currentTime;
			const endTime = startTime + duration;
			
			this.#gainNode.gain.setValueAtTime (this.#gainNode.gain.value, startTime);
			this.#gainNode.gain.linearRampToValueAtTime (this.volume, endTime);
			
			setTimeout (resolve, duration * 1000);
		});
	}

	fadeOut (duration) {
		if (!this.#isPlaying) {
			return Promise.resolve ();
		}

		return new Promise ( (resolve) => {
			const startTime = this.#audioContext.currentTime;
			const endTime = startTime + duration;
			
			this.#gainNode.gain.setValueAtTime (this.#gainNode.gain.value, startTime);
			this.#gainNode.gain.linearRampToValueAtTime (0, endTime);
			
			setTimeout (resolve, duration * 1000);
		});
	}
}

AudioPlayer.effect ('filter', {
	description: 'Applies a Biquad filter (lowpass, highpass, etc.)',
	params: ['type', 'frequency', 'Q', 'gain'],
	create: (audioContext, { type = 'lowpass', frequency = 800, Q = 1, gain = 0 }) => {
		const filter = audioContext.createBiquadFilter ();

		filter.type = type;
		filter.frequency.value = frequency;
		filter.Q.value = Q;
		filter.gain.value = gain;

		return filter;
	},
});

AudioPlayer.effect ('delay', {
	description: 'A simple delay effect',
	params: ['time', 'feedback', 'mix'],
	create: (audioContext, { time = 0.4, feedback = 0.5, mix = 0.5 }) => {
		const delayNode = audioContext.createDelay (5.0); // Max delay time of 5s
		const feedbackGain = audioContext.createGain ();
		const wetGain = audioContext.createGain ();
		const dryGain = audioContext.createGain ();
		const merger = audioContext.createChannelMerger (1);

		delayNode.delayTime.value = time;
		feedbackGain.gain.value = feedback;
		wetGain.gain.value = mix;
		dryGain.gain.value = 1 - mix;

		delayNode.connect (feedbackGain);
		feedbackGain.connect (delayNode);
		
		const inputGain = audioContext.createGain ();

		inputGain.connect (dryGain);
		inputGain.connect (delayNode);
		
		dryGain.connect (merger, 0, 0);
		delayNode.connect (wetGain);
		wetGain.connect (merger, 0, 0);
		
		return { 
			node: inputGain, 
			disconnect: () => wetGain.disconnect (),
		};
	},
});

AudioPlayer.effect ('compressor', {
	description: 'Dynamic range compression',
	params: ['threshold', 'knee', 'ratio', 'attack', 'release'],
	create: (audioContext, { threshold = -24, knee = 30, ratio = 12, attack = 0.003, release = 0.25 }) => {
		const compressor = audioContext.createDynamicsCompressor ();

		compressor.threshold.value = threshold;
		compressor.knee.value = knee;
		compressor.ratio.value = ratio;
		compressor.attack.value = attack;
		compressor.release.value = release;

		return compressor;
	},
});

AudioPlayer.effect ('tremolo', {
	description: 'Modulates the amplitude of the signal',
	params: ['frequency', 'depth'],
	create: (audioContext, { frequency = 5, depth = 0.8 }) => {
		const tremoloGain = audioContext.createGain ();

		tremoloGain.gain.value = 1;

		const lfo = audioContext.createOscillator ();

		lfo.type = 'sine';
		lfo.frequency.value = frequency;

		const lfoGain = audioContext.createGain ();

		lfoGain.gain.value = depth / 2;
		
		const offset = audioContext.createConstantSource ();

		offset.offset.value = 1 - (depth/2);
		offset.start ();

		lfo.connect (lfoGain);
		lfoGain.connect (tremoloGain.gain);
		offset.connect (tremoloGain.gain);
		
		lfo.start ();

		return {
			node: tremoloGain,
			stop: () => { 
				lfo.stop (); 
				offset.stop (); 
			},
			disconnect: () => { 
				lfo.disconnect (); 
				offset.disconnect (); 
			},
		};
	},
});

AudioPlayer.effect ('distortion', {
	description: 'Applies wave-shaping distortion',
	params: ['amount', 'oversample'],
	create: (audioContext, { amount = 50, oversample = '4x' }) => {
		const waveshaper = audioContext.createWaveShaper ();

		const k = typeof amount === 'number' ? amount : 50;
		const n_samples = 44100;
		const curve = new Float32Array (n_samples);
		const deg = Math.PI / 180;

		for (let i = 0; i < n_samples; ++i) {
			const x = i * 2 / n_samples - 1;
			curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs (x));
		}

		waveshaper.curve = curve;
		waveshaper.oversample = oversample;

		return waveshaper;
	},
});

AudioPlayer.effect ('convreverb', {
	description: 'Convolution reverb with a generated impulse response',
	params: ['seconds', 'decay', 'reverse'],
	create: (audioContext, { seconds = 2, decay = 2, reverse = false }) => {
		const convolver = audioContext.createConvolver ();
		const sampleRate = audioContext.sampleRate;
		const length = sampleRate * seconds;
		const impulse = audioContext.createBuffer (2, length, sampleRate);
		
		const impulseL = impulse.getChannelData (0);
		const impulseR = impulse.getChannelData (1);

		for (let i = 0; i < length; i++) {
			const n = reverse ? length - i : i;
			impulseL[i] = (Math.random () * 2 - 1) * Math.pow (1 - n / length, decay);
			impulseR[i] = (Math.random () * 2 - 1) * Math.pow (1 - n / length, decay);
		}
		
		convolver.buffer = impulse;
		return convolver;
	},
});

AudioPlayer.effect ('bitcrusher', {
	description: 'Reduces bit depth and sample rate of the signal',
	params: ['bits', 'frequency'],
	create: (audioContext, { bits = 4, frequency = 0.1 }) => {
		try {
			// Check if AudioWorklet is available
			if (!audioContext.audioWorklet) {
				console.warn ('AudioWorklet not available, using fallback for bitcrusher');

				return audioContext.createGain ();
			}
			
			const bitcrusherNode = new AudioWorkletNode (audioContext, 'bitcrusher-processor');

			bitcrusherNode.parameters.get ('bits').value = bits;
			bitcrusherNode.parameters.get ('frequency').value = frequency;

			return bitcrusherNode;
		} catch (e) {
			console.error ('Failed to create Bitcrusher');
			console.error (e);

			return audioContext.createGain ();
		}
	},
});

AudioPlayer.effect ('autowah', {
	description: 'An envelope-following filter (auto-wah)',
	params: ['baseFrequency', 'octaves', 'sensitivity', 'Q'],
	create: (audioContext, { baseFrequency = 100, octaves = 6, sensitivity = 0.5, Q = 10 }) => {
		 try {
			// Check if AudioWorklet is available
			if (!audioContext.audioWorklet) {
				console.warn ('AudioWorklet not available, using fallback for autowah');
				return audioContext.createGain ();
			}
			
			const filter = audioContext.createBiquadFilter ();

			filter.type = 'bandpass';
			filter.Q.value = Q;

			const follower = new AudioWorkletNode (audioContext, 'envelope-follower-processor');
			
			const scaler = audioContext.createGain ();

			scaler.gain.value = baseFrequency * Math.pow (2, octaves) * sensitivity;
			
			const baseFreqNode = audioContext.createConstantSource ();

			baseFreqNode.offset.value = baseFrequency;
			baseFreqNode.start ();

			const inputGain = audioContext.createGain ();

			inputGain.connect (filter);
			inputGain.connect (follower);

			follower.connect (scaler);
			scaler.connect (filter.frequency);
			baseFreqNode.connect (filter.frequency);

			return {
				node: inputGain,
				stop: () => baseFreqNode.stop (),
				disconnect: () => {
					follower.disconnect ();
					scaler.disconnect ();
					baseFreqNode.disconnect ();
				}
			};
		} catch (e) {
			console.error ('Failed to create AutoWah');
			console.error (e);

			return audioContext.createGain ();
		}
	}
});

AudioPlayer.effect ('panner', {
	description: 'Positions the sound in 3D space',
	params: ['x', 'y', 'z'],
	create: (audioContext, { x = 0, y = 0, z = 0 }) => {
		const panner = audioContext.createPanner ();

		panner.panningModel = 'HRTF';
		panner.positionX.value = x;
		panner.positionY.value = y;
		panner.positionZ.value = z;

		return panner;
	}
});

AudioPlayer.effect ('phaser', {
	description: 'A sweeping phase-shifting effect',
	params: ['frequency', 'depth', 'feedback', 'stages'],
	create: (audioContext, { frequency = 0.5, depth = 1000, feedback = 0.5, stages = 4 }) => {
		const inputGain = audioContext.createGain ();
		const feedbackGain = audioContext.createGain ();

		feedbackGain.gain.value = feedback;

		const filters = [];

		for (let i = 0; i < stages; i++) {
			const filter = audioContext.createBiquadFilter ();

			filter.type = 'allpass';
			filter.frequency.value = 1000;
			filters.push (filter);
		}

		const lfo = audioContext.createOscillator ();

		lfo.type = 'sine';
		lfo.frequency.value = frequency;

		const lfoGain = audioContext.createGain ();

		lfoGain.gain.value = depth;

		lfo.connect (lfoGain);
		filters.forEach (f => lfoGain.connect (f.frequency));

		inputGain.connect (filters[0]);

		for (let i = 0; i < stages - 1; i++) {
			filters[i].connect (filters[i+1]);
		}
		
		const lastFilter = filters[stages - 1];
		lastFilter.connect (feedbackGain);
		feedbackGain.connect (filters[0]);

		const merger = audioContext.createChannelMerger (1);
		inputGain.connect (merger, 0, 0);
		lastFilter.connect (merger, 0, 0);

		lfo.start ();

		return {
			node: inputGain,
			stop: () => lfo.stop (),
			disconnect: () => {
				lfo.disconnect ();
				merger.disconnect ();
			},
		};
	}
});

AudioPlayer.effect ('chorus', {
	description: 'Creates a thicker sound by modulating a delayed signal',
	params: ['frequency', 'delay', 'depth', 'mix'],
	create: (audioContext, { frequency = 1.5, delay = 0.025, depth = 0.002, mix = 0.5 }) => {
		const inputGain = audioContext.createGain ();
		const delayNode = audioContext.createDelay (0.1);
		const wetGain = audioContext.createGain ();
		const dryGain = audioContext.createGain ();

		const lfo = audioContext.createOscillator ();

		lfo.type = 'sine';
		lfo.frequency.value = frequency;

		const lfoGain = audioContext.createGain ();

		lfoGain.gain.value = depth;
		
		delayNode.delayTime.value = delay;
		wetGain.gain.value = mix;
		dryGain.gain.value = 1.0 - mix;

		lfo.connect (lfoGain);
		lfoGain.connect (delayNode.delayTime);

		inputGain.connect (delayNode);
		inputGain.connect (dryGain);
		delayNode.connect (wetGain);
		
		const merger = audioContext.createChannelMerger (1);

		dryGain.connect (merger);
		wetGain.connect (merger);

		lfo.start ();
		
		return {
			node: inputGain,
			stop: () => lfo.stop (),
			disconnect: () => {
				lfo.disconnect ();
				merger.disconnect ();
			}
		};
	},
});

AudioPlayer.effect ('wah', {
	description: 'A sweeping filter effect, like a guitar wah-wah pedal',
	params: ['baseFrequency', 'Q', 'depth', 'frequency'],
	create: (audioContext, { baseFrequency = 350, Q = 15, depth = 1500, frequency = 2 }) => {
		const filter = audioContext.createBiquadFilter ();

		filter.type = 'bandpass';
		filter.Q.value = Q;

		const lfo = audioContext.createOscillator ();

		lfo.type = 'sine';
		lfo.frequency.value = frequency;

		const lfoGain = audioContext.createGain ();

		lfoGain.gain.value = depth;

		const baseFreqNode = audioContext.createConstantSource ();

		baseFreqNode.offset.value = baseFrequency;
		baseFreqNode.start ();

		lfo.connect (lfoGain);
		lfoGain.connect (filter.frequency);
		baseFreqNode.connect (filter.frequency);
		
		lfo.start ();

		return {
			node: filter,
			stop: () => { 
				lfo.stop (); 
				baseFreqNode.stop (); 
			},
			disconnect: () => { 
				lfo.disconnect ();
				baseFreqNode.disconnect (); 
			},
		};
	}
});

AudioPlayer.effect ('ringmod', {
	description: 'Ring modulation for creating metallic, bell-like sounds',
	params: ['frequency', 'mix'],
	create: (audioContext, { frequency = 30, mix = 0.5 }) => {
		const inputGain = audioContext.createGain ();
		const ringMod = audioContext.createGain ();
		const wetGain = audioContext.createGain ();
		const dryGain = audioContext.createGain ();
		
		const modulator = audioContext.createOscillator ();

		modulator.type = 'sine';
		modulator.frequency.value = frequency;

		wetGain.gain.value = mix;
		dryGain.gain.value = 1.0 - mix;
		ringMod.gain.value = 0;

		modulator.connect (ringMod.gain);
		inputGain.connect (ringMod);
		
		const merger = audioContext.createChannelMerger (1);

		inputGain.connect (dryGain);
		ringMod.connect (wetGain);
		dryGain.connect (merger);
		wetGain.connect (merger);

		modulator.start ();

		return {
			node: inputGain,
			stop: () => modulator.stop (),
			disconnect: () => { 
				modulator.disconnect (); 
				merger.disconnect ();
			},
		};
	},
});

AudioPlayer.effect ('saturator', {
	description: 'Soft clipping for warmth and harmonics',
	params: ['drive'],
	create: (audioContext, { drive = 5 }) => {
		const waveshaper = audioContext.createWaveShaper ();
		const curve = new Float32Array (44100);

		for (let i = 0; i < 44100; i++) {
			const x = (i * 2) / 44100 - 1;
			curve[i] = Math.tanh (x * drive);
		}

		waveshaper.curve = curve;

		return waveshaper;
	},
});

AudioPlayer.effect ('limiter', {
	description: 'A hard compressor to prevent signal peaks from exceeding a threshold',
	params: ['threshold', 'release'],
	create: (audioContext, { threshold = -1.0, release = 0.05 }) => {
		const limiter = audioContext.createDynamicsCompressor ();

		limiter.threshold.value = threshold;
		limiter.knee.value = 0;
		limiter.ratio.value = 20;
		limiter.attack.value = 0.001;
		limiter.release.value = release;

		return limiter;
	},
});

AudioPlayer.effect ('fadein', {
	description: 'Fade in effect that gradually increases volume from 0 to target',
	params: ['duration'],
	create: (audioContext, { duration = 1.0 }) => {
		const gainNode = audioContext.createGain ();

		gainNode.gain.setValueAtTime (0, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime (1, audioContext.currentTime + duration);

		return gainNode;
	},
});

AudioPlayer.effect ('fadeout', {
	description: 'Fade out effect that gradually decreases volume to 0',
	params: ['duration'],
	create: (audioContext, { duration = 1.0 }) => {
		const gainNode = audioContext.createGain ();

		gainNode.gain.setValueAtTime (1, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime (0, audioContext.currentTime + duration);

		return gainNode;
	},
});

export default AudioPlayer;