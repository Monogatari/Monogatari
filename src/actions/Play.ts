import { $_, Text } from '@aegis-framework/artemis';
import type { DOM } from '@aegis-framework/artemis';
import Action from './../lib/Action';
import AudioPlayer from './../lib/AudioPlayer';
import { ActionApplyResult, ActionRevertResult, MediaType, MediaStateItem, ActionInstance } from '../lib/types';

export class Play extends Action {

  static override id = 'Play';

  static override async shouldProceed(context?: any): Promise<void> {
    if (typeof context !== 'object' || context === null) {
      return;
    }

    const { userInitiated, skip } = context;

    if (userInitiated === false && skip === false) {
      const voicePlayers = this.engine.mediaPlayers('voice') as (HTMLAudioElement | HTMLVideoElement | AudioPlayer)[];

      for (const player of voicePlayers) {
        if (!player.ended) {
          throw new Error('Voice player still playing.');
        }
      }
    }
  }

  static override async willProceed(): Promise<void> {
    Play.shutUp();
  }

  static override async willRollback(): Promise<void> {
    Play.shutUp();
  }

  static override async setup(): Promise<void> {
    if (!this.engine.audioContext) {
      this.engine.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Initialize AudioPlayer worklets for the audio context
    AudioPlayer.initialize(this.engine.audioContext).catch((error: any) => {
      console.warn('Failed to initialize AudioPlayer worklets:', error);
    });

    this.engine.history('music');
    this.engine.history('sound');
    this.engine.history('voice');
    this.engine.state({
      music: [],
      sound: [],
      voice: []
    });
  }

  static override async init(selector: string): Promise<void> {
    const mediaPlayers = Object.keys(this.engine.mediaPlayers());
    // Set the volume of all the media components on the settings screen
    for (const mediaType of mediaPlayers) {
      const element = this.engine.element().find(`[data-target="${mediaType}"]`).get(0) as HTMLInputElement | undefined;

      if (element) {
        const volumeSettings = this.engine.preference('Volume') as Record<string, number>;
        let volume = volumeSettings[Text.capitalize(mediaType)];

        if (typeof volume === 'string') {
          volume = parseFloat(volume as unknown as string);
        }

        element.value = String(volume);
      }
    }
  }

  static override async bind(selector: string): Promise<void> {
    const engine = this.engine;

    engine.registerListener('set-volume', {
      callback: (event: Event, element: DOM) => {
        const target = element.data('target') as string;
        let value: string | number = element.value() as string;

        if (typeof value === 'string') {
          value = parseFloat(value);
        }

        if (target === 'video') {
          $_('[data-video]').each((el: any) => {
            (el as HTMLMediaElement).volume = value as number;
          });
        } else {
          const players = engine.mediaPlayers(target) as (HTMLAudioElement | AudioPlayer)[];

          // Music volume should also affect the main screen ambient music
          if (target === 'music') {
            const ambientPlayer = engine.ambientPlayer as (HTMLAudioElement & { gainNode?: GainNode }) | null;
            if (ambientPlayer && ambientPlayer.gainNode && engine.audioContext) {
              ambientPlayer.gainNode.gain.setValueAtTime(value as number, engine.audioContext.currentTime);
            } else if (ambientPlayer && ambientPlayer.volume !== undefined) {
              ambientPlayer.volume = value as number;
            }
          }

          for (const player of players) {
            // Handle both HTMLAudioElement and AudioPlayer
            const volumePercentage = player.dataset?.volumePercentage;
            if (volumePercentage && !isNaN(parseInt(volumePercentage))) {
              player.volume = (parseInt(volumePercentage) / 100) * (value as number);
            } else {
              player.volume = value as number;
            }
          }
        }

        const volumeSettings = engine.preference('Volume') as Record<string, number>;
        volumeSettings[Text.capitalize(target)] = value as number;
        engine.preferences(engine.preferences(), true);
      }
    });
  }

  static override async onLoad(): Promise<void> {
    const mediaPlayers = Object.keys(this.engine.mediaPlayers());
    const promises: Promise<unknown>[] = [];
    const pausedMedia: { type: string; media: string }[] = [];

    for (const mediaType of mediaPlayers) {
      const state = this.engine.state(mediaType as keyof import('../lib/types').StateMap) as MediaStateItem[] | undefined;

        if (typeof state !== 'undefined' && Array.isArray(state)) {
        if (state.length > 0) {
          for (const s of state) {
            const action = this.engine.prepareAction(s.statement, { cycle: 'Application' }) as ActionInstance | null;
            if (action !== null) {
              const promise = action.willApply().then(() => {
                return action.apply().then(() => {
                  return action.didApply({ updateHistory: false, updateState: false });
                });
              });

              promises.push(promise);

              // Track media that should be paused after restore
              if (s.paused) {
                const parts = s.statement.split(' ');
                // Statement format: "play <type> <media> [options]"
                if (parts.length >= 3) {
                  pausedMedia.push({ type: parts[1], media: parts[2] });
                }
              }
            }
          }
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    // Restore paused state for media that was paused when saved
    for (const { type, media } of pausedMedia) {
      const player = this.engine.mediaPlayer(type, media);
      player?.pause();
    }
  }

  static override async reset(): Promise<void> {
    const players = this.engine.mediaPlayers();

    // Stop and remove all the media players
    for (const playerType of Object.keys(players)) {
      this.engine.removeMediaPlayer(playerType);
    }

    this.engine.state({
      music: [],
      sound: [],
      voice: []
    });
  }

  static override matchString([action]: string[]): boolean {
    return action === 'play';
  }

  // Stop the voice player
  static shutUp(): void {
    const players = this.engine.mediaPlayers('voice', true);
    for (const media of Object.keys(players)) {
      this.engine.removeMediaPlayer('voice', media);
    }

    this.engine.state({ voice: [] });
  }

  type: MediaType;
  directory: string;
  mediaKey: string;
  props: string[];
  mediaVolume: number;
  media: string;
  player: any;

  constructor([action, type, media, ...props]: string[]) {
    super();
    this.type = type as MediaType;
    this.media = '';

    if (this.type === 'music') {
      this.directory = this.type;
    } else {
      // Directories are always plural so we need to add an "s"
      this.directory = this.type + 's';
    }

    this.mediaKey = media;
    this.props = props;

    const volumeSettings = this.engine.preference('Volume') as Record<string, number>;

    this.mediaVolume = volumeSettings[Text.capitalize(this.type)];

    // Check if a media was defined or just a `play music` was stated
    if (typeof media !== 'undefined' && media !== 'with') {
      if (typeof this.engine.asset(this.directory, media) !== 'undefined') {
        this.media = this.engine.asset(this.directory, media) as string;
      } else {
        this.media = media;
      }

      const player = this.engine.mediaPlayer(this.type, this.mediaKey);

      // We'll create the player in the apply method since it's async
      this.player = typeof player === 'undefined' ? null : player;
    } else {
      this.player = this.engine.mediaPlayers(this.type);
    }
  }

  async createAudioPlayer(paused = false, volume = 1): Promise<any> {
    const audioContext = this.engine.audioContext!;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // Check if audio is already cached
    const cacheKey = `${this.directory}/${this.mediaKey}`;
    let audioBuffer = this.engine.audioBufferCache(cacheKey);

    if (!audioBuffer) {
      // Load and decode audio file
      const assetsPath = this.engine.setting('AssetsPath') as Record<string, string>;
      const response = await fetch(`${assetsPath.root}/${assetsPath[this.directory]}/${this.media}`);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }

    // Parse effects from props
    const effects = this.parseEffects();

    return new AudioPlayer(audioContext, audioBuffer, {
      outputNode: gainNode,
      effects: effects,
      paused: paused,
      volume: volume
    });
  }

  parseEffects(): Record<string, any> {
    const availableEffects = AudioPlayer.effects();

    const effects: Record<string, any> = {};

    for (const config of availableEffects) {
      const index = this.props.indexOf(config.id);

      if (index === -1) {
        continue;
      }

      const params: Record<string, any> = {};

      // Parse parameters based on the effect's parameter list
      for (let i = 0; i < config.params.length; i++) {
        const paramName = config.params[i];
        const paramValue = this.props[index + 1 + i];

        if (paramValue !== undefined) {
          // Try to parse as number first, fallback to string
          const numValue = parseFloat(paramValue);
          params[paramName] = isNaN(numValue) ? paramValue : numValue;
        }
      }

      effects[config.id] = params;
    }

    return effects;
  }

  override async willApply(): Promise<void> {
    if (this.player || this.mediaKey) {
      if (this.player instanceof AudioPlayer) {
        this.player.loop = false;
      }
      return;
    }

    throw new Error('Media player was not defined.');
  }

  override async apply({ paused = false } = {}): Promise<void> {
    // Check if the audio should have a fade time
    const fadePosition = this.props.indexOf('fade');
    const shouldLoop = this.props.indexOf('loop') > -1;
    const volumePercentage = this.props.indexOf('volume') > -1 ? parseInt(this.props[this.props.indexOf('volume') + 1]) / 100 : 1;
    const volume = this.mediaVolume * volumePercentage;

    // Create player if it doesn't exist yet
    if (this.player === null) {
      this.player = await this.createAudioPlayer(paused, volume);
      this.engine.mediaPlayer(this.type, this.mediaKey, this.player);
    }

    if (this.player instanceof AudioPlayer) {
      // Make the audio loop if it was provided as a prop
      if (shouldLoop) {
        this.player.loop = true;
      }

      // Set volume through the AudioPlayer setter
      this.player.volume = volume;
      this.player.dataset.volumePercentage = (volumePercentage * 100).toString();

      this.player.onended = () => {
        const endState: Record<string, any> = {};
        endState[this.type] = this.engine.state(this.type).filter((s: any) => s.statement !== this._statement);
        this.engine.state(endState);
        this.engine.removeMediaPlayer(this.type, this.mediaKey);
      };

      if (paused === true) {
        return Promise.resolve();
      }

      // Start playback first, then apply fade if requested
      await this.player.play();

      if (fadePosition > -1) {
        const fadeTime = this.props[fadePosition + 1];
        const match = fadeTime.match(/\d*(\.\d*)?/);
        const duration = match ? parseFloat(match[0]) : 0;
        // Don't await fadeIn - let it run in background while playback continues
        this.player.fadeIn(duration, this.player.volume);
      }

      return;

    }
    else if (this.player instanceof Array) {
      const promises = [];
      for (const player of this.player) {
        if (player.paused && !player.ended) {
          if (fadePosition > -1) {
            const fadeTime = this.props[fadePosition + 1];
            const match = fadeTime.match(/\d*(\.\d*)?/);
            const duration = match ? parseFloat(match[0]) : 0;
            player.fadeIn(duration);
          }
          promises.push(player.play());
        }
      }
      await Promise.all(promises);
    } else {
      throw new Error('An error occurred, you probably have a typo on the media you want to play.');
    }
  }

  override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
    if (updateHistory === true) {
      if (this.player instanceof AudioPlayer || this.mediaKey) {
        this.engine.history(this.type).push(this._statement as string);
      }
    }

    if (updateState === true) {
      const currentState = this.engine.state(this.type);
      if (this.player instanceof AudioPlayer || this.mediaKey) {
        const newItem: MediaStateItem = { statement: this._statement as string, paused: false };
        this.engine.state({ [this.type]: [...currentState, newItem] });
      } else if (this.player instanceof Array) {
        const updatedState = currentState.map((item: MediaStateItem) => ({
          ...item,
          paused: false
        }));
        this.engine.state({ [this.type]: updatedState });
      }
    }

    return { advance: true };
  }

  override async revert(): Promise<void> {
    if (typeof this.mediaKey !== 'undefined') {
      this.engine.removeMediaPlayer(this.type, this.mediaKey);
    } else if (this.player instanceof Array) {
      for (const player of this.player) {
        if (!player.paused && !player.ended) {
          player.pause();
        }
      }
    }
  }

  override async didRevert(): Promise<ActionRevertResult> {
    const currentState = this.engine.state(this.type);

    if (typeof this.mediaKey !== 'undefined') {
      const history = this.engine.history(this.type) as string[];
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i] === this._statement) {
          history.splice(i, 1);
          break;
        }
      }
      const filteredState = currentState.filter((m: MediaStateItem) => m.statement !== this._statement);
      this.engine.state({ [this.type]: filteredState });
    } else if (this.player instanceof Array) {
      const updatedState = currentState.map((item: MediaStateItem) => ({
        ...item,
        paused: true
      }));
      this.engine.state({ [this.type]: updatedState });
    }
    return { advance: true, step: true };
  }
}

export default Play;
