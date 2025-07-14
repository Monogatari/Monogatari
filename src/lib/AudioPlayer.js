class AudioPlayer {
	constructor (audioContext, buffer, gainNode) {
		this.audioContext = audioContext;
		this.buffer = buffer;
		this.gainNode = gainNode;

		this.startedAt = 0;
		this.pausedAt = 0;

		this.isPlaying = false;
		this.isPaused = false;
		this.hasEnded = false;

		this.loop = false;

		this.onended = null;

		// TODO: We are using this just for historical purposes, we need to remove it
		this.dataset = {};

		this.source = null;
	}

	_createSource (startAt = 0) {
		const source = this.audioContext.createBufferSource();

		source.buffer = this.buffer;
		source.connect(this.gainNode);
		source.loop = this.loop;

		source.onended = () => {
			this.isPlaying = false;
			this.hasEnded = true;
			if (typeof this.onended === 'function') {
				this.onended();
			}
		};

		return source;
	}

	play () {
		if (this.hasEnded) {
			// Reset state to restart the audio
			this.hasEnded = false;
			this.isPaused = false;
			this.pausedAt = 0;
		}

		if (this.isPlaying) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			try {
				let startAt = 0;

				if (this.isPaused) {
					startAt = this.pausedAt;
				}

				// Always create a new source node
				this.source = this._createSource(startAt);
				this.startedAt = this.audioContext.currentTime - startAt;

				this.isPlaying = true;
				this.isPaused = false;
				this.hasEnded = false;

				this.source.start(0, startAt);

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	pause() {
		if (!this.isPlaying || this.hasEnded) {
			return;
		}

		if (this.source) {
			this.source.onended = null;
			this.source.stop();
			this.source = null;
		}

		this.pausedAt = this.audioContext.currentTime - this.startedAt;
		this.isPlaying = false;
		this.isPaused = true;
	}

	stop() {
		if (this.isPlaying && this.source) {
			this.source.onended = null;
			this.source.stop ();
			this.source = null;
		}

		this.isPlaying = false;
		this.isPaused = false;
		this.hasEnded = true;
		this.pausedAt = 0;
	}

	get volume () {
		return this.gainNode.gain.value;
	}

	set volume (value) {
		this.gainNode.gain.setValueAtTime (value, this.audioContext.currentTime);
	}

	get paused () {
		return this.isPaused;
	}

	get ended () {
		return this.hasEnded;
	}
}

export default AudioPlayer;