---
title: Conditionals
order: 22
description: Control the flow of your game based on conditions
---


# Conditionals

## Description

```javascript
{'Conditional': {
    'Condition': function() { /* return true/false or string */ },
    'True': '<statement>',
    'False': '<statement>'
}}
```

Conditionals allow you to control the flow of your game based on conditions. You can show different dialogs, jump to different labels, or execute different actions depending on storage values, player choices, or any other condition.

**Action ID**: `Conditional`

**Reversible**: Yes

**Requires User Interaction**: Depends on the branch statement executed

## Basic Structure

| Property | Type | Description |
| :--- | :--- | :--- |
| `Condition` | `function` | Function that returns `true`, `false`, or a string key |
| `True` | `statement` | Statement to execute if condition returns `true` |
| `False` | `statement` | Statement to execute if condition returns `false` |
| `<custom>` | `statement` | Custom branches when using string return values |

## Examples

### Boolean Condition

Check if a condition is true or false:

```javascript
{'Conditional': {
    'Condition': function () {
        return this.storage('evelyn_name') === 'Evelyn';
    },
    'True': "e Evelyn... That's a lovely name! I love it!",
    'False': 'e {{evelyn_name}}... Yeah, sounds good!'
}},
```

### Conditional Jump

Jump to different labels based on a condition:

```javascript
{'Conditional': {
    'Condition': function () {
        return this.storage('played');
    },
    'True': 'jump ReturningPlayer',
    'False': 'jump NewGame'
}},
```

### Multiple Branches (String Returns)

Use string return values for more than two branches:

```javascript
{'Conditional': {
    'Condition': function () {
        const money = this.storage().money;
        if (money < 1) {
            return 'broke';
        } else if (money < 5) {
            return 'poor';
        } else if (money < 20) {
            return 'comfortable';
        } else {
            return 'rich';
        }
    },
    'broke': 'jump GoHomeHungry',
    'poor': 'jump BuySnack',
    'comfortable': 'jump BuyMeal',
    'rich': 'jump BuyFeast'
}},
```

### Numeric String Branches

Use numbers as string keys for indexed branches:

```javascript
{'Conditional': {
    'Condition': function () {
        // Convert number to string for branch key
        const affection = this.storage().affection;
        if (affection >= 100) return '3';
        if (affection >= 50) return '2';
        if (affection >= 25) return '1';
        return '0';
    },
    '0': 'e I barely know you.',
    '1': "e We're acquaintances, I suppose.",
    '2': "e You're a good friend.",
    '3': 'e You mean everything to me!'
}},
```

### Complex Condition

Combine multiple checks:

```javascript
{'Conditional': {
    'Condition': function () {
        const hasKey = this.storage().inventory.includes('key');
        const metGuard = this.storage().flags.metGuard;
        
        if (hasKey && metGuard) {
            return 'full_access';
        } else if (hasKey) {
            return 'has_key';
        } else if (metGuard) {
            return 'knows_guard';
        }
        return 'False';
    },
    'full_access': 'jump EnterCastle',
    'has_key': 'e The guard stops me. I have a key but no permission.',
    'knows_guard': 'e The guard lets me pass, but the door is locked.',
    'False': "e I can't get in here."
}},
```

## Important Notes

> [!WARNING]
> **All branches must be defined!** Monogatari throws an error if the Condition returns a value that doesn't match any branch key. Always account for all possible return values.

### String vs Boolean

- Return `true` → executes `'True'` branch
- Return `false` → executes `'False'` branch
- Return `'someString'` → executes `'someString'` branch

### Numeric Return Values

When the `Condition` returns a `number`, Monogatari coerces it into a string and uses it as the branch key (so returning `2` selects the `'2'` branch). For this to work, the number must be a **non-negative integer**.

> [!WARNING]
> A negative number or a non-integer (such as `-1` or `1.5`) returned from the `Condition` is invalid and will raise an error instead of selecting a branch. If you need fractional or negative logic, map it to a non-negative integer or to a string key inside your `Condition` function.

### Errors Inside the Condition

If the `Condition` function throws an error (or returns a rejected `Promise`), Monogatari does not crash the game. Instead, it falls back to running the `'False'` branch.

> [!NOTE]
> The `'False'` branch also runs whenever the `Condition` returns any value that is neither `true` nor a string nor a valid numeric key (for example `false`, `undefined`, `null`, or `NaN`). Because a thrown error is treated the same way, make sure a `'False'` branch is always defined when your condition can fail.

### Async Conditions

Conditions can use Promises for async operations:

```javascript
{'Conditional': {
    'Condition': async function () {
        const result = await someAsyncCheck();
        return result;
    },
    'True': 'e The async check passed!',
    'False': 'e The async check failed.'
}},
```

## Rollback Behavior

Conditionals support rollback. When the player goes back:
- The previously executed branch is reverted
- The condition is re-evaluated on the next forward progression

## Related Actions

- [Jump](jump.md) - Navigate to different labels
- [Choices](choices.md) - Let players choose branches
- [Functions](javascript.md) - Run JavaScript code
