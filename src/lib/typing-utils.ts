export interface BaseTypedAction {
	action: string;
	n?: string;
}

export interface TypingCallbacks<T> {
	onBegin?: (self: T) => void;
	onStart?: (index: number, self: T) => void;
	onStop?: (index: number, self: T) => void;
	preStringTyped?: (index: number, self: T) => void;
	onStringTyped?: (index: number, self: T) => void;
	onTypingPaused?: (index: number, self: T) => void;
	onTypingResumed?: (index: number, self: T) => void;
	onDestroy?: (self: T) => void;
}

/** Pattern to match whitespace characters */
export const WHITESPACE_PATTERN = /\s/;

/** Basic action pattern for {pause:N} and {speed:N} commands */
export const BASIC_ACTION_PATTERN = /(\{(?:pause|speed):\d+\})/;

/** Pattern to extract action name and value */
export const ACTION_EXTRACT_PATTERN = /\{(?<action>pause|speed):(?<n>\d+)\}/;

/**
 * Get all leaf (text) nodes from a DOM tree.
 * Traverses the tree recursively to find nodes with no children.
 *
 * @param node - The root node to start traversal from
 * @returns Array of leaf nodes
 */
export function getLeafNodes (node: Node | null): Node[] {
	const leafNodes: Node[] = [];

	const traverse = (currentNode: Node): void => {
		const children = currentNode.childNodes;

		if (children.length === 0) {
			leafNodes.push(currentNode);
		} else {
			children.forEach(child => traverse(child));
		}
	};

	if (node) {
		traverse(node);
	}

	return leafNodes;
}

/**
 * Parse a string into nodes and actions using the basic action pattern.
 * Creates span elements with visibility:hidden for each character.
 *
 * Supports inline commands:
 * - {speed:N} - Change typing speed to N milliseconds
 * - {pause:N} - Pause for N milliseconds
 *
 * @param curString - The string to parse
 * @returns Tuple of [nodes array, actions array]
 *
 * @example
 * parseBasicString("{speed:10}hello {pause:1000}world!")
 * // Returns nodes for each character and actions at appropriate positions
 */
export function parseBasicString (curString: string): [Node[], (BaseTypedAction | undefined)[]] {
	const sections = curString.split(BASIC_ACTION_PATTERN);

	const nodes: Node[] = [];
	const actions: (BaseTypedAction | undefined)[] = [];
	let nodeCounter = 0;

	sections.forEach((section, i) => {
		// text section (even indices)
		if (i % 2 === 0) {
			for (const char of section) {
				const isWhite = WHITESPACE_PATTERN.test(char);
				if (isWhite) {
					nodes.push(document.createTextNode(char));
				} else {
					nodeCounter++;
					const span = document.createElement('span');
					span.appendChild(document.createTextNode(char));
					span.style.visibility = 'hidden';
					nodes.push(span);
				}
			}

		// action section (odd indices)
		} else {
			const match = ACTION_EXTRACT_PATTERN.exec(section);
			if (match?.groups) {
				actions[nodeCounter] = {
					action: match.groups.action,
					n: match.groups.n,
				};
			}
		}
	});

	return [nodes, actions];
}

/**
 * Parse a string into a DocumentFragment for better performance.
 * Same as parseBasicString but returns a DocumentFragment instead of array.
 *
 * @param curString - The string to parse
 * @returns Tuple of [DocumentFragment, actions array]
 */
export function parseBasicStringToFragment (curString: string): [DocumentFragment, (BaseTypedAction | undefined)[]] {
	const fragment = document.createDocumentFragment();
	const sections = curString.split(BASIC_ACTION_PATTERN);

	const actions: (BaseTypedAction | undefined)[] = [];
	let nodeCounter = 0;

	sections.forEach((section, i) => {
		// text section (even indices)
		if (i % 2 === 0) {
			for (const char of section) {
				const isWhite = WHITESPACE_PATTERN.test(char);
				if (isWhite) {
					fragment.appendChild(document.createTextNode(char));
				} else {
					nodeCounter++;
					const span = document.createElement('span');
					span.appendChild(document.createTextNode(char));
					span.style.visibility = 'hidden';
					fragment.appendChild(span);
				}
			}

		// action section (odd indices)
		} else {
			const match = ACTION_EXTRACT_PATTERN.exec(section);
			if (match?.groups) {
				actions[nodeCounter] = {
					action: match.groups.action,
					n: match.groups.n,
				};
			}
		}
	});

	return [fragment, actions];
}

/**
 * Interface for RAF-based animation timing state.
 */
export interface AnimationTimingState {
	animationFrameId: number | null;
	lastFrameTime: number;
	accumulatedTime: number;
	targetWaitTime: number;
	isAnimating: boolean;
}

/**
 * Create initial animation timing state.
 */
export function createAnimationTimingState (): AnimationTimingState {
	return {
		animationFrameId: null,
		lastFrameTime: 0,
		accumulatedTime: 0,
		targetWaitTime: 0,
		isAnimating: false,
	};
}

/**
 * Add humanization (slight randomness) to typing speed.
 *
 * @param speed - Base speed in milliseconds
 * @returns Randomized speed
 */
export function humanizeSpeed (speed: number): number {
	return Math.round((Math.random() * speed) / 2) + speed;
}


