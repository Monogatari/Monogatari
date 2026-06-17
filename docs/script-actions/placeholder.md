---
title: Placeholder
order: 37
---

# Placeholder

## Description

```javascript
'$ <placeholder_name>'
```

A placeholder allows you to save some action to use within your game by placing a placeholder on your script wherever you want to call it. This is particularly useful when you have an action that is repeated multiple times in your game or when loading your script from an external source.

**Action ID**: `Placeholder`

**Reversible**: Depends on the action provided

**Requires User Interaction**: Depends on the action provided

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `placeholder_name` | `string` | The name with which you saved the action you want to call. |

## Action Declarations

To declare an action placeholder, you need to provide a name for it and a value. The value can be any valid monogatari action.

```javascript
monogatari.$ ('menu', {"Choice":{
    "Text":    "Let's see, what do you want to know about?",
    "Animations":{
        "Text": "Animations",
        "Do": "jump Animations"
    },
    "Media":{
        "Text": "Multimedia",
        "Do": "jump Media"
    },
    "Scripting":{
        "Text": "Scripting",
        "Do": "jump Script"
    },
    "Playing":{
        "Text": "Playing",
        "Do": "jump Playing"
    },
    "Nothing": {
        "Text": "Nothing",
        "Do": "jump Nothing",
        "Condition": function () {
            return storage.playing && storage.media && storage.scripting && storage.animations;
        }
    }
}});
```

## Examples

### Using a Choice in multiple places

The following will declare the placeholder shown above, featuring a choice action. The recommended place to declare all your placeholders is your main.js file.

```javascript
monogatari.$ ('menu', {"Choice":{
    "Text":    "Let's see, what do you want to know about?",
    "Animations":{
        "Text": "Animations",
        "Do": "jump Animations"
    },
    "Media":{
        "Text": "Multimedia",
        "Do": "jump Media"
    },
    "Scripting":{
        "Text": "Scripting",
        "Do": "jump Script"
    },
    "Playing":{
        "Text": "Playing",
        "Do": "jump Playing"
    },
    "Nothing": {
        "Text": "Nothing",
        "Do": "jump Nothing",
        "Condition": function () {
            return monogatari.storage ('someFlag');
        }
    }
}});
```

And then, whenever you want to use that in your script, you just need to place the following statement, saving a lot of space and making it easier to have the same choice in multiple places:

```javascript
'$ menu'
```

### Dynamic Action Generation

Another great way of using placeholders is generating actions dynamically. To make this happen, be sure that the name you use for your placeholders starts with `_`

The value for your placeholder should be a function that can return any action. Your function will be evaluated before executing it to retrieve the action to run.

> [!WARNING]
> **Beware, this is only recommended for advanced users.** When using dynamic action generation, you will be responsible on providing the way to rollback what you did, this means you'll need to save up your own markers in order to know what action you executed before.

```javascript
monogatari.$ ('_dialog', function () {
    // Within this function, `this` refers to the Monogatari object.

    if (this.storage ().someFlag) {
        return 'y This means the flag was true!';
    } else {
        return 'y This means the flag was false!';
    }
});
```

### Passing Arguments into Placeholders

Arguments can be used in Placeholders like so:

```javascript
monogatari.$ ('_myAction', (arg1, arg2) => {
    return `${arg1} ${arg2}`;
});
```

Which would be called like this:

```javascript
'$ _myAction something something'
```

Placeholders can also have argument passed into them for dynamic functions. The following is an example of a placeholder action that yields a returnable function object block that adds a string argument to an array.

```javascript
monogatari.$ ('_addToInventory', (myArgument) => ({'Function':{
    'Apply': function(){
        monogatari.storage().inventory.unshift(myArgument);
    },
    'Revert':function(){
        monogatari.storage().inventory.shift();
    }
}}));
```

We'll declare our `inventory` as an array in `storage.js`

```javascript
monogatari.storage ({
    inventory: ["Sword"],
});
```

And then in our script, we'd call the placeholder like this!

```javascript
monogatari.script ({
    'Start': [
        "That's a cool potion. Let's pick it up and put it into our inventory.",
        "$ _addToInventory Potion",
        "Now I am holding a {{inventory.0}}",
    ]
});
```

Please note that placeholder arguments are delimited by spaces, so if you want to use spaces in the passed argument strings, you'll need to get a little creative. There are plenty of ways around this. One easy way is to use `&nbsp;` instead of spaces.

```javascript
monogatari.script ({
    'Start': [
        "That's a cool potion. Let's pick it up and put it into our inventory.",
        "$ _addToInventory Potion&nbsp;of&nbsp;Strength.",
        "Now I am holding a {{inventory.0}}",
    ]
});
```

Another way to do this would be to capture all arguments and concatenate them into one string, then process that string. Up to you how you want to work with this feature!

## Related Actions

- [Functions](javascript.md) - Run JavaScript functions in your script
- [Choices](choices.md) - Present options to players
