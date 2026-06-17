---
title: Built-in Properties
order: 17
---

# Built-in Properties

Every component has built-in properties that are used for its functionality and configuration.

## Static Properties

These properties are defined on the component class itself.

### tag

The HTML tag name for the component. **Required**.

```javascript
class MyComponent extends Monogatari.Component {
    // ...
}
MyComponent.tag = 'my-component';
```

This defines how the component is used in HTML:

```html
<my-component></my-component>
```

### _configuration

Configuration object for the component. Each component should declare its own to avoid sharing state:

```javascript
class MyComponent extends Monogatari.Component {
    static _configuration = {
        defaultValue: 'something',
        options: {}
    };
}
```

### _experimental

Marks the component as experimental (not stable for production):

```javascript
class MyComponent extends Monogatari.Component {
    static _experimental = true;
}
```

### _priority

Determines the order in which components are initialized:

```javascript
class MyComponent extends Monogatari.Component {
    static _priority = 10; // Higher priority = initialized first
}
```

### engine

Reference to the Monogatari engine (set automatically on registration):

```javascript
static async setup() {
    // Access engine through static property
    this.engine.state({ myValue: true });
}
```

## Instance Properties

These properties are available on each component instance.

### props

Component properties passed from outside:

```javascript
// Set props
myComponent.setProps({ title: 'Hello', visible: true });

// Access props
console.log(this.props.title); // 'Hello'
```

### state

Internal component state:

```javascript
// Set state
this.setState({ count: 0 });

// Access state
console.log(this.state.count); // 0
```

### engine

Instance-level reference to the Monogatari engine:

```javascript
render() {
    const label = this.engine.state('label');
    return `<div>Current label: ${label}</div>`;
}
```

### _parent

Reference to the parent component (if any):

```javascript
// Set parent
this.parent(parentComponent);

// Get parent
const parent = this.parent();
```

## Props vs State

| Feature | Props | State |
| :--- | :--- | :--- |
| Source | External (from parent or engine) | Internal (component itself) |
| Mutability | Should not be changed by component | Can be changed by component |
| Update callback | `onPropsUpdate()` | `onStateUpdate()` |
| Usage | Configuration, data from outside | UI state, internal data |

### Example

```javascript
class Counter extends Monogatari.Component {
    constructor() {
        super();
        this.props = {
            initialValue: 0,   // Set from outside
            label: 'Count'
        };
        this.state = {
            count: 0           // Managed internally
        };
    }

    async connectedCallback() {
        await super.connectedCallback();
        // Initialize state from props
        this.setState({ count: this.props.initialValue });
    }

    increment() {
        this.setState({ count: this.state.count + 1 });
    }

    render() {
        return `
            <div>
                <span>${this.props.label}: ${this.state.count}</span>
                <button data-action="increment">+</button>
            </div>
        `;
    }
}
```

## Accessing Properties

### From Static Methods

```javascript
static async setup() {
    // Access configuration
    const config = this.configuration();
    
    // Access engine
    this.engine.state({ initialized: true });
}
```

### From Instance Methods

```javascript
render() {
    // Access props
    const title = this.props.title;
    
    // Access state
    const count = this.state.count;
    
    // Access engine
    const language = this.engine.preference('Language');
    
    return `<div>${title}: ${count} (${language})</div>`;
}
```

## Related

- [Life Cycle](life-cycle.md) - Component lifecycle methods
- [Built-in Functions](built-in-functions.md) - Component methods
- [Components Overview](README.md) - Creating components
