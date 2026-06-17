---
title: Functions
order: 33
description: Run JavaScript functions in your script
---


# Functions

## Description

Even though you can put more JavaScript code in the `main.js` file and do a lot of things there, sometimes we want to do something in some part of our game. This is why you can also put some JavaScript inside your game's script.

**Action ID**: `Function`

**Reversible**: Yes

**Requires User Interaction**: No

## Reversible Functions

So far, we've been using normal JavaScript functions to achieve more functionality but one problem was that this functions were not reversible, meaning that the players were not able to go back over a function.

Let's see what we mean by that, let's say you are building some kind of RPG elements in your game and thus your player has stats. Normally, those stats would be declared inside your storage variable like this:

```javascript
'use strict';
// Persistent Storage Variable

monogatari.storage ({
    player: {
        intelligence: 0,
        ability: 0,
        strength: 0
    }
});
```

Now, inside your script you would probably make some modifications of those stats depending on what the user does or how the story goes.

```javascript
monogatari.script({
    // The game starts here.
    'Start': [
        'h Currently you have {{player.intelligence}} points of Intelligence but you seem far more intelligent, how about we add five points?',
        function () {
            this.storage ('player', { 
                intelligence: this.storage ('player').intelligence + 5
            });
            return true;
        },
        'h There you have it, you now have {{player.intelligence}} points of Intelligence',
        'end'
    ]
});
```

So, if we played this game, the first text would appear, then after we click for the next one, the function would be run adding 5 points to our intelligence stat and immediately would show the next text. If we wanted to go back to the first text it wouldn't be possible. This is mainly due to Monogatari not knowing what you are doing exactly in your function, if it were to allow you to go back, we could be getting infinite points just by going back and playing it again because there is no way to know what changed.

To solve this problem and allow users to go back, Monoagatari v1.4 introduced reversible 'Function' objects, as with all the special script objects, these are defined in a JSON format, let's take a look at how the same situation as above would look like:

```javascript
monogatari.script({
    // The game starts here.
    'Start': [
        'h Currently you have {{player.intelligence}} points of Intelligence but you seem far more intelligent, how about we add five points?',
        {'Function':{
            'Apply': function () {
                this.storage ('player', { 
                    intelligence: this.storage ('player').intelligence + 5
                });
                return true;
            },

            'Revert': function () {
                this.storage ('player', { 
                    intelligence: this.storage ('player').intelligence - 5
                });
            }   
        }},
        'h There you have it, you now have {{player.intelligence}} points of Intelligence',
        'end'
    ]
});
```

As you can see, we replaced the function with a `'Function'` object which has 2 properties, an `'Apply'` function which will run when going over the game and the `'Revert'` function which will be run when going back. This now solves the previous problem we had since we are using `'Apply'` to add the 5 points and `'Revert'` to subtract them in case the player went back and thus makes possible for players to go back even when a function was run. Just as with common functions, you can use Promises and also control the flow of the game by returning `true` or `false` in the `'Apply'` function.

> [!NOTE]
> For backwards compatibility, `'Reverse'` is still supported as an alias for `'Revert'`, but using `'Revert'` is recommended for consistency with other Monogatari actions.

## Normal Functions

> [!WARNING]
> Using normal JavaScript functions is not recommended because they can't be reverted and thus, players can't roll back their game on parts where functions are present which gives the impression that it's an error on the game rather than it being planned.

To do it, you can actually using JavaScript functions. Yes, just like you would on any other JS file, you can use function syntax inside your script.

To control the flow of your game, you can make the function return either true \(Will immediately execute the next statement.\) or false \(Will wait until the user clicks again.\) if it does not return one of those two, it will wait by default.

Example:

```javascript
'Hi there!',
function () {
    alert('This is pretty useful!');
    return true; // Will make the engine execute the next statement when the function finishes.
},
'Isn’t it?'
```

While that may be ok for a few functions, as you can see after a while your code starts to become more complicated, a way to simplify things is declaring the functions before your script and then just using the name to call it in the script like this:

```javascript
function sendAlert () {
    alert('This is pretty useful!');
    return true;
}

Monogatari.script ({
    // The game starts here.
    'Start': [
        'Hello, after this the function will be run.',
        sendAlert, // You can use just the name of the function!
        'Well, that looks a lot better!'
    ]
});
```

Using that technique will make your game a lot more easy to debug and update!

## Async Functions

While the advanced way adds a lot of more possibilities to your game, it still doesn't solve the fact that you may need to realize some async tasks such as a request or other activities. Since v1.3.2, using [JavaScript Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) is possible.

```javascript
function asyncFunction () {
    return new Promise ((resolve, reject) => {
            // All your code should be here
            setTimeout (function (){
                // You need to resolve the promise once your task is done
                resolve ('Success!'); 
            }, 2150);
        }).then ((successMessage) => {
            alert (successMessage);
            return true;
        });
}

Monogatari.script ({
    // The game starts here.
    'Start': [
        'Hello, after this the function will be run.',
        asyncFunction,
        'Well, that looks a lot better!'
    ]
});
```

Just as with the common functions, if you return a true value from your promise, the next statement will be executed as soon as it's done and will wait if you return anything else. The game will also block on the meantime so the player won't be able to continue until the Promise is resolved.
