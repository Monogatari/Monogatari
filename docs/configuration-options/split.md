---
title: Split Files
order: 88
description: Splitting your Script into multiple files.
---


# Split Files

As you work on your Monogatari game, you might find that your script.js file becomes very long and cumbersome to work with. This was an involved process in 1.4.1 but luckily, in Monogatari 2.0 it is now very easy to split your script into multiple files and for Monogatari to run all of them without issue.

### Formatting Your Second Script File

In Monogatari 2.0, your second script file can be formatted the same way your first script file is formatted. For example, the script section of your `script.js` file might read:

```javascript
monogatari.script ({
    // The game starts here.
    'Start': [
        "y Hello there Protaganist-senpai!",
        "y Wow after one line of dialog this is starting to feel pretty long.",
        "y Let's jump to another label in another file!",
        "jump theNextLabel",
    ]
});
```

And the script of your second script file can say:

```javascript
monogatari.script ({
    // The Game Continues!!
    'theNextLabel': [
        "y Yeah there we go! That feels so much better.",
        "end"
    ]
});
```

And this will work just fine! All you have to do after that is make sure your index.html file actually reads the file.

### Getting Monogatari to read your Split Files

All we need to do in order to achieve this is to edit our index.html file's source. Find this part of the source code:

```markup
        <!-- Monogatari JavaScript Libraries -->
        <script src="./engine/debug/debug.js"></script>
        <script src="./engine/core/monogatari.js"></script>
        <script src="./js/options.js"></script>
        <script src="./js/storage.js"></script>
        <script src="./js/script.js"></script>
        <script src="./js/main.js"></script>
```

And we're going to add another `<script src=""></script>`, with the source pointing to your file. For example, if you named your file `script2.js` and put it in the same folder with `script.js`, then we would change this to:

```markup
        <!-- Monogatari JavaScript Libraries -->
        <script src="./engine/debug/debug.js"></script>
        <script src="./engine/core/monogatari.js"></script>
        <script src="./js/options.js"></script>
        <script src="./js/storage.js"></script>
        <script src="./js/script.js"></script>

        <script src="./js/script2.js"></script>

        <script src="./js/main.js"></script>
```

Just like that!

Note that these files will load in order from top to bottom, so if you have any conflicting labels that are the same between them, whatever's in the later files will overwrite the ones above them. Also note that main.js should be the last file in the list.

## Internationalization with Split Files

Let's say you want to make your game multi-lingual, like in the [Internationalization](game-configuration/internationalization.md) article. Split files can help to keep you organized with that too! Let's take this example from that page:

```javascript
monogatari.script ({

    'English':{
        'Start':[
            'Hi, welcome to your first Visual Novel with Monogatari.'
        ]
    },
    'Español':{
        'Start':[
            'Hola, bienvenido a tu primer Novela Visual con Monogatari.'
        ]
    }
});
```

If you like, you could split this up into two files, like this:

**script.js:**

```javascript
monogatari.script ({

    'English':{
        'Start':[
            'Hi, welcome to your first Visual Novel with Monogatari.'
        ]
    }
});
```

**scriptES.js:**

```javascript
monogatari.script ({

    'Español':{
        'Start':[
            'Hola, bienvenido a tu primer Novela Visual con Monogatari.'
        ]
    }
});
```

Then just make sure your `index.html` file points to `scriptES.js` and you're on your way!

### Another Way, for Splitting Internationalized Files

After looking at the above two examples, you might want to split up files to help organize your story into chapters, and also have multiple languages at the same time! Unfortunately, if you did that by combining the above examples, you would more than likely come across a "Start Label Was Not Found" error.

This would happen because although the `monogatari.script()` method adds new labels, if any label names conflict with already existing ones, it replaces them. Normally this is fine, but when working with Multi-Language games, the "English" label would be replaced in the second file, overwriting all of the work you did at run time! Luckily, there's a way around this.

```javascript
monogatari.label('yourLabelName','English',[
    "Let's continue the story here without issue!",
]);
```

`monogatari.label()` looks at its arguments, first the name of the label you want to write to inside the monogatari.\_script object, and then if the next argument is a string, it processes that as a language. After that, it takes an array, and from there you just write the script to your game, the same way you do the script for a label, normally!

You can also use `monogatari.label()` for all of your labels. You have plenty of options!

## Related

- [Internationalization](game-configuration/internationalization.md) - Multi-language setup
- [Game Configuration](game-configuration/) - All game settings
