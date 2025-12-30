import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import type TypeCharacter from '../type-character/index';
import {
	getLeafNodes,
	humanizeSpeed,
	WHITESPACE_PATTERN,
	type TypingCallbacks,
} from '../../lib/typing-utils';

export type ActionType = 'number' | 'enclosed' | 'instance';

export interface TypeWriterAction {
	name: string;
	type: ActionType;
	action: (this: TypeWriter, ...args: unknown[]) => void;
}

export interface TypeWriterActions {
	[key: string]: TypeWriterAction;
}

export interface TypeWriterConfiguration {
	actions: TypeWriterActions;
	[key: string]: unknown;
}

export interface TypedConfig extends TypingCallbacks<TypeWriter> {
	typeSpeed?: number;
	loop?: boolean | number;
	showCursor?: boolean;
	hideCursorOnEnd?: boolean;
	preStringTyped: (index: number, self: TypeWriter) => void;
	onStringTyped: (index: number, self: TypeWriter) => void;
	onStringLoop?: (index: number, self: TypeWriter) => void;
}

export interface ParsedAction {
	action: string;
	n?: string;
	options?: Record<string, string> | string[];
	text?: string;
	id?: string;
}

export interface VoidElementResult {
	props: Record<string, boolean>;
	state: Record<string, unknown>;
	node: TypeCharacter;
}

export interface TypeWriterProps extends Properties {
	string: string | false;
	typeSpeed?: number;
	loop?: boolean | number;
	showCursor?: boolean;
	hideCursorOnEnd?: boolean;
	delay?: number;
	start?: boolean;
}

export interface TypeWriterState extends Properties {
	config: Partial<TypedConfig>;
	strings: string[];
	cursor: Record<string, string>;
	ignore?: boolean;
	special?: Record<string, boolean>;
}

// ============================================================================
// Pre-compiled regex patterns for better performance
// ============================================================================

export const QUOTED_VALUE_PATTERN = /=(["'])(.*?)\1/g;
export const CSS_VALUE_PATTERN = /(:[ ]?)(.*?);/g;
export const QUOTE_CONTENT_PATTERN = /(["'])(.*?)\1/g;

// ============================================================================
// TypeWriter Component
// ============================================================================

class TypeWriter extends Component<TypeWriterProps, TypeWriterState> {
  static override tag = 'type-writer';

  static _patternCacheVersion: number = 0;
  static _numberActionsCache: string | null = null;
  static _enclosedActionsCache: string | null = null;
  static _instanceActionsCache: string | null = null;

	static override _configuration: TypeWriterConfiguration = {
		actions: {
			'pause': {
				name: 'pause',
				type: 'number',
				action: function (this: TypeWriter, number: unknown): void {
					const time = Number(number);

					if (time) {
						this.nextPause = time;

						if (typeof this.state.config.onTypingPaused === 'function') {
							this.state.config.onTypingPaused(this.stringPos, this);
						}
					} else {
						this.engine.debug.error('Provided value was not a valid number value:\n' + number);
					}
				},
			},
			'speed': {
				name: 'speed',
				type: 'number',
				action: function (this: TypeWriter, number: unknown): void {
					const percentage = Number(number);

					if (percentage) {
						const speed = Math.floor((this.speed * 100) / percentage);
						this.speed = speed;
					} else {
						this.engine.debug.error('Provided value was not a valid number value:\n' + number);
					}
				},
			},
			'shake': {
				name: 'shake',
				type: 'enclosed',
				action: () => {},
			},
			'shake-hard': {
				name: 'shake-hard',
				type: 'enclosed',
				action: () => {},
			},
			'shake-slow': {
				name: 'shake-slow',
				type: 'enclosed',
				action: () => {},
			},
			'shake-little': {
				name: 'shake-little',
				type: 'enclosed',
				action: () => {},
			},
			'shake-horizontal': {
				name: 'shake-horizontal',
				type: 'enclosed',
				action: () => {},
			},
			'shake-vertical': {
				name: 'shake-vertical',
				type: 'enclosed',
				action: () => {},
			},
			'wave': {
				name: 'wave',
				type: 'enclosed',
				action: () => {},
			},
			'wave-slow': {
				name: 'wave-slow',
				type: 'enclosed',
				action: () => {},
			},
			'wave-fast': {
				name: 'wave-fast',
				type: 'enclosed',
				action: () => {},
			},
			'fade': {
				name: 'fade',
				type: 'enclosed',
				action: () => {},
			},
			'fade-slow': {
				name: 'fade-slow',
				type: 'enclosed',
				action: () => {},
			},
			'blur': {
				name: 'blur',
				type: 'enclosed',
				action: () => {},
			},
			'scale': {
				name: 'scale',
				type: 'enclosed',
				action: () => {},
			},
			'scale-bounce': {
				name: 'scale-bounce',
				type: 'enclosed',
				action: () => {},
			},
			'slide-up': {
				name: 'slide-up',
				type: 'enclosed',
				action: () => {},
			},
			'slide-down': {
				name: 'slide-down',
				type: 'enclosed',
				action: () => {},
			},
			'glitch': {
				name: 'glitch',
				type: 'enclosed',
				action: () => {},
			},
			'glitch-hard': {
				name: 'glitch-hard',
				type: 'enclosed',
				action: () => {},
			},
			'glitch-slow': {
				name: 'glitch-slow',
				type: 'enclosed',
				action: () => {},
			},
			'bold': {
				name: 'bold',
				type: 'enclosed',
				action: () => {},
			},
			'italic': {
				name: 'italic',
				type: 'enclosed',
				action: () => {},
			},
			'big': {
				name: 'big',
				type: 'enclosed',
				action: () => {},
			},
			'small': {
				name: 'small',
				type: 'enclosed',
				action: () => {},
			},
			'impact': {
				name: 'impact',
				type: 'enclosed',
				action: () => {},
			},
			'redacted': {
				name: 'redacted',
				type: 'enclosed',
				action: () => {},
			},
			'invisible-ink': {
				name: 'invisible-ink',
				type: 'enclosed',
				action: () => {},
			},
			'handwriting': {
				name: 'handwriting',
				type: 'enclosed',
				action: () => {},
			},
			'strike': {
				name: 'strike',
				type: 'enclosed',
				action: () => {},
			},
			'flicker': {
				name: 'flicker',
				type: 'enclosed',
				action: () => {},
			},

			'angry': {
				name: 'angry',
				type: 'enclosed',
				action: () => {},
			},
			'scared': {
				name: 'scared',
				type: 'enclosed',
				action: () => {},
			},
			'happy': {
				name: 'happy',
				type: 'enclosed',
				action: () => {},
			},
			'sad': {
				name: 'sad',
				type: 'enclosed',
				action: () => {},
			},
			'mysterious': {
				name: 'mysterious',
				type: 'enclosed',
				action: () => {},
			},
			'excited': {
				name: 'excited',
				type: 'enclosed',
				action: () => {},
			},
			'whisper': {
				name: 'whisper',
				type: 'enclosed',
				action: () => {},
			},
			'shout': {
				name: 'shout',
				type: 'enclosed',
				action: () => {},
			},
			'dizzy': {
				name: 'dizzy',
				type: 'enclosed',
				action: () => {},
			},
			'dreamy': {
				name: 'dreamy',
				type: 'enclosed',
				action: () => {},
			},
			'robotic': {
				name: 'robotic',
				type: 'enclosed',
				action: () => {},
			},
			'static': {
				name: 'static',
				type: 'enclosed',
				action: () => {},
			},
			'rainbow': {
				name: 'rainbow',
				type: 'enclosed',
				action: () => {},
			},
			'glow': {
				name: 'glow',
				type: 'enclosed',
				action: () => {},
			},
		},
	};

	// Instance properties
	typeSpeed: number = 100;
	speed: number = 100;
	nextPause: number | null = null;
	stringPos: number = 0;
	loops: boolean | number = false;
	stopLoop: boolean = false;
	nodeCounter: number = 0;
	enclosedID: string[] = [];
	parseIndex: number = 0;
	actionsPlayed: number = 0;
	actions: (ParsedAction | undefined)[] = [];
	elements: NodeListOf<TypeCharacter> | null = null;
	ignorePause?: boolean;

	// Animation frame timing
	private _animationFrameId: number | null = null;
	private _lastFrameTime: number = 0;
	private _accumulatedTime: number = 0;
	private _targetWaitTime: number = 0;
	private _isAnimating: boolean = false;

	// Pre-compiled action patterns
	private _actionPatternCache: RegExp | null = null;
	private _numberActionsCache: string | null = null;
	private _enclosedActionsCache: string | null = null;
	private _instanceActionsCache: string | null = null;
	private _patternCacheVersion: number = 0;

	constructor() {
		super();

		this.state = {
			config: {},
			strings: [],
			cursor: {}
		};

		this.props = {
			string: false
		};
	}

	static override configuration(object: string | TypeWriterConfiguration | null = null): TypeWriterConfiguration | unknown {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object as keyof TypeWriterConfiguration];
			}

			this._configuration = Object.assign({}, this._configuration, object);
		}

		return this._configuration;
	}

	static actions(): TypeWriterActions {
		return this._configuration.actions;
	}

	/**
	 * Strip all TypeWriter action markers from a string.
	 * This dynamically handles all registered actions (number, enclosed, instance types).
	 *
	 * @param str - The string to strip markers from
	 * @returns The string with all action markers removed
	 */
	static stripActionMarkers(str: string): string {
		const actions = this.actions();
		let result = str;

		for (const actionName in actions) {
			const action = actions[actionName];

			if (action.type === 'number') {
				// Matches {action:N} or {action N}
				result = result.replace(new RegExp(`\\{${actionName}[:\\s]\\d+\\}`, 'g'), '');
			} else if (action.type === 'enclosed') {
				// Matches {action} or {action options} or {/action} or {/action options}
				result = result.replace(new RegExp(`\\{/?${actionName}(?:\\s[^}]*)?\\}`, 'g'), '');
			} else if (action.type === 'instance') {
				// Matches {action/}
				result = result.replace(new RegExp(`\\{${actionName}\\/\\}`, 'g'), '');
			}
		}

		return result;
	}

	/**
	 * Get a specific action or add a new one to the actions config.
	 * Note: Adding a new action invalidates the pattern cache for all instances.
	 */
	static action(action: string | TypeWriterAction | null = null): TypeWriterAction | TypeWriterActions {
		if (typeof action === 'string') {
			return this._configuration.actions[action];
		}

		if (typeof action === 'object' && action !== null) {
			const requiredFields: (keyof TypeWriterAction)[] = ['name', 'type', 'action'];

			if (requiredFields.every(field => Object.keys(action).includes(field))) {
				this._configuration.actions[action.name] = action;
				// Invalidate pattern cache for all instances when a new action is added
				this._invalidateAllPatternCaches();
				return action;
			}

			throw new Error('Attempted to add an action to typing actions, but an invalid action object was provided:\n' + action);
		}

		return this._configuration.actions;
	}

	/**
	 * Invalidate the pattern cache for all TypeWriter instances.
	 * Called when new actions are registered.
	 */
	private static _invalidateAllPatternCaches(): void {
		this._patternCacheVersion = (this._patternCacheVersion || 0) + 1;
	}

	/**
	 * Get the current pattern cache version.
	 */
	static get patternCacheVersion(): number {
		return this._patternCacheVersion || 0;
	}

	/**
	 * Get all strings.
	 */
	get strings(): string[] {
		return this.state.strings;
	}

	/**
	 * Build and cache the action pattern regex for better performance.
	 */
	private _buildActionPatterns(): void {
		const acts: Record<string, string[]> = Object.entries((this.constructor as typeof TypeWriter).actions())
			.map(([action, value]) => ({ [value.type]: [action] }))
			.reduce((a, b) => {
				for (const key in b) {
					if (a[key]) {
						a[key] = a[key].concat(b[key]);
					} else {
						a[key] = b[key];
					}
				}
				return a;
			}, {} as Record<string, string[]>);

		// Sort actions by length (longest first) to ensure proper regex matching.
		// E.g., "shake-hard" must come before "shake" to avoid partial matches.
		const sortByLength = (arr: string[]) => arr.sort((a, b) => b.length - a.length);

		this._numberActionsCache = acts.number ? sortByLength(acts.number).join('|') : '';
		this._enclosedActionsCache = acts.enclosed ? sortByLength(acts.enclosed).join('|') : '';
		this._instanceActionsCache = acts.instance ? sortByLength(acts.instance).join('|') : '';

		const patterns: string[] = [];

		if (this._numberActionsCache) {
			patterns.push(`\\{(?:${this._numberActionsCache})[:\\s]\\d+\\}`);
		}
		if (this._enclosedActionsCache) {
			patterns.push(`\\{/?(?:${this._enclosedActionsCache}).*?\\}`);
		}
		if (this._instanceActionsCache) {
			patterns.push(`\\{(?:${this._instanceActionsCache})\\/\\}`);
		}

		this._actionPatternCache = patterns.length > 0
			? new RegExp(`(${patterns.join('|')})`, 'g')
			: null;
	}

	/**
	 * Start the typing animation with a fresh configuration.
	 */
	initiate(): void {
		// Build default config with internal lifecycle callbacks
		const defaultConfig: Partial<TypedConfig> = {
			typeSpeed: this.engine.preference('TextSpeed') as number,
			loop: false,
			showCursor: false,
			hideCursorOnEnd: false,
			preStringTyped: (_index: number, _self: TypeWriter) => {
				this.engine.global('finished_typing', false);
				this.engine.trigger('didStartTyping');
			},
			onStringTyped: (_index: number, _self: TypeWriter) => {
				this.engine.global('finished_typing', true);
				this.engine.trigger('didFinishTyping');
			},
			onDestroy: (_self: TypeWriter) => {
				this.engine.global('finished_typing', true);
			},
		};

		// Merge with any existing config (for backwards compatibility)
		this.setState({ config: { ...defaultConfig, ...this.state.config } });

		if (!this.state.strings.length && this.props.string) {
			this.setState({ ignore: true, strings: [this.props.string] });
		}

		const { config, strings } = this.state;

		// Handle empty strings array
		if (!strings || strings.length === 0) {
			this.engine.debug.warn('TypeWriter: No strings to type');
			config.onStringTyped?.(0, this);
			return;
		}

		const currentString = strings[0] ?? '';
		this.setProps({ string: currentString });

		// Handle empty string
		if (!currentString) {
			this.engine.debug.warn('TypeWriter: Empty string provided');
			config.onStringTyped?.(0, this);
			return;
		}

		// Apply cursor styles if configured
		if (Object.values(this.state.cursor).length) {
			for (const key in this.state.cursor) {
				this.style.setProperty(`--cursor-${key}`, this.state.cursor[key]);
			}
		}

		// Props type speed should always supersede config type speed
		if (this.props.typeSpeed) {
			this.typeSpeed = this.props.typeSpeed;
		} else {
			this.typeSpeed = config.typeSpeed ?? this.typeSpeed;
		}

		if (!this.loops && !this.stopLoop) {
			this.loops = this.props.loop || config.loop || false;
		}

		// Reset state for new animation
		this.speed = this.typeSpeed;
		this.nextPause = null;
		this._isAnimating = false;
		this._animationFrameId = null;
		this.stringPos = 0;
		this.nodeCounter = 0;
		this.enclosedID = [];
		this.parseIndex = 0;
		this.actionsPlayed = 0;

		// Build action patterns if not cached or if static cache version changed
		const staticVersion = (this.constructor as typeof TypeWriter).patternCacheVersion;
		if (!this._actionPatternCache || this._patternCacheVersion !== staticVersion) {
			this._patternCacheVersion = staticVersion;
			this._buildActionPatterns();
		}

		this.setDisplay(currentString);
		this.elements = this.querySelectorAll('type-character') as NodeListOf<TypeCharacter>;

		// Callbacks
		if (typeof config.onBegin === 'function') {
			config.onBegin(this);
		}

		config.preStringTyped?.(this.stringPos, this);

		if (typeof this.props.delay === 'number') {
			setTimeout(() => {
				this.typewrite();
			}, this.props.delay);
		} else {
			this.typewrite();
		}
	}

	/**
	 * Check for non-enclosing html tags and return properties for them.
	 */
	checkVoidTags(element: Node): VoidElementResult | false {
		if (!(element instanceof Element)) {
			return false;
		}

		const replace = (text: string, index: number = 1): string => text
			.slice(text.indexOf('-') + index)
			.replace(/[-](\w)/g, m => m[1].toUpperCase());

		const voidElements = ['br', 'hr', 'img'];
		const voidAttributeNames = element.localName && element.getAttributeNames();

		const voidAttributes = voidAttributeNames && voidAttributeNames.map(elm => ({
			[elm]: elm.slice(0, 5) === 'data-'
				? (element as HTMLElement).dataset[replace(elm)]
				: elm.slice(0, 5) === 'aria-'
					? (element as HTMLElement).getAttribute(elm)
					: elm === 'class'
						? element.className
						: (element as HTMLElement)[elm as keyof HTMLElement]
		})).reduce((a, v) => Object.assign(a, v), {} as Record<string, unknown>);

		const voidProperties: Record<string, { props: Record<string, boolean>; state: Record<string, unknown> }> = voidElements.map(e => ({
			[e]: {
				props: { [e]: true },
				state: { ...(voidAttributes) }
			}
		})).reduce((a, v) => Object.assign(a, v), {});

		if (element.localName && voidProperties[element.localName.toLowerCase()]) {
			const { props, state } = voidProperties[element.localName.toLowerCase()];
			const node = document.createElement('type-character') as TypeCharacter;
			node.style.opacity = '0';

			return { props, state, node };
		}

		return false;
	}

	/**
	 * Setup the current string with the proper elements to run the typing animation.
	 * Uses DocumentFragment for batched DOM operations.
	 */
	setDisplay(curString: string): void {
		const typingElement = document.createElement('div');
		typingElement.innerHTML = curString;

		const textNodes = this._getLeafNodes(typingElement);

		this.actions = [];
		let voidCount = 0;

		for (const node of textNodes) {
			const isVoidElement = this.checkVoidTags(node);
			if (isVoidElement) {
				voidCount++;

				const { props, state, node: voidNode } = isVoidElement;
				voidNode.setProps(props as any);

				if (state) {
					voidNode.setState(state as any);
				}

				(node as ChildNode).replaceWith(voidNode);
			} else {
				const [fragment, actions] = this.parseStringToFragment(node.textContent || '', voidCount);
				this.actions = this.actions.concat(...actions);

				(node as ChildNode).replaceWith(fragment);
			}
		}

		const container = this.querySelector('div');
		if (container) {
			// Use DocumentFragment for final insertion
			const fragment = document.createDocumentFragment();
			fragment.append(...typingElement.childNodes);
			container.replaceChildren(fragment);
		}
	}

	/**
	 * Stop the typing animation.
	 */
	stop(): void {
		this._isAnimating = false;
		if (this._animationFrameId !== null) {
			cancelAnimationFrame(this._animationFrameId);
			this._animationFrameId = null;
		}

		if (typeof this.state.config.onStop === 'function') {
			this.state.config.onStop(this.stringPos, this);
		}
	}

	/**
	 * Finish the typing animation immediately, showing all remaining text.
	 *
	 * @param instant - If true, immediately show full text without animation.
	 *                  If false, rush through at maximum speed.
	 */
	finish(instant: boolean = false): void {
		if (instant) {
			// Get the string being typed
			const str = this.state.strings[0];

			// Get the container element
			const container = this.querySelector('div');

			if (container === null) {
				return;
			}

			// Stop and clean up animation
			this.destroy();

			// Show the full text with all action markers stripped
			container.innerHTML = (this.constructor as typeof TypeWriter).stripActionMarkers(str);
		} else {
			// Rush through animation at maximum speed
			const minSpeed = this.engine.setting('minTextSpeed') as number;
			this.speed = minSpeed > 0 ? 0 : minSpeed;
			this.ignorePause = true;

			if (this.loops) {
				this.loops = false;
				this.stopLoop = true;
			}
		}
	}

	/**
	 * Set content to display, with optional typing animation.
	 * This is the primary API for displaying text in the TypeWriter.
	 *
	 * @param text - The text to display (may include TypeWriter action markers)
	 * @param animate - If true, animate the text. If false, show instantly.
	 *                  Also respects the global TypeAnimation setting.
	 */
	setContent(text: string, animate: boolean = true): void {
		const shouldAnimate = animate && this.engine.setting('TypeAnimation') === true;

		if (shouldAnimate) {
			// Signal start of typing
			this.engine.global('finished_typing', false);
			this.engine.trigger('didStartTyping');

			// Set strings and trigger animation via state update
			this.setState({ strings: [text] });
		} else {
			// Show text instantly with action markers stripped
			const strippedText = (this.constructor as typeof TypeWriter).stripActionMarkers(text);

			// Find or create container
			let container = this.querySelector('div');
			if (!container) {
				// Container was cleared, create a new one
				container = document.createElement('div');
				container.className = 'type-writer-container';
				this.appendChild(container);
			}

			container.innerHTML = strippedText;

			// Signal completion
			this.engine.global('finished_typing', true);
			this.engine.trigger('didFinishTyping');
		}
	}

	/**
	 * Start the typing animation again.
	 */
	start(): void {
		if (this._isAnimating) {
			return;
		}

		this.typewrite();

		if (typeof this.state.config.onStart === 'function') {
			this.state.config.onStart(this.stringPos, this);
		}
	}

	/**
	 * Parse through the current string and return a DocumentFragment with type-character elements.
	 * Uses DocumentFragment for better performance with batch DOM operations.
	 */
	parseStringToFragment(curString: string, voidCount: number): [DocumentFragment, (ParsedAction | undefined)[]] {
		const fragment = document.createDocumentFragment();
		const actions: (ParsedAction | undefined)[] = [];

		// Use cached pattern - fast path if no actions
		if (!this._actionPatternCache) {
			this._parseTextOnlyToFragment(curString, fragment);
			return [fragment, actions];
		}

		const sections = curString.split(this._actionPatternCache);
		let nodeCounter = 0;
		let falseCounter = 0;
		let charIndex = 0; // Track character index for staggered animations

		sections.forEach((section, i) => {
			this.parseIndex++;

			// text section (even indices)
			if (i % 2 === 0) {
				const special: Record<string, boolean> = {};

				if (this.enclosedID.length) {
					for (const id of this.enclosedID) {
						special[id] = true;
					}
				}

				for (const char of section) {
					const isWhite = WHITESPACE_PATTERN.test(char);
					if (isWhite) {
						fragment.appendChild(document.createTextNode(char));
					} else {
						if (falseCounter) {
							nodeCounter -= falseCounter;
							falseCounter = 0;
						}

						nodeCounter++;
						const node = document.createElement('type-character') as TypeCharacter;
						node.setProps({ letter: char, charIndex });
						charIndex++;

						if (this.enclosedID.length) {
							node.setState({ special } as any);
						}

						node.style.opacity = '0';
						fragment.appendChild(node);
					}
				}

				// action section (odd indices)
			} else {
				const result = this._parseActionSection(section, nodeCounter, voidCount);
				if (result) {
					const { action, adjustedNodeCounter, adjustedFalseCounter } = result;
					if (action) {
						actions[adjustedNodeCounter] = action;
					}
					nodeCounter = adjustedNodeCounter + 1;
					falseCounter = adjustedFalseCounter + 1;
				}
			}
		});

		return [fragment, actions];
	}

	/**
	 * Parse text without any actions directly into a DocumentFragment (fast path).
	 */
	private _parseTextOnlyToFragment(curString: string, fragment: DocumentFragment): void {
		let charIndex = 0;
		for (const char of curString) {
			if (WHITESPACE_PATTERN.test(char)) {
				fragment.appendChild(document.createTextNode(char));
			} else {
				const node = document.createElement('type-character') as TypeCharacter;
				node.setProps({ letter: char, charIndex });
				charIndex++;
				node.style.opacity = '0';
				fragment.appendChild(node);
			}
		}
	}

	/**
	 * Parse an action section and return the parsed action.
	 */
	private _parseActionSection(
		section: string,
		nodeCounter: number,
		voidCount: number
	): { action: ParsedAction | undefined; adjustedNodeCounter: number; adjustedFalseCounter: number } | undefined {
		let match: RegExpMatchArray | null = null;
		let type: ActionType | undefined;

		// Try number action
		if (this._numberActionsCache) {
			type = 'number';
			match = section.match(new RegExp(`^\\{(?<action>${this._numberActionsCache})[:\\s](?<n>\\d+)\\}$`));
		}

		// Try enclosed action
		if (!match && this._enclosedActionsCache) {
			type = 'enclosed';
			match = section.match(new RegExp(`^\\{/?(?<action>${this._enclosedActionsCache})(?<options>.*)\\}$`));

			if (match?.groups) {
				const isClosing = section.startsWith('{/');
				if (isClosing) {
					if (this.enclosedID.length) {
						// Extract action name from enclosedID (format: "actionName-parseIndex")
						// Action names can contain hyphens (e.g., "shake-hard"), so we find the last hyphen
						const lastId = this.enclosedID[this.enclosedID.length - 1];
						const lastDashIndex = lastId.lastIndexOf('-');
						const idAction = lastDashIndex > 0 ? lastId.substring(0, lastDashIndex) : lastId;
						if (idAction === match.groups.action) {
							this.enclosedID.pop();
							return undefined;
						} else {
							this.engine.debug.error('Mismatched closing action:', match.groups.action);
							return undefined;
						}
					} else {
						this.engine.debug.error('Closing action without opening:', match.groups.action);
						return undefined;
					}
				} else {
					this.enclosedID.push(`${match.groups.action}-${this.parseIndex}`);
				}
			}
		}

		// Try instance action
		if (!match && this._instanceActionsCache) {
			type = 'instance';
			match = section.match(new RegExp(`^\\{(?<action>${this._instanceActionsCache})\\/\\}$`));
		}

		if (!match?.groups) {
			this.engine.debug.error('Failed to match action:', section);
			return undefined;
		}

		let options: Record<string, string> | string[] | undefined;

		if (type === 'enclosed' && match.groups.options) {
			options = this._parseOptions(match.groups.options);
		}

		let adjustedNodeCounter = nodeCounter;
		if (voidCount) {
			adjustedNodeCounter += voidCount;
		}

		const action: ParsedAction = {
			action: match.groups.action,
			...(match.groups.n && { n: match.groups.n }),
			...(options && { options }),
			...(match.groups.text !== undefined && { text: match.groups.text }),
			...(type === 'enclosed' && { id: this.enclosedID[this.enclosedID.length - 1] })
		};

		if (voidCount) {
			adjustedNodeCounter -= voidCount;
		}

		return { action, adjustedNodeCounter, adjustedFalseCounter: 0 };
	}

	/**
	 * Parse options from an enclosed action.
	 */
	private _parseOptions(optionsStr: string): Record<string, string> | string[] {
		const options: Record<string, string> | string[] = {};
		let opts: string | string[] = optionsStr.trim();

		if (QUOTED_VALUE_PATTERN.test(opts)) {
			opts = opts
				.replace(QUOTE_CONTENT_PATTERN, (_match, _quote, content: string) => {
					return content.replace(/\s/g, '[~]');
				})
				.replace(/\s/g, '=')
				.replace(/\[~\]/g, ' ')
				.split(/=/g);
		} else if (CSS_VALUE_PATTERN.test(opts)) {
			opts = opts
				.replace(CSS_VALUE_PATTERN, (_match, _quote, content: string) => {
					return ' ' + content.replace(/\s/g, '[~]');
				})
				.replace(/\s/g, ':')
				.replace(/\[~\]/g, ' ')
				.split(/:/g);
		} else {
			// If no special patterns, split by whitespace and return as an array of strings.
			opts = opts.split(/\s+/g);
			return opts;
		}

		if (Array.isArray(opts)) {
			opts.forEach((e, i) => {
				if (i % 2 === 0) {
					options[e] = opts[i + 1];
				}
			});
		}

		return options;
	}

	/**
	 * Execute the provided action.
	 */
	executeAction(actionObj: ParsedAction): void {
		const actions = (this.constructor as typeof TypeWriter).actions();

		for (const key in actions) {
			if (actionObj.action === key) {
				const { action: _, ...rest } = actionObj;
				const variables = Object.values(rest);

				actions[key].action.apply(this, variables);
			}
		}
	}

	/**
	 * Adjust the received speed and return it with some randomization.
	 * Uses shared utility from typing-utils.
	 */
	humanizer(speed: number): number {
		return humanizeSpeed(speed);
	}

	/**
	 * Set the cursor on an element, and unset it from the previous element.
	 */
	setCursor(element: Element | undefined, unset: Element | undefined): void {
		if (unset) {
			this.unsetCursor(unset);
		}

		if (element) {
			element.classList.add('cursor');
		}
	}

	/**
	 * Unset the cursor on an element.
	 */
	unsetCursor(element: NodeList | Element): void {
		if (element instanceof NodeList) {
			element.forEach(e => (e as Element).classList.remove('cursor'));
		} else if (element instanceof Element) {
			element.classList.remove('cursor');
		}
	}

	/**
	 * Unset all cursors at once.
	 */
	unsetAllCursors(ignore: boolean = false): void {
		if (typeof this.props.showCursor === 'boolean' || typeof this.props.showCursor === 'number') {
			if (this.props.showCursor) {
				if (this.props.hideCursorOnEnd || ignore) {
					this.unsetCursor(this.querySelectorAll('type-character'));
				}
			}
		} else if (this.state.config.showCursor) {
			if (this.state.config.hideCursorOnEnd || ignore) {
				this.unsetCursor(this.querySelectorAll('type-character'));
			}
		}
	}

	// Reveal one character at a time
	typewrite(): void {
		// Execute actions that appear before the current character
		if (this.actions[this.nodeCounter]) {
			this.executeAction(this.actions[this.nodeCounter]!);

			this.nodeCounter++;
			this.actionsPlayed++;

			return this.typewrite();
		}

		// Reset node counter after executing actions
		if (this.actionsPlayed) {
			this.nodeCounter -= this.actionsPlayed;
			this.actionsPlayed = 0;
		}

		// Calculate target wait time
		this._targetWaitTime = (!this.ignorePause && this.nextPause) || this.humanizer(this.speed);
		this._accumulatedTime = 0;
		this._lastFrameTime = performance.now();
		this._isAnimating = true;

		// Start the animation frame loop
		this._animationFrameId = requestAnimationFrame((timestamp) => this._animationLoop(timestamp));
	}

	/**
	 * Animation frame loop for smooth typing.
	 */
	private _animationLoop(timestamp: number): void {
		if (!this._isAnimating) {
			return;
		}

		// Calculate delta time
		const deltaTime = timestamp - this._lastFrameTime;
		this._lastFrameTime = timestamp;
		this._accumulatedTime += deltaTime;

		// Some developers may want the text to appear instantly,
		// while disabling "InstantText".
		if (this._targetWaitTime < 0) {
			while (this.elements && this.nodeCounter < this.elements.length) {
				this._revealNextCharacter(true);
			}
			return;
		}

		// Check if we've waited long enough
		if (this._accumulatedTime >= this._targetWaitTime) {
			this._revealNextCharacter();
		} else {
			// Continue waiting
			this._animationFrameId = requestAnimationFrame((ts) => this._animationLoop(ts));
		}
	}

	/**
	 * Reveal the next character and schedule the next one.
	 */
	private _revealNextCharacter(instant: boolean = false): void {
		if (this.nextPause) {
			this.nextPause = null;

			if (typeof this.state.config.onTypingResumed === 'function') {
				this.state.config.onTypingResumed(this.stringPos, this);
			}
		}

		// Handle cursor display
		if (typeof this.props.showCursor === 'boolean' || typeof this.props.showCursor === 'number') {
			if (this.props.showCursor && this.elements) {
				this.setCursor(this.elements[this.nodeCounter], this.elements[this.nodeCounter - 1]);
			}
		} else if (this.state.config.showCursor && this.elements) {
			this.setCursor(this.elements[this.nodeCounter], this.elements[this.nodeCounter - 1]);
		}

		if (this.stopLoop) {
			this.stopLoop = false;
		}

		// Reveal character using opacity (avoids layout recalculation)
		if (this.elements?.[this.nodeCounter]) {
			this.elements[this.nodeCounter].style.opacity = '';
		}
		this.nodeCounter += 1;

		// If the developer wants instant text while keeping "InstantText" off,
		// this will handle executing all remaining actions semi-instantly.
		if (instant && this.elements && this.nodeCounter < this.elements.length) {
			if (this.actions[this.nodeCounter]) {
				this.executeAction(this.actions[this.nodeCounter]!);

				this.actionsPlayed++;
				return;
			}

			if (this.actionsPlayed) {
				this.nodeCounter -= this.actionsPlayed;
				this.actionsPlayed = 0;
			}

			return;
		}

		if (this.elements && this.nodeCounter < this.elements.length) {
			// Continue typing - start new timing cycle
			this.typewrite();
		} else {
			// Typing complete
			this._isAnimating = false;
			this._animationFrameId = null;

			this.unsetAllCursors();

			if (this.loops) {
				if (Number.isInteger(this.loops) && typeof this.loops === 'number') {
					if (this.loops > 0) {
						this.loops--;
						if (this.loops === 0) {
							this.stopLoop = true;
						}

						if (typeof this.state.config.onStringLoop === 'function') {
							this.state.config.onStringLoop(this.stringPos, this);
						}

						return this.initiate();
					}
				} else {
					if (typeof this.state.config.onStringLoop === 'function') {
						this.state.config.onStringLoop(this.stringPos, this);
					}

					return this.initiate();
				}
			}

			this.state.config.onStringTyped?.(this.stringPos, this);
		}
	}

	/**
	 * Get the leaf nodes of a provided node.
	 * Uses shared utility from typing-utils.
	 */
	private _getLeafNodes(node: Node | null): Node[] {
		return getLeafNodes(node);
	}

	/**
	 * Stop and destroy the current typing animation.
	 */
	destroy(loop?: boolean): void {
		// Cancel any pending animation frame
		this._isAnimating = false;
		if (this._animationFrameId !== null) {
			cancelAnimationFrame(this._animationFrameId);
			this._animationFrameId = null;
		}

		this.ignorePause = undefined;
		this.loops = false;

		if (loop) {
			while (this.firstElementChild?.firstChild) {
				this.firstElementChild.firstChild.remove();
			}
		}

		if (this.elements) {
			this.elements.forEach(e => e.removeAttribute('style'));
		}

		if (typeof this.state.config.onDestroy === 'function') {
			this.state.config.onDestroy(this);
		}

		this.unsetAllCursors();

		if (this.stopLoop) {
			this.stopLoop = false;
		}
	}

	override async onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		if (property === 'strings') {
			if (!this.state.ignore) {
				this.forceRender().then(() => {
					this.destroy(!!this.loops);
				}).finally(() => {
					this.initiate();
				});
			} else {
				this.setState({ ignore: false });
			}
		}
	}

	override async didMount(): Promise<void> {
		if (this.props.start) {
			this.initiate();
		}
	}

	override render(): string {
		return '<div class="type-writer-container"></div>';
	}

	override async willUnmount(): Promise<void> {
		this.destroy(true);

		this.elements = null;
		this.enclosedID = [];
		this.innerHTML = '';
	}
}

export default TypeWriter;

