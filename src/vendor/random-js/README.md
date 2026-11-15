# random-js (vendored)

Vendored copy of [random-js](https://github.com/ckknight/random-js) 2.1.0 by Summer Knight, released under the MIT License (see `LICENSE`).

The sources come from Monogatari's fork, [Monogatari/random-js](https://github.com/Monogatari/random-js) at commit `7dd5b5f`, which removes upstream's unguarded dependency on Node's `crypto` module so the library works in the browser bundle. It is vendored instead of installed from git because recent npm versions refuse git dependencies by default, which made `@monogatari/core` uninstallable.

The files are kept exactly as they are in the fork (test files excluded) so they can be diffed against it. Don't edit them in place; make changes in the fork and copy them over.
