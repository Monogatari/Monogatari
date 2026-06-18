# Monogatari

[![Monogatari](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/b9jn8v/develop&style=flat-square&logo=cypress)](https://dashboard.cypress.io/projects/b9jn8v/runs)

Built to bring Visual Novels to the modern web and take them to the next level, making it easy for anyone to create and distribute Visual Novels in a simple way so that anyone can enjoy them pretty much anywhere, create games with features that no one has ever imagined... It is time for Visual Novels to evolve.

Website: https://monogatari.io/

Demo: https://demo.monogatari.io

Twitter: https://twitter.com/monogatari

GitHub Sponsors: https://github.com/sponsors/Hyuchia

Patreon: https://www.patreon.com/Hyuchia

Ko-fi: https://ko-fi.com/hyuchia

## Features
- Written in TypeScript, with full type definitions shipped for the engine, actions and components
- Simple, friendly script syntax — write your story almost as easily as writing it down
- Responsive and mobile-ready out of the box, and compatible with all major browsers
- Progressive Web App features, allowing installable, offline gameplay
- Full multimedia support — images, video, music, sound effects and voices
- Built-in multi-language and translation support
- Save and load, with optional save-slot screenshots
- Rollback, auto-play, text skipping and a dialog log out of the box
- Dialogue text effects
- Asset preloading and unloading for fine-grained memory control
- Ship to the web, or package for desktop (Electron / Electrobun) and mobile
- Extensible through actions, components and decorators — you just can't imagine how much!

## What do I need to get Started?
The first thing about Monogatari that you should probably know is that with it, your visual novel is a web page first and a game later. That means that Monogatari has been created specifically for the web, putting things like responsiveness (the fact that your game will adapt to any screen or device size) first. You don't necessarily need to think of your game this way as well, but you'll certainly take the most out of Monogatari if you do.

### Set up your environment

Making a game with Monogatari is a lot like making a web page, so all you really need is a text editor that can handle HTML, JavaScript and CSS. Almost any editor will work (yes, even Notepad), but you'll have a much nicer time with one that has syntax highlighting.

Some popular, free options include:

* [Visual Studio Code](https://code.visualstudio.com)
* [VSCodium](https://vscodium.com/)
* [Zed](https://zed.dev/)

Pick whichever one you feel most comfortable with — it'll be your main tool from here on.

You *can* open your game by just double-clicking its `index.html`, but several of Monogatari's features — offline support and service workers, asset preloading, and anything that loads files through `fetch` — only work when the game is served over HTTP instead of opened straight from disk. Running a small local web server is the recommended way to develop, and you don't need anything fancy. From the game's folder, any of these will do:

```bash
npx serve                # Node.js
bunx serve               # Bun
python3 -m http.server   # Python 3
```

If you're using Visual Studio Code, the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension gives you the same thing with a single click.

### Workflow

Ok so now you have the environment set up, you have some idea on what the files you got are for so how can you start developing your game?

1. Try the game first, open the `index.html` file inside the directory you just unzipped and play the sample game through.
2. Once you've played it once, open the directory (the one you unzipped) with the editor you chose to start making changes.
3. Open the `script.js` file with your editor, find the variable called `script`, as you'll see, all the dialogs you just saw are just a simple list in there. More information can be found in [the documentation](https://monogatari.io/v2/building-blocks/script-and-labels).
4. Change one of the dialogs, save the file and reload the game (just like you reload a website).
5. Play it again and you'll see the dialog changed just like you made it.
6. Now try adding more dialog to it and you'll quickly get how things are done.
7. Once you've gotten yourself used to adding dialogs, [add a scene](https://monogatari.io/v2/script-actions/show-scene) as a challenge, that means you'll have to add your image file to the `img/scenes/` directory , more instructions are on the link.

If you manage to do all that, congratulations! You just made your first game and are probably more familiarized with the workflow you'll be using, just make changes, save, reload, try and repeat!

## Documentation
You can read the documentation at [monogatari.io/v2](https://monogatari.io/v2).

The documentation source lives in the [`docs/`](docs/) folder of this repository.

## Monogatari as a Module
Monogatari's core is published to npm as [`@monogatari/core`](https://www.npmjs.com/package/@monogatari/core). It ships both a self-contained browser bundle and an ES module, along with TypeScript type definitions, so you can drop it into a page as a global library or import it from the bundler of your choice.

#### Browser

Loading the bundle exposes the `Monogatari` namespace and a ready-to-use `monogatari` instance on the global scope.

```html
<script src='./monogatari.js'></script>
```

```javascript
// `monogatari` is available globally; `Monogatari.default` points to the same instance
const monogatari = Monogatari.default;
```

#### ES Modules / Bundlers

```javascript
import Monogatari from '@monogatari/core';
```

Type definitions are bundled with the package, so editors get autocomplete and type-checking out of the box.

## Contributing
Contributions are always welcome! Read the [CONTRIBUTING file](https://github.com/Monogatari/Monogatari/blob/develop/CONTRIBUTING.md) to get started.

## License
Monogatari is a Free Open Source Software project released under the [MIT License](https://raw.githubusercontent.com/Monogatari/Monogatari/master/LICENSE).
