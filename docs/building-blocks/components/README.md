---
title: Components
order: 15
---

# Components

## Overview

A component is a custom, self-contained HTML element. It is defined as a JavaScript class and in that class, it contains all of its functionality and the HTML code that defines it. This enables you to

The following code displays the most simple component you can create where it just renders some HTML you tell it to:

```javascript
class MyCustomElement extends Monogatari.Component {
    render () {
     return `<h1>This is my component</h1>`;   
    }
}

MyCustomElement.tag = 'my-custom-element';
```

Now that we have our component class, we need to register it in Monogatari so it knows it exists:

```javascript
monogatari.registerComponent (MyCustomElement);
```

And finally, just place it in our `index.html` with the tag we defined for it:

```markup
<my-custom-element></my-custom-element>
```

When monogatari gets initialized, our component will be registered and its render method will be executed, making its final HTML be:

```markup
<my-custom-element class="animated" data-component="my-custom-element">
    <h1>This is my component</h1>
</my-custom-element>
```

## The move  to components

The `index.html` file changed significantly from Monogatari v1 to v2. Here's a comparison of what the HTML looks now and how it looked before:

### New HTML (v2)

```html
<div id="monogatari">
    <visual-novel>
        <language-selection-screen></language-selection-screen>
        <loading-screen></loading-screen>
        <main-screen>
            <main-menu></main-menu>
        </main-screen>
        <game-screen>
            <dialog-log></dialog-log>
            <text-box></text-box>
            <quick-menu></quick-menu>
        </game-screen>
        <gallery-screen></gallery-screen>
        <credits-screen></credits-screen>
        <load-screen></load-screen>
        <save-screen></save-screen>
        <settings-screen></settings-screen>
        <help-screen></help-screen>
    </visual-novel>
</div>
```

### Old HTML (v1)
```markup
<!-- Notice messages -->
<div data-notice="exit" class="modal">
    <div class="row spaced">
        <p data-string="Confirm" class="col xs12 m12 l12 xl12">Do you want to quit</p>
        <div class="col xs12 m12 l12 xl12">
            <button data-action="quit" data-string="Quit">Quit</button>
            <button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
        </div>
    </div>
</div>

<div data-notice="slot-deletion" class="modal">
    <div class="row spaced">
        <p data-string="SlotDeletion" class="col xs12 m12 l12 xl12">Are you sure you want to delete this slot?</p>
        <p class="col xs12 m12 l12 xl12"><small></small></p>
        <div class="col xs12 m12 l12 xl12">
            <button data-action="delete-slot" data-string="Delete">Delete</button>
            <button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
        </div>
    </div>
</div>

<div data-notice="slot-overwrite" class="modal">
    <div class="row spaced">
        <p data-string="SlotOverwrite" class="col xs12 m12 l12 xl12">Are you sure you want to overwrite this slot?</p>
        <input type="text" name="name" class="margin-1 col xs12 m12 l12 xl12" required>
        <div class="col xs12 m12 l12 xl12">
            <button data-action="overwrite-slot" data-string="Delete">Overwrite</button>
            <button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
        </div>
    </div>
</div>

<!--Game Screen -->
<section id="game" class="unselectable">
    <div id="particles-js" data-ui="particles"></div>
    <div id="background" data-ui="background"></div>
    <div>
        <audio type="audio/mpeg" data-component="music"></audio>
        <audio type="audio/mpeg" data-component="voice"></audio>
        <audio type="audio/mpeg" data-component="sound"></audio>
        <div class="video-wrapper align-center vertical middle" data-component="video" data-ui="video-player">
            <video type="video/mp4" data-ui="player" controls="true"></video>
            <button data-action="close-video" data-string="Close">Close</button>
        </div>

        <div data-component="modal" data-ui="messages" class="middle">
            <div data-ui="message-content"></div>
            <div class="horizontal align-center" data-ui="inner-menu">
                <button data-action="close" data-close="messages" data-string="Close">Close</button>
            </div>
        </div>
        <div data-component="modal" data-ui="input" class="middle">
            <p data-ui="input-message" class="block"></p>
            <input type="text">
            <small data-ui="warning" class="block"></small>
            <div>
                <button data-action="submit">Ok</button>
            </div>
        </div>
    </div>

    <div data-ui="choices" class="vertical align-center middle"></div>
    <div data-ui="text">
        <img data-ui="face" alt="">
        <span data-ui="who"></span>
        <p data-ui="say"></p>
    </div>
    <div data-ui="quick-menu" class="align-right">
        <span data-action="back"><span class="fa fa-arrow-left"></span> <span data-string="Back">Back</span></span>
        <span data-action="distraction-free"><span class="fa fa-eye" data-action="distraction-free"></span> <span data-string="Hide" data-action="distraction-free">Hide</span></span>
        <span data-action="auto-play"><span class="fa fa-play-circle" data-action="auto-play"></span> <span data-string="AutoPlay" data-action="auto-play">Auto</span></span>
        <span data-action="open-menu" data-open="save"><span class="fa fa-save" data-action="open-menu" data-open="save"></span> <span data-string="Save" data-action="open-menu" data-open="save">Save</span></span>
        <span data-action="open-menu" data-open="load"><span class="fa fa-undo" data-action="open-menu" data-open="load"></span> <span data-string="Load" data-action="open-menu" data-open="load">Load</span></span>
        <span data-action="open-menu" data-open="settings"><span class="fa fa-gear" data-action="open-menu" data-open="settings"></span> <span data-string="Settings" data-action="open-menu" data-open="settings">Settings</span></span>
        <span data-action="end"><span class="fa fa-times-circle-o" data-action="end"></span> <span data-string="Quit" data-action="end">Quit</span></span>
    </div>
</section>

<!-- Loading Screen -->
<section data-menu="loading" data-background="">
    <div class="middle">
        <h2 data-string="Loading">Loading</h2>
        <progress data-ui="load-progress" value="0" max="100"></progress>
        <small data-string="LoadingMessage">Wait while the assets are loaded.</small>
    </div>
</section>

<!-- Main Screen -->
<section data-menu="main" data-background="">
    <audio type="audio/mpeg" data-component="ambient"></audio>

    <div class="vertical align-right bottom animated bounceIn" data-ui="inner-menu">
        <button data-action="start" data-string="Start">Start</button>
        <button data-action="open-menu" data-open="load" data-string="Load">Load</button>
        <button data-action="open-menu" data-open="settings" data-string="Settings">Settings</button>
        <button data-action="open-menu" data-open="help" data-string="Help">Help</button>
    </div>
</section>

<!-- Save Screen -->
<section data-menu="save" data-background="">
    <button class="fa fa-arrow-left top left" data-action="back"></button>
    <div class="horizontal">
        <input type="text" placeholder="Save Slot Name" data-input="slotName" required>
        <button data-string="Save" data-action="save">Save</button>
    </div>
    <div data-ui="slots" class="row spaced align-center"></div>
</section>

<!-- Load Screen -->
<section data-menu="load" data-background="">
    <button class="fa fa-arrow-left top left" data-action="back"></button>
    <h2 data-string="Load">Load</h2>
    <div data-ui="saveSlots">
        <h3 data-string="LoadSlots">Saved Games</h3>
        <div data-ui="slots" class="row spaced align-center"></div>
    </div>
    <div data-ui="autoSaveSlots">
        <h3 data-string="LoadAutoSaveSlots">Auto Saved Games</h3>
        <div data-ui="slots" class="row spaced align-center"></div>
    </div>
</section>

<!-- Settings Screen -->
<section data-menu="settings" data-background="" class="align-center">
    <button class="fa fa-arrow-left top left" data-action="back"></button>
    <h2 data-string="Settings">Settings</h2>
    <div class="row spaced padded-1 align-center">
        <div class="col xs12 s12 m6 l6 xl6 r6">
            <div data-settings="audio" class="vertical align-center">
                <h3 data-string="Audio">Audio</h3>
                <span data-string="Music">Music Volume:</span>
                <input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="music">
                <span data-string="Sound">Sound Volume:</span>
                <input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="sound">
                <span data-string="Voice">Voice Volume:</span>
                <input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="voice">
            </div>
        </div>

        <div class="col xs12 s12 m6 l6 xl6 r6">

            <div data-settings="text-speed">
                <h3 data-string="TextSpeed">Text Speed</h3>
                <input type="range" min="1" max="50" step="1" data-action="set-text-speed">
            </div>

            <div data-settings="auto-play-speed">
                <h3 data-string="AutoPlaySpeed">Auto Play Speed</h3>
                <input type="range" min="0" max="60" step="1" data-action="set-auto-play-speed">
            </div>
            <div data-settings="language">
                <h3 data-string="Language">Language</h3>
                <div class="horizontal">
                    <select data-action="set-language">
                            <option value="English">English</option>
                            <option value="Español">Español</option>
                            <option value="Français">Français</option>
                            <option value="日本語">日本語</option>
                            <option value="Nederlands">Nederlands</option>
                        </select>
                    <span class="fa fa-unsorted" data-select="set-language"></span>
                </div>

            </div>

            <div data-settings="resolution" data-platform="electron">
                <h3 data-string="Resolution">Resolution</h3>
                <div class="horizontal">
                    <select data-action="set-resolution"></select>
                    <span class="fa fa-unsorted" data-select="set-resolution"></span>
                </div>
            </div>
        </div>
    </div>
</section>

<!--Help Screen -->
<section data-menu="help" data-background="">
    <button class="fa fa-arrow-left top left" data-action="back"></button>
    <h2 data-string="Help">Help</h2>
    <div class="align-left padded-1">
        <p data-string="AdvanceHelp">To advance through the game, click anywhere on the game screen or press the space key.</p>
        <h3 data-string="QuickButtons">Quick Menu Buttons</h3>
        <p><span class="fa fa-arrow-left"></span> <span data-string="BackButton">Back.</span></p>
        <p><span class="fa fa-eye"></span> <span data-string="HideButton">Hide Text.</span></p>
        <p><span class="fa fa-save"></span> <span data-string="SaveButon">Open the Save Screen.</span></p>
        <p><span class="fa fa-undo"></span> <span data-string="LoadButton">Open the Load Screen.</span></p>
        <p><span class="fa fa-gear"></span> <span data-string="SettingsButton">Open the Settings Screen.</span></p>
        <p><span class="fa fa-times-circle-o"></span> <span data-string="QuitButton">Quit Game.</span></p>
    </div>
</section>
```

That's a HUGE change right? Previously, all the HTML was right there in the `index.html` file and that was fine, it allowed people edit the HTML of their novel in a simple way and have a full understanding on where everything was. It also was helpful when styling because identifying all the elements and thus their selectors or even adding classes to them was a simple task.

### The problems it solved

So if it was so good, why did it got changed? Well, sure, it was good but only up to a certain point.

#### Engine Upgrades

The main issue with having all the HTML there and allowing people to change it as they pleased was that it actually made it harder for everyone whenever a new engine version was released.

New releases often change some of that HTML, either by adding elements, removing some, editing properties or element types etc. and if game developers had changed that HTML in their games, the only way to upgrade to the new engine version was to manually review the new code, compare it with what they had and perform all the required changes to cover up for the differences which many times was not an easy task.

For example, when a bunch of data properties get changed, developers would have to go element by element changing the data properties manually which was a horrible experience for game developers and this was only part of the problem. Often developers had to edit the engine's core in order to make the HTML they added work with monogatari, making the JavaScript code another area where they had to manually see what changed and re-adapt everything every time an update got released.

Now that components are self-contained, their HTML and styling can still be changed freely by the users but whenever an engine update gets released, upgrading to it is as super simple, just having to change the monogatari core files. Even when a component's code gets changed and requires developers to update their modifications to it, it only means they'll have to change those that they actually care about instead of having to review each one of them.

#### Code Sharing and Re-usability

Another important issue was that it was kind of hard to share code with others or even within different games from the same developers. Since it involved changing several files core to monogatari, the process was often complex and prone to errors.

With components being self-contained, you can share it using just two files: a JavaScript file with the component class and a CSS file with its styling which people can just use in their projects by importing those files and not having to do much else.

### The problems it created

This change has brought some confusion to people who expect all the HTML to be there for them to edit. It now results confusing where the code is coming from and how to update it which has caused monogatari not to be as beginner friendly as it used to be. However, I strongly believe these problems are the result of the lack of proper documentation. Components are in fact simple to use and work with, it just needs a mind shift and a proper explanation.

## Changing the contents of a component

You might want to change the HTML of a component, either to add some elements for your game or because you want to change the way it looks. Every component has a render function like the one we showed in the simple example above. This function defines the default structure of any component but there are several ways to modify it.

### Appending Elements

If all you want is to add some HTML element to the component, you can do so by adding your HTML in the `index.html` file as children of the component you want to edit. Let's retake our simple component example:

```javascript
class MyCustomElement extends Monogatari.Component {
    render () {
     return `<h1>This is my component</h1>`;   
    }
}

MyCustomElement.tag = 'my-custom-element';
```

We already know that we need to add it in our `index.html` by placing the tags for it but notice how our tags are left empty, there's nothing inside of them.

```markup
<my-custom-element></my-custom-element>
```

When it gets rendered, the component runs its render function and places the results inside of it:

```markup
<my-custom-element class="animated" data-component="my-custom-element">
    <h1>This is my component</h1>
</my-custom-element>
```

So now, let's say we wanted to add another element to it, a subtitle right below our `h1` element we already defined. We could of course simply update our render function to include the new element:

```javascript
render () {
    return `
        <h1>This is my component</h1>
        <h2>This is my subtitle</h2>
    `;   
}
```

However, this time we were able to modify the render function because we had created our own component. What if we want to append some content to a component we didn't create like the ones monogatari ships with by default?

Well, you can just place your contents in the `index.html` file. Instead of leaving the component tags empty, you can place any content you want there and it will get appended to the contents of your render function:

```markup
<my-custom-element>
    <h2>This is my subtitle</h2>
</my-custom-element>
```

### Changing the Template

Some times however, the changes we want to do are more complex than simply appending something to the HTML of an element. This is where the `template` method that all components have by default comes in.

If you wanted to change a component, for example the game-screen element monogatari ships with, these are the steps you'd need to follow:

#### 1. Identify the component's render method

To modify the structure of any component, we first need to know what it looks like by default. To do so, we need to dive into the code of the component we want to change, you'll find all component's in the [monogatari source code repository](https://github.com/Monogatari/Monogatari/tree/develop/src/components).

Inside the `index.js` file of every component, you'll find the class that defines it and most importantly, its render method. Let's take a look at the `game-screen` component it's render method looks something like this \(It may have changed since the writing of this documentation\):

```javascript
render () {
    return `
        <div data-content="visuals">
            <div id="tsparticles" data-ui="particles"></div>
            <div id="background" data-ui="background"></div>
        </div>
    `;
}
```

#### 2. Create your template method

Now that we know the contents of its render method, we can create our own template to add or modify the code as we need. In our `main.js`, we would get the component and then, use its template method, copying the contents it currently has on the `render` method:

```javascript
monogatari.component ('game-screen').template (() => {
    return `
        <div data-content="visuals">
            <div id="tsparticles" data-ui="particles"></div>
            <div id="background" data-ui="background"></div>
        </div>
    `;
});
```

#### 3. Modify the contents to fit your needs

Now that our template method is ready, we can use it to modify the component's structure by changing it any way we need to:

```javascript
monogatari.component ('game-screen').template (() => {
    return `
        <h1>My Title</h1>
        <div data-content="visuals">
            <div id="tsparticles" data-ui="particles"></div>
            <div id="background" data-ui="background"></div>
            <div id="someCustomElement"></div>
        </div>
    `;
});
```

This will cause the component to use the template method we provided for it instead of the render method to get its contents giving us the freedom to modify the structure in a way almost as simple as if we had created the component ourselves.

### Performing DOM Operations

A component in the end is just another HTML element, you can still perform operations over it using the DOM as you normally would. Let's try to replicate what we did to the game-screen component just using DOM operations.

#### Vanilla JavaScript

> [!WARNING]
> Due to current limitations in the Pandora library used for Monogatari's components, it is not recommended to interact with the `innerHTML` property of any component as it's prone to cause the duplication of the children inside such component. The approach shown here, while more verbose, avoids this situation.

```javascript
// Get the game-screen HTML element
const gameScreen = document.querySelector ('game-screen');

// Create the title element
const title = document.createElement ('h1');
title.innerText = 'My Title';

// Add our title
gameScreen.insertBefore (title, gameScreen.childNodes[0]);

// Get the visuals HTML element
const visuals = document.querySelector ('game-screen [data-content="visuals"]');

// Create the custom div element
const div = document.createElement ('div');
div.id = 'someCustomElement';

// Add our custom div to the visuals element
visuals.appendChild (div);
```

#### Using the Component built-in DOM Operations

```javascript
// Get the game-screen Artemis element
const gameScreen = document.querySelector ('game-screen').element ();

// Add our title
gameScreen.prepend ('<h1>My Title</h1>');

// Add our custom div to the visuals element
gameScreen.content ('visuals').append ('<div id="someCustomElement"></div>');
```

#### Using Artemis

The component built in operations from above actually use [Artemis](../../advanced-monogatari-development/core-libraries/README.md) internally, so they're equivalent to the following code:

```javascript
const { $_ } = Monogatari;

// Add our title
$_('game-screen').prepend ('<h1>My Title</h1>');

// Add our custom div to the visuals element
$_('game-screen [data-content="visuals"]').append ('<div id="someCustomElement"></div>');
```

## Related

- [Life Cycle](life-cycle.md) - Component lifecycle methods
- [Built-in Properties](built-in-properties.md) - Component properties
- [Built-in Functions](built-in-functions.md) - Component methods
- [Actions](../actions/) - Creating custom script actions
