---
title: Gallery
order: 25
description: An Image Gallery of images for your players to unlock
---


# Gallery

New to Monogatari v2 is an Image Gallery feature. With it you can create a gallery of images that your players can unlock by going through the game and seeing all the images, like you will find in many visual novels.

**Action ID**: `Gallery`

**Reversible**: Yes

**Requires User Interaction**: No

## Creating the Gallery

By default, the Image Gallery doesn't appear, since it would be pretty disappointing to your players to see a Gallery button on the main menu and have nothing inside of it.

![Monogatari&apos;s Default Main Menu with no Gallery](../assets/image-3.png)

This is easily fixed by simply declaring some images! First you put some images in the Gallery folder. If you don't already have a Gallery folder because you previously updated the Engine Folder from an earlier version of Monogatari v2, then you may create a new one.

![The &quot;gallery&quot; folder is located inside of your &quot;assets&quot; folder in your game&apos;s directory.](../assets/image-14-1.png)

Once you have an image or images in the gallery folder, you'll declare them in `script.js` .

```javascript
monogatari.assets ('gallery', {
    'someImage': 'happy-shine.png'
});
```

Once that's done, you'll see that a new option has appeared on the Main Screen of your game.

![Monogatari&apos;s Default Main Menu with the Gallery option available.](../assets/image-8.png)

## Unlocking Gallery Images

By default, on a fresh new game, all gallery images are locked, as these are rewards for the player for having completed parts of the game and met certain conditions.

![The default Gallery screen with one image, with that one image being locked.](../assets/image-1.png)

In order for the player to see this locked image, the player must reach a part of the script that enables it. To make this possible for your player, you'll include `"gallery unlock"` in your game script.

```javascript
"y You've unlocked the gallery image",
"gallery unlock someImage", //unlocks the image
"y Great job!"
```

Once the player crosses over this line in the script, it will unlock the gallery image!

![The default Gallery screen with one image, with that one image being Unlocked.](../assets/image-10-1.png)

Monogatari gallery unlocks are not dependent on any save files, so if you, for whatever reason, want to lock the player out of being able to see any of the gallery images for any reason, like as part of, for instance, a story event that master resets the game, which includes losing the gallery, you may re-lock images by writing `"gallery lock someImage"` in your script.

```javascript
"y This will lock the image away so that you can't see it anymore.",
"gallery lock someImage",
"y Goodbye, Protagonist-sama. I'll never forget you."
```
