---
title: Built-in Functions
order: 18
---

# Built-in Functions

Components come with a series of built-in functions that make it easier to interact with them.

## Static Methods

These methods are called on the component class itself.

### configuration

Get or set component configuration:

```javascript
// Set configuration
MyComponent.configuration({
    defaultValue: 'something',
    options: { enabled: true }
});

// Get all configuration
const config = MyComponent.configuration();

// Get specific property
const value = MyComponent.configuration('defaultValue');
```

### template

Modify the HTML structure of a component without extending the class:

```javascript
// Get current template
const currentTemplate = monogatari.component('main-screen').template();

// Set new template
monogatari.component('main-screen').template(() => {
    return `
        <h1>My Awesome Game</h1>
        <main-menu></main-menu>
    `;
});
```

### all

Get all instances of the component as an Artemis DOM object:

```javascript
// Get all text-box elements
const textBoxes = TextBox.all();

// Hide all instances
textBoxes.hide();
```

### get

Get a specific instance by ID:

```javascript
// Get instance with data-instance="main"
const mainInstance = MyComponent.get('main');
```

### instances

Iterate over all component instances:

```javascript
// With callback - iterate each instance
MyComponent.instances((instance) => {
    instance.reset();
});

// Without callback - returns Artemis DOM object
const allInstances = MyComponent.instances();
```

## Instance Methods

These methods are available on each component instance.

### setProps / setState

Update component properties or state:

```javascript
// Set props (triggers onPropsUpdate)
this.setProps({ title: 'New Title' });

// Set state (triggers onStateUpdate)
this.setState({ count: 5 });
```

### forceRender

Force the component to re-render:

```javascript
async updateContent() {
    this.state.content = 'New content';
    await this.forceRender();
}
```

### element

Get the component as an Artemis DOM instance:

```javascript
// Get element for DOM operations
const el = this.element();
el.addClass('active');
el.style('opacity', '0.5');
```

### content

Find a content element inside the component:

```javascript
// In component render:
render() {
    return `
        <div data-content="header">Header</div>
        <div data-content="body">Body</div>
    `;
}

// Access content areas:
const header = this.content('header');
header.html('New Header');
```

### remove

Remove the component from the DOM:

```javascript
// Remove this component instance
this.remove();
```

### instance

Find another instance of the same component type by ID:

```javascript
// Find instance with specific ID
const otherInstance = this.instance('secondary');
```

### parent

Get or set the parent component:

```javascript
// Set parent
this.parent(parentComponent);

// Get parent
const parent = this.parent();
if (parent) {
    parent.notifyChild(this);
}
```

## Rendering Methods

### render

Define the component's HTML structure. **Must be implemented**:

```javascript
render() {
    return `
        <div class="container">
            <h1>${this.props.title}</h1>
            <p>${this.state.description}</p>
            <slot></slot>
        </div>
    `;
}
```

### Using Slots

Content placed inside component tags in HTML is rendered in `<slot>`:

```html
<!-- In index.html -->
<my-component>
    <p>This goes in the slot</p>
</my-component>
```

```javascript
// In component
render() {
    return `
        <div class="wrapper">
            <slot></slot>  <!-- <p>This goes in the slot</p> appears here -->
        </div>
    `;
}
```

## Engine Interaction

### Running Script Actions

```javascript
// Run a script action programmatically
this.engine.run('show character e happy');

// Run multiple actions
this.engine.run([
    'show scene forest',
    'play music theme'
]);
```

### Accessing Game State

```javascript
// Get state
const label = this.engine.state('label');
const step = this.engine.state('step');

// Set state
this.engine.state({ customValue: true });

// Get history
const dialogHistory = this.engine.history('dialog');

// Get preferences
const language = this.engine.preference('Language');

// Get settings
const textSpeed = this.engine.setting('TextSpeed');
```

### Finding Elements

```javascript
// Find elements in the game
const gameScreen = this.engine.element().find('[data-screen="game"]');

// Find specific component
const textBox = this.engine.element().find('text-box');
```

## DOM Operations

Components use Artemis for DOM manipulation:

```javascript
// Using element()
this.element().addClass('active');
this.element().removeClass('hidden');
this.element().toggleClass('visible');

// Finding children
this.element().find('.child-element').html('New content');

// Attributes
this.element().attribute('data-value', '123');
const value = this.element().attribute('data-value');

// Styles
this.element().style('opacity', '0.5');
this.element().style({ opacity: '0.5', transform: 'scale(1.1)' });

// Events
this.element().on('click', (e) => this.handleClick(e));

// Visibility
this.element().show();
this.element().hide();
const isVisible = this.element().isVisible();
```

## Complete Example

```javascript
class NotificationBar extends Monogatari.Component {
    
    static _configuration = {
        duration: 3000,
        position: 'top'
    };

    constructor() {
        super();
        this.props = {
            message: ''
        };
        this.state = {
            visible: false,
            queue: []
        };
    }

    static async setup() {
        // Add component to game screen
        this.engine.element().find('game-screen').append(
            '<notification-bar></notification-bar>'
        );
    }

    static async bind() {
        // Listen for custom events
        document.addEventListener('notify', (e) => {
            NotificationBar.instances((instance) => {
                instance.show(e.detail.message);
            });
        });
    }

    async show(message) {
        this.state.queue.push(message);
        if (!this.state.visible) {
            await this.displayNext();
        }
    }

    async displayNext() {
        if (this.state.queue.length === 0) {
            this.setState({ visible: false });
            return;
        }

        const message = this.state.queue.shift();
        this.setProps({ message });
        this.setState({ visible: true });

        const duration = NotificationBar.configuration('duration');
        setTimeout(() => this.displayNext(), duration);
    }

    render() {
        const position = NotificationBar.configuration('position');
        const visibleClass = this.state.visible ? 'visible' : '';
        
        return `
            <div class="notification ${position} ${visibleClass}">
                ${this.props.message}
            </div>
        `;
    }
}

NotificationBar.tag = 'notification-bar';

// Register the component
monogatari.registerComponent(NotificationBar);
```

## Related

- [Life Cycle](life-cycle.md) - Component lifecycle methods
- [Built-in Properties](built-in-properties.md) - Component properties
- [Components Overview](README.md) - Creating components
