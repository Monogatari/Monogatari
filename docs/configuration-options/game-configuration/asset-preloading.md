---
title: Asset Preloading
order: 82
description: Configure asset preloading and caching for web deployment
---


# Asset Preloading

When releasing your game online, asset loading is one of the most important issues to solve. Monogatari's built-in preloading ensures players can enjoy your game even on slow connections.

## Settings Overview

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `Preload` | `boolean` | `true` | Enable/disable asset preloading |
| `ServiceWorkers` | `boolean` | `true` | Enable service worker caching |

## Built-In Preloading

The preloading screen shows a progress bar while assets are loaded before the game starts.

### Enable Preloading (Default)

```javascript
monogatari.settings({
    'Preload': true
});
```

With preloading enabled:
- A loading screen appears when entering the game
- Assets are loaded before gameplay begins
- Players experience smooth gameplay without loading delays

### The `default` Preload Block

For optimal performance, define a `default` preload block to specify exactly which assets should be preloaded at startup:

```javascript
monogatari.action('Preload').blocks({
    'default': {
        music: ['main_theme', 'menu_music'],
        scenes: ['title_screen', 'intro'],
        sounds: ['click', 'confirm'],
        characters: {
            'y': ['normal', 'happy']
        }
    }
});
```

**With a `default` block:**
- Only specified assets are preloaded (faster initial load)
- Audio is decoded to AudioBuffers (instant playback)
- Images are pre-decoded (no rendering delay)

**Without a `default` block (legacy behavior):**
- ALL registered assets are preloaded to browser cache
- Assets are fetched but not decoded until first use
- May have slight delay on first playback

See the [Preload action documentation](../../script-actions/preload.md#the-default-block) for details.

### Disable Preloading

```javascript
monogatari.settings({
    'Preload': false
});
```

> [!WARNING]
> Disabling preloading means assets load on-demand during gameplay. This may cause:
> - Stuttering when new assets are needed
> - Poor experience on slow connections
> - Delayed audio/visual appearance

### When Preloading is Skipped

Preloading is automatically skipped in:
- **Electron apps** - Assets are bundled locally
- **Cordova apps** - Assets are packaged with the app
- **file:// protocol** - Opening HTML directly without a server

## Service Workers Cache

Service Workers provide powerful caching for web-deployed games.

### How It Works

1. On first visit, assets are cached as they're loaded
2. On subsequent visits, cached assets load instantly
3. Updated assets are fetched in the background
4. Games can work offline once cached

This uses a "cache-then-update" strategy - players see cached content immediately while updates download silently.

### Enable Service Workers (Default)

```javascript
monogatari.settings({
    'ServiceWorkers': true
});
```

### Disable Service Workers

```javascript
monogatari.settings({
    'ServiceWorkers': false
});
```

### Service Worker Configuration

Configure your `service-worker.js` file:

```javascript
// The name of your game (no spaces or special characters)
const name = 'MyVisualNovel';

// Cache version - change to force re-caching all assets
const version = '0.1.0';
```

#### When to Change Version

- Major updates with many changed assets
- Critical bug fixes in assets
- Usually not needed - the cache strategy updates automatically

> [!NOTE]
> You don't need to change the version when adding or removing files. The cache strategy handles this automatically.

### Service Worker Requirements

Service Workers require:
- **HTTP or HTTPS** protocol (not `file://`)
- A web server (local or remote)

#### Local Development

If you open files directly (`file://` protocol), you'll see:

```
Service Workers are available only when serving your files through a server.
```

This is normal! Use a local server for development:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Once deployed to a web server, the warning disappears.

## Progressive Web App (PWA)

Service Workers are part of making your game a [Progressive Web App](https://en.wikipedia.org/wiki/Progressive_web_app), which provides:

- **Offline play** - Play without internet after first load
- **Install to device** - Add to home screen like a native app
- **Fast loading** - Cached assets load instantly
- **Reduced bandwidth** - Only downloads changed assets

See the [Web Deployment](../../releasing-your-game/web.md) documentation for full PWA setup.

## Preload Action

For fine-grained control over what and when to preload, use the [Preload action](../../script-actions/preload.md):

```javascript
monogatari.script({
    'Start': [
        // Preload assets for the next scene
        'preload scene forest',
        'preload music theme',
        
        'show scene bedroom',
        'y Let me tell you about the forest...',
        
        // Forest assets are now ready
        'show scene forest',
        'end'
    ]
});
```

## Best Practices

### For Small Games (< 50MB)

```javascript
monogatari.settings({
    'Preload': true,
    'ServiceWorkers': true
});
```

Let everything preload upfront for the smoothest experience.

### For Large Games (> 50MB)

```javascript
monogatari.settings({
    'Preload': true,
    'ServiceWorkers': true
});

// Define a minimal default block for essential assets
monogatari.action('Preload').blocks({
    'default': {
        music: ['main_theme'],
        scenes: ['title_screen']
    },
    // Load chapter-specific assets on-demand
    'chapter1': {
        scenes: ['school_gate', 'classroom'],
        music: ['chapter1_theme'],
        characters: {
            'y': ['happy', 'sad', 'normal']
        }
    },
    'chapter2': {
        scenes: ['rooftop', 'library'],
        music: ['chapter2_theme']
    }
});
```

Then in your script:

```javascript
monogatari.script({
    'Start': [
        'show scene title_screen',
        'Welcome to my game!',
        'jump Chapter1'
    ],
    'Chapter1': [
        'preload block chapter1 blocking',  // Load chapter assets
        'show scene school_gate',
        // ... chapter content
    ]
});
```

See the [Preload action documentation](../../script-actions/preload.md) for advanced preloading strategies.

## Related

- [Game Configuration](README.md) - All game settings
- [Preload Action](../../script-actions/preload.md) - Runtime preloading
- [Web Deployment](../../releasing-your-game/web.md) - Releasing your game online
