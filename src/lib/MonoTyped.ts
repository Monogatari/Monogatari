/**
 * MonoTyped - A typing animation library for Monogatari
 *
 * Handles character-by-character text display with support for
 * speed changes and pauses via inline commands.
 */

interface TypedConfig {
	strings: string[];
	typeSpeed?: number;
	onBegin?: (self: Typed) => void;
	onStart?: (index: number, self: Typed) => void;
	onStop?: (index: number, self: Typed) => void;
	preStringTyped?: (index: number, self: Typed) => void;
	onStringTyped?: (index: number, self: Typed) => void;
	onTypingPaused?: (index: number, self: Typed) => void;
	onTypingResumed?: (index: number, self: Typed) => void;
	onDestroy?: (self: Typed) => void;
}

interface TypedAction {
	action: string;
	n: string;
  // TODO: There are missing fields here
}

class Typed {
	config: TypedConfig;
	speed: number;
	nextPause: number | null = null;
	timeout: ReturnType<typeof setTimeout> | null = null;
	el: HTMLElement;
	nodeCounter: number = 0;
	spans: NodeListOf<HTMLSpanElement>;
	actions: (TypedAction | undefined)[] = [];

	constructor (element: string | HTMLElement, config: TypedConfig) {
		this.config = config;

		this.config.typeSpeed = this.config.typeSpeed ?? 100;

		this.speed = config.typeSpeed!;
		this.nextPause = null;
		this.timeout = null;

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
		const textNodes = this._getLeafNodes(newElement);
		this.actions = [];
		for (const textNode of textNodes) {
			const [nodes, actions] = this.parseString(textNode.textContent || '');
			this.actions = this.actions.concat(...actions);

			// overwrite the node with <span> text
			(textNode as ChildNode).replaceWith(...nodes);
		}
		element.replaceChildren(...newElement.childNodes);
	}

	/**
	 * Stop the typing animation
	 */
	stop (): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.config.onStop?.(0, this);
	}

	/**
	 * Start or resume the typing animation
	 */
	start (): void {
		if (!this.timeout) {
			this.typewrite();
			this.config.onStart?.(0, this);
		}
	}

	/**
	 * Parse a string into nodes and actions
	 *
	 * Supports inline commands:
	 * - {speed:N} - Change typing speed to N milliseconds
	 * - {pause:N} - Pause for N milliseconds
	 *
	 * @example
	 * "{speed:10}hello {pause:1000}{speed:1000}world!"
	 */
	parseString (curString: string): [Node[], (TypedAction | undefined)[]] {
		// Separate curString into text and action sections
		//   eg: "{speed:10}hello {pause:1000}{speed:1000}world!"
		//     -> [ '', '{speed:10}', 'hello ', '{pause:1000}', '', '{speed:1000}', 'world!' ]
		// `(?:<pattern>)` is a non-capturing group
		const actionPattern = /(\{(?:pause|speed):\d+\})/;
		const sections = curString.split(actionPattern);

		const nodes: Node[] = [];
		const actions: (TypedAction | undefined)[] = [];
		let nodeCounter = 0;

		sections.forEach((section, i) => {
			// text section
			if (i % 2 === 0) {
				// iterate over the string, adding <span>s to the element as we go
				for (const char of section) {
					const textNode = document.createTextNode(char);
					let node: Node;
					const isWhite = /\s/.test(char);
					if (isWhite) {
						node = textNode;
					} else {
						nodeCounter++;
						const span = document.createElement('span');
						span.append(textNode);
						span.style.visibility = 'hidden';
						node = span;
					}
					nodes.push(node);
				}

			// action section
			} else {
				// extract action and parameter
				const match = /\{(?<action>pause|speed):(?<n>\d+)\}/.exec(section);
				if (match?.groups) {
					actions[nodeCounter] = {
						action: match.groups.action as 'pause' | 'speed',
						n: match.groups.n,
					};
				}
			}
		});

		return [nodes, actions];
	}

	/**
	 * Execute a typing action (speed change or pause)
	 */
	executeAction (action: TypedAction): void {
		if (action.action === 'speed') {
			this.speed = parseInt(action.n, 10); // overwrites speed value permanently
		} else if (action.action === 'pause') {
			this.config.onTypingPaused?.(0, this);
			this.nextPause = parseInt(action.n, 10); // sets a wait time temporarily
		}
	}

	/**
	 * Main typing loop - reveals one character at a time
	 */
	typewrite (): void {
		if (this.actions[this.nodeCounter]) {
			this.executeAction(this.actions[this.nodeCounter]!);
		}

		const waitTime = this.nextPause ?? this.speed;

		this.timeout = setTimeout(() => {
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
				this.timeout = null;
				this.config.onStringTyped?.(0, this);
			}
		}, waitTime);
	}

	/**
	 * Clean up and destroy the typed instance
	 */
	destroy (): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = null;
		this.el.replaceChildren();
		this.config.onDestroy?.(this);
	}

	/**
	 * Get all leaf (text) nodes from a DOM tree
	 */
	private _getLeafNodes (node: Node): Node[] {
		const leafNodes: Node[] = [];

		const traverse = (currentNode: Node): void => {
			const children = currentNode.childNodes;

			if (children.length === 0) {
				// It's a leaf node (no child nodes)
				leafNodes.push(currentNode);
			} else {
				// Recursively process child nodes
				children.forEach(child => traverse(child));
			}
		};

		traverse(node);

		return leafNodes;
	}
}

export default Typed;

