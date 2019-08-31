# Contributing Guidelines

Hey there! The very fact that you are reading this is awesome! It means you are
a bit interested in contributing to Monogatari. If you want to contribute, please
keep in mind the following guidelines! Please note these guidelines are just for
contributing to the project, not for creating your game. If you need instructions
on programming your own Visual Novel, you'll find useful resources in the [documentation](https://developers.monogatari.io/documentation/).

## Development Culture
A very important part is to get into Monogatari's development culture, and it's
quite a simple one, just act according to these rules.
* Help anyone who needs help
* Monogatari is all about sharing, not about competing with other engines


## Development Prerequirements
So, what do you need to begin contributing to Monogatari?

Required Software:

- [Git](https://git-scm.com/)
- [Node](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/en/)

Recommended Software:

You are free to choose your development environment regarding text editors or
additional tools, however I recommend using either [Atom](https://atom.io/) or [Visual Studio Code](https://code.visualstudio.com/).


## Getting Ready

Ok, so you've installed everything you need to start contributing to Monogatari,
as you know GitHub is ussed to store the code so you'll have to use GitHub along
the way to contribute. So let's start!

1) [Fork the Project](https://help.github.com/articles/fork-a-repo/), this will
   create a copy of the code in your GitHub account with which you'll be able to
   work with.

2) Get the source from your fork. Notice you should replace `<YourUser>` with your
   actual GitHub username.

```bash
git clone https://github.com/<YourUser>/Monogatari.git
```

3) Go into the project's directory

```bash
cd Monogatari
```

4) Change to the `develop` branch. Monogatari uses the [Git WorkFlow](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows) so there are
   two main branches, `master` where all the stable code is hosted and `develop`
   where all the work in progress code is hosted. Following this distinction, master
   usually hosts the code of the latest stable release while develop hosts the code
   for the upcoming releases. All your contributions should always use `develop` as
   its base.

```bash
git checkout develop
```

5) Install all dependencies using [Yarn](https://yarnpkg.com/en/)`

```bash
yarn install
```

6) Make all the changes you want and build the code. Please follow the coding guidelines
   described at the end of this document while making changes to the code.

```bash
yarn run build:core
```

7) Test your changes and make sure everything works correctly, once tested, commit
   your changes.

```bash
git commit <List of files to commit> -m "A message describing what you did in present tense"
```

8) Push the modified code to your Fork

```bash
git push origin develop
```

9) You can repeat this process for all the changes you want to add but if you are done
   then its time to [make a Pull Request](https://help.github.com/articles/creating-a-pull-request/)

10) Once you've made the pull request, then all that's left is wait until
   someone reviews your code and approves it for being merged into the official
   source code. Once merged, you've officially became a contributor!


That's it! You ready to build and contribute. See **Code Styling**.

## Code Styling

While Monogatari is mainly powered by JavaScript, its coding style is certainly
different to that of most projects using JS. The style is inspired in the one used
on the [elementary OS](https://elementary.io/docs/code/reference#reference) project.

### Single Quoted Strings

Strings should use single `'` quotes but attributes inside an HTML element should
use double `"` quotes instead. String literals should be used when interpolating
variables.

```javascript
'single'
<span class="double">
`${someVariable}`
```

### Indentation and Whitespace

Indentation should use 4 space sized Tab characters, not spaces.

Trailing whitespace should be removed and no trailing new line should be present.

### Function spacing

There should be a space before every function call or declaration parenthesis

```javascript
function something () {
	someCall ();
}
```

### Semiconlons

All statements should have their respective ending semicolon

### Comparisons

Comparisons should use strict operators (`===` and `!==`) whenever possible.

### Avoid code abbreviation (when the abbreviation is not really necessary)

While it's tempting to sometimes do something like this:

```javascript
if (something !== true) return false;
```

You should always prefer making code more readable:

```javascript
if (something !== true) {
    return false;
}
```

### Use Linters
Monogatari ships with configurations for the following linters:
* [ESlint](https://eslint.org/)
* [Stylelint](https://stylelint.io/)
* [HTMLHint](http://htmlhint.com/)

Whenever possible, make sure to use the linters and comply with the
specified rules on these files.

There's also an `.editorconfig` file shipped so if your editor
supports it, it should take care of some of the formatting.