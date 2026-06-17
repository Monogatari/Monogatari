---
title: Show Scene
order: 50
description: Change the background
---


# Show Scene

## Description

```javascript
'show scene <resource> [with [animations] [classes] [properties]]'
```

The `scene` action will change the background and clear the screen, removing all characters, images and text currently displayed.

**Action ID**: `Scene`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

<table>
  <thead>
    <tr>
      <th style="text-align:left">Name</th>
      <th style="text-align:left">Type</th>
      <th style="text-align:left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">resource</td>
      <td style="text-align:left"><code>string</code>
      </td>
      <td style="text-align:left">
        <p>The resource to use as the background for the scene. This resource may
          be one of the following:</p>
        <ul>
          <li><em>Scene ID</em>: The ID of a scene asset previously defined.</li>
          <li><em>CSS Property</em>: Any valid non-spaced value for the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/background">background CSS property</a>.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">animations</td>
      <td style="text-align:left"><code>string</code>
      </td>
      <td style="text-align:left">Optional. A list of comma separated animation names with which the scene
        will be shown.</td>
    </tr>
    <tr>
      <td style="text-align:left">classes</td>
      <td style="text-align:left"><code>string</code>
      </td>
      <td style="text-align:left">Optional. A list of comma separated CSS class names that will be added
        to the background element. You can create custom classes on your CSS and
        add them to your background dynamically using this list.</td>
    </tr>
    <tr>
      <td style="text-align:left">properties</td>
      <td style="text-align:left"><code>string</code>
      </td>
      <td style="text-align:left">Optional. A list of comma separated properties with their respective value.</td>
    </tr>
  </tbody>
</table>

### Properties

The following is a comprehensive list of the properties available for you to modify certain behaviors of the scene action.

| Property Name | Type | Description |
| :--- | :--- | :--- |
| duration | `string` | The duration for the animations used.  The value for this property must be a non-spaced valid value for the [`animation-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration) CSS property. |

## Using an Image as the Background

If you want to use an image for the background, remember you first have to declare your image assets and place all your files under the `assets/scenes/` directory.

**Script:**

```javascript
monogatari.script ({
    'Start': [
        'show scene mountain',
        'end'
    ]
});
```

**Scene Assets:**

```javascript
monogatari.assets ('scenes', {
    'mountain': 'mountain.png',
    'sea': 'sea.png'
});
```

### Using CSS properties as the background

If you'll use CSS to set a custom background, you can use any valid non-spaced value for the [`background-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) or [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS properties. Using CSS is perfect for when you want your background to be a **solid color**. Here are some valid statements:

```javascript
monogatari.script ({
    'Start': [
        'show scene #fff',
        'show scene rgb(0, 0, 0)',
        'show scene url("assets/scenes/mountain.png")',
        'end'
    ]
});
```

### Using Animations

Monogatari comes with some built-in animations ready for you to use, you can see the list of animations and visualize them [here](https://daneden.github.io/animate.css/). Using animations is as simple as indicating their name!

**Script:**

```javascript
monogatari.script ({
    'Start': [
        'show scene sea with fadeIn',
        'end'
    ]
});
```

**Scene Assets:**

```javascript
monogatari.assets ('scenes', {
    'mountain': 'mountain.png',
    'sea': 'sea.png'
});
```

#### **Modifying an animation duration**

The following will set the background to a solid color using a CSS value and modify the duration of the _fadeIn_ animation to 20 seconds.

```javascript
monogatari.script ({
    'Start': [
        'show scene #424242 with fadeIn duration 20s',
        'end'
    ]
});
```

#### **Creating a custom animation**

You can also use CSS to create your own animations, you'll have to apply them to a CSS class and then use the scene statement as follows:

For example, note the following CSS code creating a simple Ken Burn Animation:

**Script:**

```javascript
monogatari.script ({
    'Start': [
        'show scene mountain with ken-burn',
        'end'
    ]
});
```

**Scene Assets:**

```javascript
monogatari.assets ('scenes', {
    'mountain': 'mountain.png',
    'sea': 'sea.png'
});
```

**CSS:**

```css
.ken-burn {
    animation-name: ken-burns; /* Name of the animation to use */
    animation-duration: 30s;
    animation-iteration-count: infinite; /* 1 if it should only move once */
    animation-timing-function: ease;
    animation-fill-mode: forwards;
    animation-delay: 0s;
    -moz-transition: ease 1s all;
    -o-transition: ease 1s all;
    -webkit-transition: ease 1s all;
    transition: ease 1s all;
}

@keyframes ken-burns {
    0%    { 
        transform: translateX(0); 
    }
    50%    {
        transform: translateX(-500px);
    }
    100%  {
        transform: translateX(0px); 
    }
}
```

## Behavior

When a scene is shown:

1. The background is changed
2. All characters are removed from the screen
3. All images are removed from the screen
4. The text box is cleared

This makes `show scene` ideal for scene transitions where you want a clean slate. If you only want to change the background without removing elements, use [Show Background](show-background.md) instead.

## Related Actions

- [Show Background](show-background.md) - Change background without clearing elements
- [Show Character](characters.md) - Display character sprites
- [Show Image](show-image.md) - Display images
