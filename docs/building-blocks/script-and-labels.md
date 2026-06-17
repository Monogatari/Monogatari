---
title: Script & Labels
order: 10
---

# Script & Labels

## Overview

The script is the soul and body of your game, it is the place where you define everything that happens on it. It is made out of labels that are just like the chapters of a book and inside of each label, you have a list of statements that will be run one by one as your story unfolds.

## Script

A monogatari script is nothing more than a [JSON object](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON). In simple terms, a JSON object is defined with two curly braces `{}`. Inside these curly braces, you can have a list of named properties that point to a value. For example, if we wanted to define a person using the JSON notation, we could do something like this:

```javascript
const person = {
    'name': 'Jane Doe',
    'age': 24
};
```

This is what we call key/value pairs, where a key like `name` or `age` points to a value like `Jane Doe` or `24`. Notice how each key/value pair has a comma in the end separating it from the next one. **Missing commas is the \#1 issue that people have on their scripts.**

In Monogatari's case, your script is a list of keys \(the names of the [labels](script-and-labels.md#labels) on your game\) and values \(the list of statements these labels are made of\). For example:

```javascript
{
    'Start': [
        'Hi there!',
        'This is a list of statements',
        'jump myLabel'
    ],
    'myLabel': [
        'And this is yet another label',
        'Also a list of statements',
        'end'
    ]
}
```

Now, while that object does defines a monogatari script, just by itself it doesn't do anything. **You must use the script function to let monogatari know what's your script**:

```javascript
monogatari.script ({
    'Start': [
        'Hi there!',
        'This is a list of statements',
        'jump myLabel'
    ],
    'myLabel': [
        'And this is yet another label',
        'Also a list of statements',
        'end'
    ]
});
```

By default, the `script.js` file contains the initial script for any monogatari game and you can build your game from there by adding more content and removing the old one.

## Labels

Let's take a look at an incredibly simple script, this is the most basic script a game could have:

```javascript
monogatari.script ({
    'Start': [
        'This is a statement.',
        'end'
    ]
});
```

Notice that `Start` string. By default, `Start` is the first label that Monogatari will play when a game starts. As you can see, this label is pointing to a list of statements that monogatari will run one by one.

In programming terms, a label is like a function or subroutine: a named list of statements you can run, and that you can jump to from anywhere in your game.

As we said before, labels are just like the chapters of a book, but they also give you a logical way to divide your game.

### Jumping between labels

As books can have many chapters, you can have many labels as well! Not only that, you can make your game move from one label to another using the [Jump action](../script-actions/jump.md).

```javascript
monogatari.script ({
    'Start':[
        'This is a statement.',
        'jump mylabel'
    ],
    'mylabel':[
        'This is another statement.',
        'Pretty easy huh?',
        'end'
    ]
});
```

As you can see from this script, we have two labels, `Start` and `mylabel.` Players will start in the `Start` one by default which will print out the first dialog and when the player clicks to advance, it will reach the `jump mylabel` statement. When reached, the game will simply carry on with the statements inside the `mylabel` label without the player ever noticing something happened.

## Translating your  Script

Making your game available in many languages is super simple, head over to the Internationalization guide to learn more.

## Splitting your script in multiple files

As your game script grows, having it all in the same file might become troublesome. Splitting your script into multiple files is a good way to get organized and make it less cluttered. Learn how to do this in the [Split Files](../configuration-options/split.md) section.

## Related

- [Dialogs](../script-actions/dialogs.md) - Writing dialog text
- [Jump](../script-actions/jump.md) - Navigating between labels
- [Variables & Data Storage](data-storage.md) - Storing game data
- [Internationalization](../configuration-options/game-configuration/internationalization.md) - Multi-language support
