---
title: Choice Container
order: 64
---

# Choice Container

## Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `choices` | `ChoiceItem[]` | `[]` | The list of choice buttons to render, one button per item. |
| `classes` | `string` | `''` | Space-separated list of extra CSS classes added to the container element itself when it mounts. |

### Choice Item

Each entry in `choices` describes a single button:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Text` | `string` | Yes | The button label. Variables in it are replaced before rendering. |
| `Do` | `string` | Yes | The script statement to run when the button is clicked (rendered as `data-do`). |
| `Class` | `string` | No | Extra CSS class applied to that individual button. |
| `Clickable` | `() => boolean \| Promise<boolean>` | No | Optional guard. If it (a)synchronously resolves falsy, the button is rendered `disabled`. |
| `_key` | `string` | — | Internal identifier for the choice, set by the engine (rendered as `data-choice`). |

## Component Structure

The following code is this component's initial HTML structure. Remember you can change this structure any time by using the [`template()` component built-in function](../building-blocks/components/built-in-functions.md#get-or-modify-the-html-structure).

```javascript
const choices = this.props.choices.map ((choice) => {
    if (typeof choice.Clickable === 'function') {
        return new Promise ((resolve, reject) => {
            this.engine.assertAsync (choice.Clickable, this.engine).then (() => {
                resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}">${choice.Text}</button>`);
            }).catch (() => {
                resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}" disabled>${choice.Text}</button>`);
            });

        });
    }
    return Promise.resolve (`<button data-do="${choice.Do}" ${ choice.Class ? `class="${choice.Class}"`: ''} data-choice="${choice._key}">${choice.Text}</button>`);
});

return Promise.all (choices).then ((choices) => `
    <div data-content="wrapper">
        ${ choices.join('') }
    </div>
`);
```
