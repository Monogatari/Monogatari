---
title: Variables & Data Storage
order: 12
---

# Variables & Data Storage

## Overview

Chances are you'll eventually want to save some information about the player. It may be a name, some stats, the amount of in-game currency the player has or any other sort of variable you use in your game and want to persist every time the player saves the game.

Monogatari has a built-in storage object where you can and should place all the variables you'll use and want to save. There's already a declaration made for you in the `storage.js` file. We recommend you keep your storage in that file since it's easier to keep track of all your variables and also means you only have to update that one when you add, remove or update any of them.

By default, the storage looks something like this:

```javascript
monogatari.storage ({
    player: {
        name: ''
    }
});
```

## Adding more variables

The storage is a simple JSON object, meaning we can add as much variables as we want. Let's say we wanted to save the player's age, an important flag for our game and also some stats. We can add some new properties to our storage:

```javascript
monogatari.storage ({
    player: {
        name: '',
        age: 0
    },
    myFlag: false,
    stats: {
    hp: 100,
    mp: 100,
    inventory: {
      gold: 1000,
      iron: 10
    }
  }
});
```

Notice that the values we provide in this initial declaration will be the default values for these variables.

## Updating a value

When something happens in our game and we want to update the value for one of our variables in our storage, we can use the same storage function to do so. Let's say we want to update the player's age:

```javascript
monogatari.storage ({
    player: {
        age: 18
    }
});
```

Calling the storage function and providing a new object will not replace the initial one. It will instead take the values we provide and update the storage for us. We can of course update multiple variables in a single call:

```javascript
monogatari.storage ({
    player: {
        age: 18
    },
    myFlag: true,
    stats: {
        hp: 80
    }
});
```

It is also possible to update a variable by doing a direct assignment:

```javascript
monogatari.storage ().player.age = 18;
```

## Retrieving a variable's value

Retrieving the value of a variable once again involves the storage function. Let's say we wanted to retrieve the player's name. All of the following options are valid ways to do so:

```javascript
// Providing the property we want to access
const { name } = monogatari.storage ('player');

const name = monogatari.storage ('player').name;

// Not providing any property
const { player: { name } } = monogatari.storage ();

const name = monogatari.storage ().player.name;
```

As you can see from that example, it is possible to send the storage function a string, in this case `player` and it will return us that specific variable which can save us some code. Because of this feature, retrieving a non-nested variable like the `myFlag` one can be done in these ways:

```javascript
// Providing the property we want to access
const flag = monogatari.storage ('myFlag');

// Not providing any property
const { myFlag } = monogatari.storage ();

const flag = monogatari.storage ().myFlag;
```

### The retrieve, transform and update pattern

Some times, we want to update a variable in a way that the new value is the result of performing an operation over the current value. For example, let's say we wanted to add or substract 20 hp points from the player's stats.

```javascript
// First, we have to retrieve the current value 
// for the hp variable
const { hp } = monogatari.storage ('stats');

// Now, we can either substract or add those 20 points.
const newHP = hp + 20;

// Finally, we can perform the update
monogatari.storage ({
    stats: {
        hp: newHP
    }
});
```

For simple transformations as this one, we can actually perform the transformation and update in a single step:

```javascript
// First, we have to retrieve the current value 
// for the hp variable
const { hp } = monogatari.storage ('stats');

// We add the 20 points and update the value
// in a single step
monogatari.storage ({
    stats: {
        hp: hp + 20
    }
});
```

## Data Interpolation

It is possible that we'll want to use the variables in the storage inside a dialog or even in a character's name. Monogatari features some custom string interpolation which you can use by writing a storage variable's key or name inside of two curly braces.

Let's say you wanted to use the player's name and age in a dialog. Here's what our statement would look like:

```javascript
'Hi {{player.name}}! I can see you\'re {{player.age}} years old.'
```

Notice how you're able to interpolate variables even if they're nested as the player variables are.

## Mixing it together

Monogatari has a lot of actions that will let you take advantage of the storage, from inputs and custom functions to dialogs and nice tricks with interpolations. Here's an example of a script using the storage on different actions.

```javascript
monogatari.script ({
    'Start': [
        {'Input': {
            'Text': 'What is your name?',
            'Validation': (input) => {
                return input.trim().length > 0;
            },
            'Save': (input) => {
                monogatari.storage ({
                    player: {
                        name: input,
                        age: 18
                    }
                });                                   
            },
            'Revert': () => {
                monogatari.storage ({
                    player: {
                        name: '',
                        age: 0
                    }
                });
            }
        }},
        'Your name is {{player.name}}',
        {'Function':{
            'Apply': () => {
                // We'll overwrite the player's name but save the old one in a new
                // value so that we can roll back and restore it if needed.
                const { name } = monogatari.storage ('player');
                const { hp, inventory: { gold } } = monogatari.storage ('stats');
                monogatari.storage ({
                    player: {
                        name: 'Georg',
                    },
                    oldName: name,
                    stats: {
                        hp: hp - 50,
                        inventory: {
                            gold: gold + 250
                        }
                    }
                });
            },
            'Revert': () => {
                // When rolling back, we'll restore the name to what it was before.
                const oldName = monogatari.storage ('oldName');
                const { hp, inventory: { gold } } = monogatari.storage ('stats');
                monogatari.storage ({
                    player: {
                        name: oldName,
                    },
                    stats: {
                        hp: hp + 50,
                        inventory: {
                            gold: gold - 250
                        }
                    }
                });
            }
        }},

        '{{player.name}} is {{player.age}} years old.',
        '{{stats.mp}} costs the ability "Fire Storm".',
        '{{stats.inventory.gold}}g is in his bag of gold.',
        'end'
    ]
});
```

## Where to go next

Storage is most useful alongside the actions that read and change it:

- [Conditionals](../script-actions/conditionals.md) — branch your story on stored values (affection points, flags, choices made).
- [Functions](../script-actions/javascript.md) — run JavaScript to compute and update storage.
- [Input](../script-actions/input.md) — save what the player types (like their name) straight into storage.
