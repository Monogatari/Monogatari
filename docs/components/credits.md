---
title: Credits Screen
order: 60
description: The credits page so players can see who made the game
---


# Credits Screen

## Description

```markup
<credits-screen></credits-screen>
```

Attribution is important. People like knowing who made the games they love, and collaborators deserve credit for their work.

```javascript
monogatari.configuration ('credits', {
    "Developers": {
        "Artist": "Yui",
        "Scenario Writer": "Gale",
    },
    "Donors": {
        "Top Level Donors": [
            "Tommy", "Scotty", "Lanny", "Robby", "Josie", "Freddy", "Bobby", "Lindsey"
        ],
        "Patrons": [
            "Alex", "Shine", "Mika"
        ],
    },
    "Special Thanks to": {
        "My parents": ["Mom", "Dad"], 
        "My siblings": ["Brother", "Sister"],
    }

});
```

This will create a credits page that looks like this!

![A credits page listing all of the people written in the example code above.](../assets/image-17.png)

As you can see, Credits are stored as an object, just like most things in Monogatari. Also, like most things in Monogatari, the Credits page supports HTML, so if you want to make each of those names a clickable link that leads to the person's website, or email address, or something like that, you can easily achieve all of these things by inserting hyperlinks, like:

```javascript
monogatari.configuration ('credits', {
    Developers: {
        Coder: "<a href="https://monogatari.io">Hyuchia</a>",
    }
});
```

If the credits object in your script.js file is empty, the credits button will not appear. No need to worry the User with an empty credits page, but as soon as you fill the credits object with something, the button will appear on the main menu title screen!

![The default Monogatari main menu with a visible credits button.](../assets/image-14.png)
