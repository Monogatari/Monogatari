# Monogatari
Built to bring Visual Novels to the modern web and take them to the next level, making it easy for anyone to create and distribute Visual Novels in a simple way so that anyone can enjoy them on pretty much anywhere, create games with features that no one has ever imagined... it is time for Visual Novels to Evolve.

Website: https://monogatari.io/

Demo: https://monogatari.io/demo/

## Features
- Responsive out of the box
- Plays nice with Electron for Desktop apps and Cordova for mobile apps
- Simple Syntax
- Progressive Web App Features allowing offline game play
- Allows you to use any kind of media supported by browsers
- Compatible with all major browsers
- Includes libraries for animations and particle effects
- Allows saving/loading games
- Extensible, you just can't imagine how much!

## What do I need to get Started?
The first thing about Monogatari that you should probably know is that with it, your visual novel is a web page first and a game later. That means that Monogatari has been created specifically for the web, putting things like responsiveness (the fact that your game will adapt to any screen or device size) first. You don't necessarily need to think of your game this way as well, but you'll certainly take the most out of Monogatari if you do.

### Set up your environment

To develop in Monogatari you would need the same as to develop a webpage, you just need a text editor capable of editing HTML, Javascript and CSS, which means that pretty much any text editor should work, even Windows NotePad but to make it easier, you probably want one with code syntax highlighting.

Some recommended (and free) ones include:

* [Atom](https://atom.io/)
* [Brackets](http://brackets.io/)
* [Visual Studio Code](https://code.visualstudio.com)

Take a look at them and pick the one you like the most and feel comfortable with, this will be your main tool from now on.

Now, you can always open a website by just clicking the file (index.html) and opening it with your browser, however there are small aspects of Monogatari that work better when served through a web server. You don't need anything fancy for this, in fact there's a perfectly fine web server you can [download from the Chrome Store](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)

As previously mentioned, the use of a web server is completely optional, you can just open your game with the browser as a file and it will run just fine, the web server will allow you to test features such as the Service Workers, needed for Monogatari's offline support and asset preloading.

### Workflow

Ok so now you have the environment set up, you have some idea on what the files you got are for so how can you start developing your game?

1. Try the game first, open the index.html file inside the directory you just unzipped and play the sample game through.
2. Once you've played it once, open the directory (the one you unzipped) with the editor you chose to start making changes.
3. Open the script.js file with your editor, find the variable called ˋscriptˋ, as you'll see, all the dialogs you just saw are just a simple list in there. More information can be found in [the documentation](https://monogatari.io/documentation/script/text/).
4. Change one of the dialogs, save the file and reload the game (just like you reload a website).
5. Play it again and you'll see the dialog changed just like you made it.
6. Now try adding more dialog to it and you'll quickly get how things are done.
7. Once you've gotten yourself used to adding dialogs, [add a scene](https://monogatari.io/documentation/script/scenes/) as a challenge, that means you'll have to add your image file to the ˋimg/scenes/ directoryˋ, more instructions are on the link.

If you manage to do all that, congratulations! You just made your first game and are probably more familiarized with the workflow you'll be using, just make changes, save, reload, try and repeat!

## Documentation
You can take a look at the documentation in https://monogatari.io/documentation/

You can also contribute to it in the [Documentation repository](https://github.com/Monogatari/Documentation)


## Get in Touch
If you have any doubt, problem or just want some help please contact me, I'll be glad to help in any way I can. Even though Monogatari is simple enough and you can find many resources online, I know it can be hard to get started and sometimes the documentation is not clear enough, so really, contact me anytime!

You can join the [Discord Server](https://discord.gg/gWSeDTz), send me an email, DM me at [Twitter](https://twitter.com/Hyuchia), and [Mastodon](https://mastodon.social/@HyuchiaDiego) as well.

## Contributing
Contributions are always welcome! If you have contributed to this project, or in the website, please make sure you are listed in the contributors list of the website, you can add yourself in the [contributors file](https://github.com/Monogatari/Website/blob/master/templates/contributors.html) of the website

## License
Monogatari is a Free Open Source Software project released under the [MIT License](https://raw.githubusercontent.com/Monogatari/Monogatari/master/LICENSE).