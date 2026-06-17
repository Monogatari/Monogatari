---
title: Actions
order: 13
---

# Actions

## Overview

Actions are what defines what any given statement in a script should do. When Monogatari reads a part of the script (a statement), it looks for an action that matches the statement and runs it.

## Creating a Custom Action

The following code displays a simple example of an action that does something when applied (advancing through the game) and something else when reverted (rolling back through the game):

```javascript
class MyAction extends Monogatari.Action {

    // Unique identifier for this action
    static id = 'MyAction';

    // Match statements starting with 'myaction'
    static matchString([action]) {
        return action === 'myaction';
    }

    constructor([myaction, ...args]) {
        super();
        this.args = args;
    }

    apply() {
        // Do something when the action is executed
        console.log('Action applied with args:', this.args);
        return Promise.resolve();
    }

    didApply() {
        // Return whether to advance automatically
        return Promise.resolve({ advance: true });
    }

    revert() {
        // Undo the action when rolling back
        console.log('Action reverted');
        return Promise.resolve();
    }

    didRevert() {
        return Promise.resolve({ advance: true, step: true });
    }
}
```

This action will match statements like:

```javascript
'myaction'
'myaction something'
'myaction one two three'
```

## Registering an Action

Once you have your action class, register it with Monogatari:

```javascript
monogatari.registerAction(MyAction);
```

## Static Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the action (required) |
| `_experimental` | `boolean` | Marks the action as experimental (default: `false`) |
| `_configuration` | `object` | Action-specific configuration storage |
| `loadingOrder` | `number` | Order for loading actions (default: `0`). Higher values load first. |
| `engine` | `Monogatari` | Reference to the Monogatari engine (set automatically) |

## Instance Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `_statement` | `string\|object` | The original statement that matched this action |
| `_cycle` | `string` | Current cycle: `'Application'` or `'Revert'` |
| `_extras` | `object` | Additional context passed to the action |
| `engine` | `Monogatari` | Reference to the Monogatari engine |

## Matching Methods

Actions must implement at least one matching method to identify which statements they handle.

### matchString

For string-based statements (most common):

```javascript
static matchString([keyword, ...args]) {
    return keyword === 'myaction';
}
```

The statement is passed as an array of words split by spaces.

### matchObject

For object-based statements (JSON):

```javascript
static matchObject(statement) {
    return typeof statement.MyAction !== 'undefined';
}
```

## Configuration

Actions can store and retrieve configuration:

```javascript
// Set configuration
MyAction.configuration({
    defaultValue: 'something',
    options: { enabled: true }
});

// Get all configuration
const config = MyAction.configuration();

// Get specific property
const value = MyAction.configuration('defaultValue');
```

## Complete Example

Here's a more complete example of a custom action:

```javascript
class NotifyAction extends Monogatari.Action {

    static id = 'Notify';

    static _configuration = {
        duration: 3000
    };

    // Setup runs once when the engine initializes
    static async setup() {
        // Initialize any state or history needed
        this.engine.history('notifications');
    }

    static matchString([action]) {
        return action === 'notify';
    }

    constructor([notify, ...message]) {
        super();
        this.message = message.join(' ');
    }

    async apply() {
        // Show notification
        const duration = NotifyAction.configuration('duration');
        
        // Create and show notification element
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.textContent = this.message;
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => notification.remove(), duration);
    }

    async didApply() {
        // Save to history for rollback support
        this.engine.history('notifications').push(this.message);
        return { advance: true };
    }

    async revert() {
        // Remove from history
        this.engine.history('notifications').pop();
    }

    async didRevert() {
        return { advance: true, step: true };
    }
}

// Register the action
monogatari.registerAction(NotifyAction);
```

Usage in script:

```javascript
monogatari.script({
    'Start': [
        'notify Welcome to the game!',
        'notify This message will appear as a notification.',
        // ... rest of script
    ]
});
```

## Related

- [Life Cycle](life-cycle.md) - Detailed explanation of action lifecycle methods
- [Components](../components/) - Creating custom UI components
