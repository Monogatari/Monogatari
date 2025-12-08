import { Component } from '../../lib/Component';

class TypeWriter extends Component {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			}

			this._configuration = Object.assign ({}, this._configuration, object);
		}

		return this._configuration;
	}

	/**
	 @static
	 @function actions — Return the list of all actions from the actions config.
	 @returns {object} The list of actions.
	 **/
	static actions () {
		return this._configuration.actions;
	}

	/**
		@static
		@function action — Get a specific action from the actions config.
		@param {object} action The name of the action.
		@returns {object} The object of the action being searched for.
	**/
	static action (action = null) {
		if (typeof action === 'string') {
			return this._configuration.actions[action];
		}

		if (typeof action === 'object' && action !== null) {
			const requiredFields = ['name', 'type', 'action'];

			if (requiredFields.every (field => Object.keys (action).includes (field))) {
				this._configuration.actions[action.name] = action;

				return action;
			}

			throw new Error ('Attempted to add an action to typing actions, but an invalid action object was provided:\n' + action);
		}

		return this._configuration.actions;
	}

	constructor (...args) {
		super (...args);

		this.state = {
			config: {},
			strings: [],
			cursor: {}
		};

		this.props = {
			string: false
		};

		this.typeSpeed = 100;
		this.speed = this.typeSpeed;
		this.nextPause = null;
		this.timeout = null;
		this.stringPos = 0;
		this.loops = false;

		// this.el has been be replaced by this.

		this.nodeCounter = 0;
		this.enclosedID = [];
		this.parseIndex = 0;
		this.actionsPlayed = 0;
	}

	/**
		@function initiate — Start the typing animation with a fresh configuration.
		@returns {void}
	**/
	initiate () {
		// Set the typed configuration on each initiation.
		this.setState ({ config: this.engine.global ('typedConfiguration') });

		if (!this.state.strings.length && this.props.string) {
			this.setState ({ ignore: true, strings: [this.props.string] });
		}

		const { config, strings } = this.state;

		// TODO: Multi-String Capability?
		this.setProps ({ string: strings[0] });

		// By default, the only working cursor keys are:
		/*
			(default values)
			{
				blinker: "|",
				speed: "0.53s",
				easing: "cubic-bezier(1, 0, 0, 1)",
				color: "" (color is disabled by default)
			}
		*/
		if (Object.values (this.state.cursor).length) {
			for (const key in this.state.cursor) {
				this.style.setProperty (`--cursor-${key}`, this.state.cursor[key]);
			}
		}

		// We need to make sure these get reset on every new initiation.
		// Props type speed should always supersede config type speed. Since that means you, as the developer, intentionally set the typeSpeed on that instance.
		if (this.props.typeSpeed) {
			this.typeSpeed = this.props.typeSpeed;
		} else {
			this.typeSpeed = config.typeSpeed ?? this.typeSpeed;
		}

		if (!this.loops && !this.stopLoop) {
			this.loops = this.props.loop || config.loop || false;
		}

		this.speed = this.typeSpeed;
		this.nextPause = null;
		this.timeout = null;
		this.stringPos = 0;
		this.nodeCounter = 0;
		this.enclosedID = [];
		this.parseIndex = 0;
		this.actionsPlayed = 0;

		this.setDisplay (strings[0]);
		this.elements = this.querySelectorAll ('type-character');

		// We only have one string per instance, so these callbacks are equivalent.
		if (typeof config.onBegin === 'function') {
			config.onBegin (this);
		}

		config.preStringTyped (this.stringPos, this);

		if (typeof this.props.delay === 'number') {
			setTimeout (() => {
				this.typewrite ();
			}, this.props.delay);
		} else {
			this.typewrite ();
		}
	}

	/**
		Get all strings.
		@type {string}
	**/
	get strings () {
		return this.state.strings;
	}

	/**
		@static
		@function checkVoidTags — Check for non-enclosing html tags and return properties for.
		@param {*} node The node to check
		@returns {false|object} A boolean false if it's not a void tag, or an object containing properties for the void tag.
	 */
	checkVoidTags (element) {
		// This has been hacked together... it may need to be improved
		const replace = (text, index = 1) => text
			.slice (text.indexOf ('-') + index)
			.replace (/[-](\w)/g, m => m[1].toUpperCase ());

		const voidElements = ['br', 'hr', 'img'];
		const voidAttributeNames = element.localName && element.getAttributeNames ();

		const voidAttributes = voidAttributeNames && voidAttributeNames.map (elm => ({
			[elm]: elm.slice (0, 5) === 'data-' ?
				element.dataset[replace (elm)] :
				elm.slice (0, 5) === 'aria-' ?
					element['aria' + replace (elm, 0)] :
					element[elm === 'class' ? 'className' : elm]
		})).reduce ((a, v) => Object.assign (a, v), {});

		const voidProperties = voidElements.map (e => ({
			[e]: {
				props: { [e]: true },
				state: {
					...(voidAttributes)
				}
			}
		})).reduce ((a, v) => Object.assign (a, v), {});

		if (element.localName && voidProperties[element.localName.toLowerCase ()]) {
			const { props, state = undefined } = voidProperties[element.localName.toLowerCase ()];
			const node = document.createElement ('type-character');
			node.style.display = 'none';

			return { props, state, node };
		}

		return false;
	}

	/**
		@function setDisplay — Setup the current string with the proper elements to run the typing animation.
		@param {string} curString The current string.
		@returns {void}
	 */
	setDisplay (curString) {
		const typingElement = document.createElement ('div');

		typingElement.innerHTML = curString;

		const textNodes = this._getLeafNodes (typingElement);

		this.actions = [];
		let voidCount = 0;

		for (const node of textNodes) {
			const isVoidElement = this.checkVoidTags (node);
			if (isVoidElement) {
				// Void tags aren't considered "real", which means they aren't added to the "nodeCounter".
				// So we need a fake counter that will be added the next time strings are parsed and an action is added.
				// This will ensure we don't cut off paused text when using void tags are present.
				voidCount++;

				const { props, state, node } = isVoidElement;
				node.setProps (props);

				if (state) {
					node.setState (state);
				}

				// overwrite original with a <type-character> element.
				node.replaceWith (node);
			} else {
				const [nodes, actions] = this.parseString (node.textContent, voidCount);
				this.actions = this.actions.concat (...actions);

				// overwrite the node with <type-character> text
				node.replaceWith (...nodes);
			}
		}

		this.querySelector ('div').replaceChildren (...typingElement.childNodes);
	}

	/**
	    @function stop — Stop the typing animation.
	**/
	stop () {
		clearTimeout (this.timeout);

		if (typeof this.state.config.onStop === 'function') {
			this.state.config.onStop.apply (this, [this.stringPos]);
		}
	}

	/**
	    @function start — Start the typing animation again.
	**/
	start () {
		if (this.timeout) {
			return;
		}

		this.typewrite ();


		if (typeof this.state.config.onStart === 'function') {
			this.state.config.onStart.apply (this, [this.stringPos]);
		}
	}

	/**
		@function parseString — Parse through the current string and replace
		@param {string} curString The current string.
		@returns {array} An array containing the nodes and actions that were parsed and built.
	**/
	parseString (curString, voidCount) {
		// Explanation Provided by: @ceets-deets
		// Separate curString into text and action sections
		//   eg: "{speed:10}hello {pause:1000}{speed:1000}world!"
		//     -> [ '', '{speed:10}', 'hello ', '{pause:1000}', '', '{speed:1000}', 'world!' ]
		// `(?:<pattern>)` is a non-capturing group, see https://devdocs.io/javascript/regular_expressions/non-capturing_group

		const acts = Object.entries (this.constructor.actions ())
			.map (([ action, value ]) => ({ [value.type]: [action] }))
			.reduce ((a, b) => {
				for (const key in b) {
					if (a[key]) {
						a[key] = a[key].concat (b[key]);
					} else {
						a[key] = b[key];
					}
				}
				return a;
			}, {});

		const number = acts.number.join ('|');
		const enclosed = acts.enclosed ? acts.enclosed.join ('|') : '';
		const instance = acts.instance ? acts.instance.join ('|') : '';

		// The enclosedPattern is a bit complicated since we want to check both option based and non-option based enclosed actions.
		// Ex. {jitter}{/jitter} - non-option based enclosed action.
		// Ex. {style color="black"}{/style} - option based enclosed action.
		const numberPattern = `\\{(?:${number}):\\d+\\}`;
		const enclosedPattern = `\\{\\/(?:${enclosed}).*?\\}`;
		const instancePattern = `\\{(?:${instance})\\/\\}`;

		// Make these into globals so they can be referenced during trash dumping.
		const actionPattern = new RegExp (`(${numberPattern}|${enclosedPattern}|${instancePattern})`, 'g');
		const sections = curString.split (actionPattern);

		const nodes = [];
		const actions = [];
		let nodeCounter = 0;
		let falseCounter = 0;

		sections.forEach ((section, i) => {
			// Keep track of the overall string index value to avoid duplicate enclosedIDs.
			this.parseIndex++;

			// text section
			if (i % 2 === 0) {
				// If there are enclosedIDs, turn them into an object and send them on.
				const special = {};

				if (this.enclosedID.length) {
					for (const id of this.enclosedID) {
						special[id] = true;
					}
				}

				// iterate over the string, adding <type-character>s to the element as we go
				for (const char of section) {
					const textNode = document.createTextNode (char);
					let node;
					const isWhite = /\s/.test (char);
					if (isWhite) {
						node = textNode;
					} else {
						// If we have a false counter, then reset the nodeCounter correctly.
						if (falseCounter) {
							nodeCounter -= falseCounter;
							falseCounter = 0;
						}

						nodeCounter++;
						node = document.createElement ('type-character');
						node.setProps ({ letter: char });

						// Check to see if we have any enclosedIDs to transfer.
						if (this.enclosedID.length) {
							node.setState ({ special });
						}

						node.style.display = 'none';
					}
					nodes.push (node);
				}

			// action section
			} else {
				// extract action and parameter
				let match;
				let type;

				if (number) {
					type = 'number';
					match = section.match (new RegExp (`^\\{(?<action>${number}):(?<n>\\d+)\\}$`));
				}

				if (!match && enclosed) {
					type = 'enclosed';
					match = section.match (new RegExp (`^\\{\\/(?<action>${enclosed})(?<options>.*)\\}$`));

					// If we find a match and we have already matched this element before, break it.
					if (match) {
						if (this.enclosedID.length) {
							const idAction = this.enclosedID[this.enclosedID.length - 1].split ('-')[0];
							if (idAction === match.groups.action) {
								return this.enclosedID.pop ();
							} else {
								this.enclosedID.push (`${match.groups.action}-${this.parseIndex}`);
							}
						} else {
							this.enclosedID.push (`${match.groups.action}-${this.parseIndex}`);
						}
					}
				}

				if (!match && instance) {
					type = 'instance';
					match = section.match (new RegExp (`^\\{(?<action>${instance})\\/\\}$`));
				}

				let options;

				if (match) {
					if (type === 'enclosed' && match.groups.options) {
						options = {};
						let opts = match.groups.options.trim ();
						if (/=["'](.*?)\1/g.test (opts)) {
							opts = opts
								.replace (/(["'])(.*?)\1/g, (match, quote, content) => {
									return content.replace (/\s/g, '[~]');
								})
								.replace (/\s/g, '=')
								.replace (/\[~\]/g, ' ')
								.split (/=/g);
						} else if (/(:[ ]?)(.*?);/g.test (opts)) {
							opts = opts
								.replace (/(:[ ]?)(.*?);/g, (match, quote, content) => {
									return ' ' + content.replace (/\s/g, '[~]');
								})
								.replace (/\s/g, ':')
								.replace (/\[~\]/g, ' ')
								.split (/:/g);
						}

						opts.forEach ((e, i) => {
							if (i % 2 === 0) {
								options[e] = opts[i + 1];
							}
						});
					}

					// If we have a void count, increase the node counter to accommodate.
					if (voidCount) {
						nodeCounter += voidCount;
					}

					actions[nodeCounter] = {
						action: match.groups.action,
						...(match.groups.n && {n: match.groups.n}),
						...(options && {options}),
						...(match.groups.text !== undefined && {text: match.groups.text}),
						...(type === 'enclosed' && {id: this.enclosedID[this.enclosedID.length - 1]})
					};

					// If we have a void count, decrease the node counter to correct it.
					if (voidCount) {
						nodeCounter -= voidCount;
					}

					// We have to increase the nodeCounter to make sure that side-by-side actions aren't replaced.
					// But we also have to make sure the nodeCounter is accurate, so we increase the falseCounter alongside it.
					nodeCounter++;
					falseCounter++;
				} else {
					this.engine.debug.error ('Failed to match action:', section);
				}
			}
		});

		return [nodes, actions];
	}

	/**
		@function executeAction — Execute the provided action asynchronously, even if it's not asynchronous.
		- TODO: Make asynchronous call stop the typing animation(?)
		@param {object} actionObj The action to be executed.
		@returns {void}
	**/
	executeAction (actionObj) {
		const actions = this.constructor.actions ();

		for (const key in actions) {
			if (actionObj.action === key) {
				// Since we already know what action it is, we don't need to send that data to the callback function.
				// Extract values excluding the 'action' key
				const { action: _, ...rest } = actionObj;
				const variables = Object.values (rest);

				actions[key].action.apply (this, variables);
			}
		}
	}

	/**
		@function humanizer — Adjust the received speed and return it.
		@param {number} speed A number representing speed.
		@returns {number} The humanized speed.
	**/
	humanizer (speed) {
		return Math.round ((Math.random () * speed) / 2) + speed;
	}

	/**
		@function setCursor — Set the cursor on an element, and unset it from the previous element.
		@param {HTMLElement} element The element to set the cursor on.
		@param {HTMLElement|undefined} unset The element that should have the cursor unset.
		@returns {void}
	**/
	setCursor (element, unset) {
		if (unset) {
			this.unsetCursor (unset);
		}

		if (element) {
			element.classList.add ('cursor');
		}
	}

	/**
		@function unsetCursor — Unset the cursor on an element.
		@param {NodeList|HTMLElement} element A list of nodes to unset, or a single node to unset.
		@returns {void}
	**/
	unsetCursor (element) {
		if (element instanceof NodeList) {
			element.forEach (e => e.classList.remove ('cursor'));
		} else if (element instanceof HTMLElement) {
			element.classList.remove ('cursor');
		}
	}

	/**
		@function unsetAllCursors — Unset all cursors at once.
		- This is mainly just for reusability to avoid duplicating code.
		@param {boolean} ignore Ignore the prerequisite that requires "hideCursorOnEnd" to be enabled.
		- This is never used in the code itself, but could be useful to someone? Maybe?
		@returns {void}
	**/
	unsetAllCursors (ignore = false) {
		// Props should always take priority in these situations.
		if (typeof this.props.showCursor === 'boolean' || typeof this.props.showCursor === 'number') {
			if (this.props.showCursor) {
				if (this.props.hideCursorOnEnd || ignore) {
					this.unsetCursor (this.querySelectorAll ('type-character'));
				}
			}
		} else if (this.state.config.showCursor) {
			if (this.state.config.hideCursorOnEnd || ignore) {
				this.unsetCursor (this.querySelectorAll ('type-character'));
			}
		}
	}

	/**
		@function typewrite — "Write" the letters on screen.
		@returns {void}
	**/
	typewrite () {
		// Execute actions that appear before the end of the line.
		// We increase the node counter to see if there are any other actions immediately after it.
		if (this.actions[this.nodeCounter]) {
			this.executeAction (this.actions[this.nodeCounter]);

			this.nodeCounter++;
			this.actionsPlayed++;

			return this.typewrite ();
		}

		// We set the node counter to what it was before we increased it so we don't skip text.
		if (this.actionsPlayed) {
			this.nodeCounter -= this.actionsPlayed;
			this.actionsPlayed = 0;
		}

		const waitTime = (!this.ignorePause && this.nextPause) ?? this.humanizer (this.speed);

		this.timeout = setTimeout (() => {
			if (this.nextPause) {
				this.nextPause = null;

				if (typeof this.state.config.onTypingResumed === 'function') {
					this.state.config.onTypingResumed (this.stringPos, this);
				}
			}

			// Props always takes priority over the config file.
			if (typeof this.props.showCursor === 'boolean' || typeof this.props.showCursor === 'number') {
				if (this.props.showCursor) {
					this.setCursor (this.elements[this.nodeCounter], this.elements[this.nodeCounter - 1]);
				}
			} else if (this.state.config.showCursor) {
				this.setCursor (this.elements[this.nodeCounter], this.elements[this.nodeCounter - 1]);
			}

			if (this.stopLoop) {
				this.stopLoop = false;
			}

			this.elements[this.nodeCounter].style.removeProperty ('display');
			this.nodeCounter += 1;

			if (this.nodeCounter < this.elements.length) {
				this.typewrite ();
			} else {
				this.timeout = null;

				// Check to see if we have hideCursorOnEnd enabled, and unset all cursors if so.
				this.unsetAllCursors ();

				if (this.loops) {
					if (Number.isInteger (this.loops)) {
						// Don't want to infinitely loop if a negative was set.
						// If you want infinite looping, do it with a boolean.
						if (this.loops > 0) {
							this.loops--;
							if (this.loops === 0) {
								this.stopLoop = true;
							}

							if (typeof this.state.config.onStringLoop === 'function') {
								this.state.config.onStringLoop (this.stringPos, this);
							}

							return this.initiate ();
						}
					} else {
						if (typeof this.state.config.onStringLoop === 'function') {
							this.state.config.onStringLoop (this.stringPos, this);
						}

						return this.initiate ();
					}
				}

				// onStringTyped should really only be reached once looping is finished.
				this.state.config.onStringTyped (this.stringPos, this);
			}
		}, waitTime);
	}

	/**
		@function _getLeafNodes — Get the leaf nodes of a provided node.
		@param {HTMLElement} node A node element.
		@returns {array} The array of nodes to be processed.
	**/
	_getLeafNodes (node) {
		const leafNodes = [];

		const traverse = currentNode => {
			const children = currentNode.childNodes;

			if (children.length === 0) {
				// It's a leaf node (no child nodes)
				leafNodes.push (currentNode);
			} else {
				// Recursively process child nodes
				children.forEach (child => traverse (child));
			}
		};

		if (node) {
			traverse (node);
		}

		return leafNodes;
	}

	/**
		@function destroy — Stop and destroy the current typing animation.
		@returns {void}
	**/
	destroy (loop) {
		clearTimeout (this.timeout);

		this.timeout = null;
		this.ignorePause = undefined;
		this.loops = false;

		if (loop) {
			while (this.firstElementChild.firstChild) {
				this.firstElementChild.firstChild.remove ();
			}
		}

		if (this.elements) {
			this.elements.forEach (e => e.removeAttribute ('style'));
		}

		if (typeof this.state.config.onDestroy === 'function') {
			this.state.config.onDestroy.apply (this);
		}

		// If we're showing the cursor and also hiding it on end, hide it upon destruction.
		this.unsetAllCursors ();

		// If this SOMEHOW gets set, then unset it.
		if (this.stopLoop) {
			this.stopLoop = false;
		}
	}

	onStateUpdate (property, oldValue, newValue) {
		if (property === 'strings') {
			if (!this.state.ignore) {
				this.forceRender ().then (() => {
					this.destroy (this.loops);
				}).finally (() => {
					this.initiate ();
				});
			} else {
				this.setState ({ ignore: false });
			}
		}

		return Promise.resolve ();
	}

	didMount () {
		if (this.props.start) {
			this.initiate ();
		}

		return Promise.resolve ();
	}

	render () {
		return '<div class="type-writer-container"></div>';
	}

	// In some contexts, you can sometimes run into memory leak issues on certain components.
	// (Specifically the "text-input" component, seems to be an engine bug)
	// =======================================================================================
	// This will attempt to remedy the memory build up a little bit in those contexts.
	willUnmount () {
		this.destroy (true);

		this.elements = null;
		this.enclosedID = null;
		this.innerHTML = '';

		return Promise.resolve ();
	}
}

TypeWriter.tag = 'type-writer';

TypeWriter._configuration = {
	actions: {
		'pause': {
			name: 'pause',
			type: 'number',
			action: function (number) {
				const time = Number (number);

				if (time) {
					this.nextPause = time;

					if (typeof this.state.config.onTypingPaused === 'function') {
						this.state.config.onTypingPaused.apply (this, [this.stringPos]);
					}
				} else {
					this.engine.debug.error ('Provided value was not a valid number value:\n' + number);
				}
			},
		},
		'speed': {
			name: 'speed',
			type: 'number',
			action: function (number) {
				const percentage = Number (number);

				if (percentage) {
					const speed = Math.floor ((this.speed * 100) / percentage);
					this.speed = speed;
				} else {
					this.engine.debug.error ('Provided value was not a valid number value:\n' + number);
				}
			},
		},
	},
};


export default TypeWriter;