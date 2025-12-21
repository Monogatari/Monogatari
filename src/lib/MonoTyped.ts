/**
 * MonoTyped - A typing animation library for Monogatari
 *
 * Handles character-by-character text display with support for
 * speed changes and pauses via inline commands.
 *
 * This is a standalone class exported for external use.
 * For the component-based version, see TypeWriter.
 */

import {
	getLeafNodes,
	parseBasicStringToFragment,
	humanizeSpeed,
	type BaseTypedAction,
	type TypingCallbacks,
	type AnimationTimingState,
	createAnimationTimingState,
} from './typing-utils';

interface TypedConfig extends TypingCallbacks<Typed> {
	strings: string[];
	typeSpeed?: number;
	/** Whether to add randomization to typing speed (default: false) */
	humanize?: boolean;
}

class Typed {
	config: TypedConfig;
	speed: number;
	nextPause: number | null = null;
	el: HTMLElement;
	nodeCounter: number = 0;
	spans: NodeListOf<HTMLSpanElement>;
	actions: (BaseTypedAction | undefined)[] = [];

	// Animation timing state (RAF-based)
	private _timing: AnimationTimingState;

	constructor (element: string | HTMLElement, config: TypedConfig) {
		this.config = config;
		this.config.typeSpeed = this.config.typeSpeed ?? 100;

		this.speed = config.typeSpeed!;
		this.nextPause = null;
		this._timing = createAnimationTimingState();

		this.el = typeof element === 'string'
			? document.querySelector(element) as HTMLElement
			: element;

		this.nodeCounter = 0;
		this.setDisplay(this.el, config.strings[0]);
		this.spans = this.el.querySelectorAll('span');

		// We only have one string per instance, so these callbacks are equivalent.
		this.config.onBegin?.(this);
		this.config.preStringTyped?.(0, this);

		this.typewrite();
	}

	get strings (): string[] {
		return this.config.strings;
	}

	/**
	 * Parse and set up the display element with hidden spans for each character
	 */
	setDisplay (element: HTMLElement, curString: string): void {
		const newElement = document.createElement('div');
		newElement.innerHTML = curString;
		const textNodes = getLeafNodes(newElement);
		this.actions = [];

		for (const textNode of textNodes) {
			const [fragment, actions] = parseBasicStringToFragment(textNode.textContent || '');
			this.actions = this.actions.concat(...actions);

			// Replace the text node with the fragment
			(textNode as ChildNode).replaceWith(fragment);
		}

		element.replaceChildren(...newElement.childNodes);
	}

	/**
	 * Stop the typing animation
	 */
	stop (): void {
		this._timing.isAnimating = false;
		if (this._timing.animationFrameId !== null) {
			cancelAnimationFrame(this._timing.animationFrameId);
			this._timing.animationFrameId = null;
		}
		this.config.onStop?.(0, this);
	}

	/**
	 * Start or resume the typing animation
	 */
	start (): void {
		if (!this._timing.isAnimating) {
			this.typewrite();
			this.config.onStart?.(0, this);
		}
	}

	/**
	 * Execute a typing action (speed change or pause)
	 */
	executeAction (action: BaseTypedAction): void {
		if (action.action === 'speed' && action.n) {
			this.speed = parseInt(action.n, 10);
		} else if (action.action === 'pause' && action.n) {
			this.config.onTypingPaused?.(0, this);
			this.nextPause = parseInt(action.n, 10);
		}
	}

	/**
	 * Main typing loop - reveals one character at a time using requestAnimationFrame.
	 */
	typewrite (): void {
		if (this.actions[this.nodeCounter]) {
			this.executeAction(this.actions[this.nodeCounter]!);
		}

		// Calculate target wait time
		const baseTime = this.nextPause ?? this.speed;
		this._timing.targetWaitTime = this.config.humanize ? humanizeSpeed(baseTime) : baseTime;
		this._timing.accumulatedTime = 0;
		this._timing.lastFrameTime = performance.now();
		this._timing.isAnimating = true;

		// Start the animation frame loop
		this._timing.animationFrameId = requestAnimationFrame((timestamp) => this._animationLoop(timestamp));
	}

	/**
	 * Animation frame loop for smooth typing.
	 */
	private _animationLoop (timestamp: number): void {
		if (!this._timing.isAnimating) {
			return;
		}

		// Calculate delta time
		const deltaTime = timestamp - this._timing.lastFrameTime;
		this._timing.lastFrameTime = timestamp;
		this._timing.accumulatedTime += deltaTime;

		// Check if we've waited long enough
		if (this._timing.accumulatedTime >= this._timing.targetWaitTime) {
			this._revealNextCharacter();
		} else {
			// Continue waiting
			this._timing.animationFrameId = requestAnimationFrame((ts) => this._animationLoop(ts));
		}
	}

	/**
	 * Reveal the next character and schedule the next one.
	 */
	private _revealNextCharacter (): void {
		if (this.nextPause) {
			this.nextPause = null;
			this.config.onTypingResumed?.(0, this);
		}

		if (this.spans[this.nodeCounter]) {
			this.spans[this.nodeCounter].style.visibility = '';
		}
		this.nodeCounter += 1;

		if (this.nodeCounter < this.spans.length) {
			this.typewrite();
		} else {
			this._timing.isAnimating = false;
			this._timing.animationFrameId = null;
			this.config.onStringTyped?.(0, this);
		}
	}

	/**
	 * Clean up and destroy the typed instance
	 */
	destroy (): void {
		this._timing.isAnimating = false;
		if (this._timing.animationFrameId !== null) {
			cancelAnimationFrame(this._timing.animationFrameId);
			this._timing.animationFrameId = null;
		}
		this.el.replaceChildren();
		this.config.onDestroy?.(this);
	}
}

export default Typed;
