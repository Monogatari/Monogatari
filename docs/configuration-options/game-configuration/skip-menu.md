---
title: Skip Main Menu
order: 85
description: Skip the main menu and start directly into the game
---


# Skip Main Menu

You may want the game to start immediately without showing the main menu.

## Configuration

To skip the main menu, change the `ShowMainScreen` setting in your `options.js`:

```javascript
monogatari.settings({
    'ShowMainScreen': false
});
```

### Default Behavior

By default, `ShowMainScreen` is set to `true`, which displays the main menu:

```javascript
monogatari.settings({
    'ShowMainScreen': true
});
```

## Use Cases

### Instant Start Games

For games that should begin immediately:

```javascript
monogatari.settings({
    'ShowMainScreen': false,
    'Label': 'Intro'  // Start at a specific label
});
```

### Demo/Preview Mode

Skip the menu for demo versions:

```javascript
monogatari.settings({
    'ShowMainScreen': false,
    'Label': 'DemoStart'
});
```

## Important Notes

> [!NOTE]
> When `ShowMainScreen` is `false`:
> - The game starts at the label specified by the `Label` setting (default: `'Start'`)
> - Players can still access the main menu by ending the game or through the quick menu
> - Save/Load functionality remains available through the quick menu

## Splash Screen Alternative

If you want something to show before the game but not the full main menu, consider using a splash screen label:

```javascript
monogatari.settings({
    'ShowMainScreen': false,
    'SplashScreenLabel': '_SplashScreen'
});

monogatari.script({
    '_SplashScreen': [
        'show scene company_logo with fadeIn',
        'wait 3000',
        'show scene black with fadeOut',
        'jump Start'
    ],
    'Start': [
        // Your game begins here
    ]
});
```

## Related

- [Game Configuration](README.md) - All game settings
- [Saving](saving.md) - Save and load configuration
