
/**
 * An action describes the functionality for a Monogatari statement, when Monogatari
 * reads a part of the script (a statement), it will look for an action that matches
 * the statement and run it.
 *
 * The life cycle of an action is divided in three parts: Mounting, Application
 * and Reverting.
 *
 * The mounting cycle has 3 steps:
 *
 * 1. Setup - Here the action needs to set up everything it will need for working
 *            generally, in this section an action will register the variables it
 *            needs such as object histories and state variables or even add the
 *            HTML contents to the document.
 *
 * 2. Bind - Once the action has been setup, its time to bind all the necessary
 *           event listeners or perfom more operations on the DOM once all elements
 *           have been setup.
 *
 * 3. Init - Finally, once the action was setup and it performed all the needed
 *           bindings, it may declare or modify variables that needed the HTML to
 *           be setup first or perform any other needed final operations.
 *
 * As noted, the Mounting cycle is mostly about getting everything setup for a
 * correct operation of the action. Thr Application and Reverting cycles are used
 * for the actual workings of an action in a game.
 *
 * Before executing an action Monogatari will check if the current statement matches
 * with the action, therefore the Action must implement a matching function. If
 * the statement to match should be a String, the action must implement the
 * matchString () method, if it should be an Object, the action must implement
 * the matchObject () method. Both should return a boolean on whether the action
 * matches the given statement or not.
 *
 *
 * The Application cycle refers to the cycle of an Action when it is run because of
 * a statement in the script.
 *
 * The Application Cycle has 3 steps as well:
 *
 * 1. Will Apply - Executed when the action will be applied, if any operations
 *                 need to be done before its application, this is the place.
 *
 * 2. Apply - The application itself, this is where all the logic regarding the
 *            action must be applied. Of course every action will implement its
 *            own logic depending on what it has to do.
 *
 * 3. Did Apply - Executed after the action was applied, this function is great
 *                for cleanup operations or any other thing that needs to be done
 *                after the action was applied.
 *
 * While the Application clycle is all about executing the action, the Revert
 * cycle is the opposite and it reverts the things the Application cycle does.
 * Reverting is used when the player goes back in the game and has equivalent
 * steps to the Application Cycle:
 *
 * 1. Will Revert - Executed when the action will be reverted, if any operations
 *                 need to be done before its revertion such as checking for history
 *                 elements or any other check, this is the place.
 *
 * 2. Revert - The reversion of the action, its common that the actions revert to
 *             previous states or revert other changes done by the application of
 *             an action. Every action will implement its own logic depending on
 *             what it has to do.
 *
 * 3. Did Revert - Executed after the action was reverted, this function is great
 *                for cleanup operations or any other thing that needs to be done
 *                after the action was reverted.
 *
 * @class Action
 */
class Action {

	/**
	 * Marks the action as experimental, meaning it's not stable and should not
	 * be used in production.
	 */
	static _experimental = false;

	/**
	 * If needed, every action should declare its configuration as follows. This
	 * configuration object should be used to store action-specific settings as well
	 * as other objects/assets used by the action. If any specific object needs
	 * recurrent access such as the declarations in the script.js file, provinding
	 * a static function for that specific object could be great.
	 */
	static _configuration = {};

	/**
	 * All actions must have an ID, with this ID the developers will be able to
	 * access the action classes, remove actions or register new ones. They must also
	 * be unique.
	 */
	static id = 'Action';

	/**
	 * The loading order of an action can be used to sort which actions should be
	 * run before or after the others when a game is loaded in case they have some
	 * dependencies between themselves.
	 */
	static loadingOrder = 0;

	/**
	 * @static configuration - A simple function providing access to the configuration
	 * object of the function. If the action has a configuration object it must
	 * also include this method.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * configuration will be updated with (i.e. Object.assign) or a string to access
	 * a property.
	 *
	 * @return {any} - If the parameter sent was a string, the function will
	 * return the value of the property whose name matches the parameter. If no
	 * parameter was sent, then the function will return the whole configuration
	 * object.
	 */
	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			} else {
				this._configuration = Object.assign ({}, this._configuration, object);
			}
		} else {
			return this._configuration;
		}
	}

	/**
	 * @static shouldProceed - Either when the user clicks in the game to proceed or
	 * the autoPlay feature is ready to go on, Monogatari will first check with
	 * all actions if it's ok to proceed. Every action should implement its own
	 * logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if proceeding is alright or rejected if its not
	 */
	static shouldProceed () {
		return Promise.resolve ();
	}

	/**
	 * @static willProceed - Once the shouldProceed check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game proceeding.
	 *
	 * @return {Promise}
	 */
	static willProceed () {
		return Promise.resolve ();
	}

	/**
	 * @static shouldRollback - Similarly to the shouldProceed () function, this one takes
	 * action when the player tries to go back in the game.Monogatari will first
	 * check with all actions if it's ok to go back. Every action should implement
	 * its own logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if going back is alright or rejected if its not
	 */
	static shouldRollback () {
		return Promise.resolve ();
	}

	/**
	 * @static willRollback - Once the shouldRollback check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game reverting the previous action
	 *
	 * @return {Promise}
	 */
	static willRollback () {
		return Promise.resolve ();
	}

	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts. If the action needs to do any particular activities when the game
	 * starts, then this function should be implemented and it will be automatically
	 * called once the player starts the game.
	 *
	 * @return {Promise}
	 */
	static onStart () {
		return Promise.resolve ();
	}

	/**
	 * @static onLoad - This function acts as an event listener for when a game
	 * is loaded. If the action needs to perform any particular actions such as
	 * restoring some state (i.e. showing images, playing media, etc.) when a game
	 * is loaded, this function must be implemented and it will be automatically
	 * called when a game is loaded.
	 *
	 * @return {Promise}  description
	 */
	static onLoad () {
		return Promise.resolve ();
	}

	/**
	 * @static onSave - This function acts as an event listener for when a game
	 * is saved. If the action needs to perform any particular actions when that
	 * happens, this function must be implemented and it will be automatically
	 * called when a game is saved.
	 *
	 * @param {Object} slot - The slot object that has just been saved.
	 * @param {string} slot.key - The key used to save the slot in the local storage
	 * @param {Object} slot.value - The actual value saved
	 *
	 * @return {Promise}  description
	 */
	static onSave () {
		return Promise.resolve ();
	}

	/**
	 * @static reset - When a game ends using the 'end' statement or before a game
	 * is loaded, Monogatari will perform a reset on all its actions. If the action
	 * needs to reset a state or any other variables/elements to an initial state
	 * once a game is over or a new one is loaded, the logic for it must be implemented
	 * here and the function will be automatically called when needed.
	 *
	 * @return {Promise} - Result of the reset operation
	 */
	static reset () {
		return Promise.resolve ();
	}

	/**
	 * @static setup - The setup is the first step of the Mounting cycle, all
	 * operations required for the action's setup should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the setup operation
	 */
	static setup (selector) {
		return Promise.resolve ();
	}

	/**
	 * @static bind - The binding is the second step of the Mounting cycle, all
	 * operations related to event bindings or other sort of binding with the
	 * HTML content generated in the setup phase should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the binding operation
	 */
	static bind (selector) {
		return Promise.resolve ();
	}

	/**
	 * @static init - The initialization is the last step of the Mounting cycle,
	 * all final operations should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the initialization operation
	 */
	static init (selector) {
		return Promise.resolve ();
	}

	/**
	 * @static match - Currently this function is saved up for future uses.
	 *
	 * @param {any} statement - Statement to match
	 *
	 * @returns {boolean} - Whether the action matches the statement or not
	 */
	static match (statement) {
		return false;
	}

	/**
	 * @static matchString - When Monogatari goes through a string statement, it
	 * will use this function to find which action it corresponds to.
	 *
	 * @param  {string[]} statement - The statement to match, splitted into an array by spaces
	 * @return {boolean} - Whether the action matches the statement or not
	 */
	static matchString (statement) {
		return false;
	}

	/**
	 * @static matchObject - Similarly to its string counterpart, this function
	 * is used when Monogatari goes through an Object (generally JSON) statement
	 * to find which action the statement corresponds to.
	 *
	 * @param  {Object} statement - The statement to match,
	 * @return {boolean} - Whether the action matches the statement or not
	 */
	static matchObject (statement) {
		return false;
	}

	static beforeRun ({ advance }) {
		return Promise.resolve ();
	}

	static beforeRevert ({ advance, step }) {
		return Promise.resolve ();
	}

	static afterRun ({ advance }) {
		return Promise.resolve ();
	}

	static afterRevert ({ advance, step }) {
		return Promise.resolve ();
	}

	/**
	 * constuctor - Once the action has been matched through one of the match
	 * functions, an instance of the action is created with the statement  it
	 * matched as argument. As in the match functions, the string statements will
	 * actually be received as arrays of words splitted by spaces.
	 *
	 * @param  {string[]|Object} statement - The statement it matched
	 */
	constuctor (statement) {

	}

	/**
	 * The engine to which this action registered to.
	 *
	 * @type {Monogatari}
	 */
	get engine () {
		return this.constructor.engine;
	}

	set engine (value) {
		throw new Error ('Component engine reference is hold at static level and cannot be modified.');
	}

	/**
	 * setContext - This is a built in function in every action, the context of
	 * the action will always be the Monogatari class. This is mainly used for
	 * cases where the action can't import or reference directly the Monogatari
	 * class so it can simply use this.context instead.
	 *
	 * @param  {Monogatari} context - The Monogatari Class
	 */
	setContext (context) {
		this.context = context;
	}

	/**
	 * _setStatement - Since the original statement used to match an action tends
	 * to be transformed by monogatari (i.e. by splitting it or other things),
	 * this action built-in function is automatically used by Monogatari to
	 * set the original statement to the action once it has been instantiated.
	 * Because of this function, you can always refere to the original statement
	 * in the Application and Reverting cycles with this._statement;
	 *
	 * @param  {string|Object|function} statement - The statement with which the action was run
	 */
	_setStatement (statement) {
		this._statement = statement;
	}

	/**
	 * _setCycle - This simple method is used to set what cycle the action is
	 * currently performing. This is useful to know on those actions that may
	 * use the apply or revert methods on any situation but that have slight
	 * differences on the logic.
	 *
	 * @param  {string} cycle - 'Application' if the action is running the application
	 * cycle or 'Revert' if it's running the revert cycle.
	 */
	_setCycle (cycle) {
		this._cycle = cycle;
	}

	/**
	 * setExtras - Some times, actions may require extra context to know what they're
	 * supposed to do. The extras object should hold any additional information
	 * we want to pass down to the action.
	 *
	 * @param {Object} extras
	 */
	setExtras (extras) {
		this._extras = extras;
	}

	/**
	 * willApply - Method called before the application of an action
	 *
	 * @return {Promise} - Result of the willApply operation, if this function
	 * returns a rejected promise, the cycle will be interrupted and the action
	 * will not be applied.
	 */
	willApply () {
		return Promise.resolve ();
	}

	/**
	 * apply - Method for the actual application of an action, this is where
	 * the core operations of an action must be done.
	 *
	 * @return {Promise} - Result of the application operation
	 */
	apply () {
		return Promise.resolve ();
	}

	/**
	 * didApply - If the cycle has reached this far, it means the action has
	 * correctly gone through the willApply and apply functions. Now that it has
	 * been applied, we can perform any cleanup operations.
	 *
	 * @return {Promise<boolean>} - Result of the didApply operation. When resolved,
	 * it should resolve to a boolean value, true if the game should go to the
	 * next statement right away, false if it should wait for user's interaction.
	 */
	didApply () {
		return Promise.resolve ({
			advance: false
		});
	}

	/**
	 * interrupt - Currently saved for future purposes, the interrupt function
	 * would be used to interrupt a function when its still doing something, like
	 * when the typing animation of dialogs is interrupted if you click again.
	 *
	 * @return {Promsie} - Result of the interruption
	 */
	interrupt () {
		return Promise.resolve ();
	}

	/**
	 * willRevert - Method called before an action is reverted
	 *
	 * @return {Promise} - Result of the willRevert operation, if this function
	 * returns a rejected promise, the cycle will be interrupted and the action
	 * will not be reverted.
	 */
	willRevert () {
		return Promise.resolve ();
	}

	/**
	 * revert - Method called for the actual reversion of an action, this is where
	 * the core operations needed to revert an action must be done.
	 *
	 * @return {Promise} - Result of the reversion operation
	 */
	revert () {
		return Promise.resolve ();
	}

	/**
	 * didApply - If the cycle has reached this far, it means the action has
	 * correctly gone through the willRevert and revert functions. Now that it has
	 * been reverted, we can perform any cleanup operations.
	 *
	 * @returns {Promise} - Result of the didRevert operation. When resolved,
	 * it should resolve to a boolean value, true if the game should go to the
	 * previous statement right away, false if it should wait for user's interaction.
	 */
	didRevert () {
		return Promise.resolve ({
			advance: false,
			step: true
		});
	}
}

export { Action };