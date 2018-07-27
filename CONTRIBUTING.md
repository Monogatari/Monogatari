# Contributing Guidelines

Hey there! The very fact that you are reading this is awesome! It means you are
a bit interested in contributing to Monogatari. If you want to contribute, please keep in mind the following guidelines!

## Prerequirements
- [Git](https://git-scm.com/)
- [Yarn](https://yarnpkg.com/en/)

## Getting ready

1) Get the source
```
git clone https://github.com/Monogatari/Monogatari.git
```

2) Install all dependencies using `Yarn`
```
cd Monogatari
yarn
```

Thats it! You ready to build and contribute. See **Code Styling**.

## Code Styling

While Monogatari is mainly powered by JavaScript, its coding style is certainly
different to that of most projects using JS.

1. Strings should use single `'` quotes, attributes inside an HTML element should
use double `"` quotes instead. String literals should be used when interpolating
variables.

```javascript
'single'
<span class="double">
`${someVariable}`
```

2. Indentation should use 4 space sized Tab characters, not spaces.

3. Trailing whitespace should be removed

4. There should be a space before every function call or declaration

```javascript
function something () {
	someCall ();
}
```

5. All statements should have their respective ending semicolon

6. Comparations should use strict operators (`===` and `!==`) whenever possible.
