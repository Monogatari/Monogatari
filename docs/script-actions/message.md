---
title: Show Message
order: 47
description: Show a message
---


# Show Message

## Description

```javascript
'show message <message_id>'
```

The `message` action let's you show a message to the player. A message is a nice way of showing something that requires more text such as an email or instructions. You could also use it as a mailbox or something of the sorts in your game.

Each message has a close button so the user is able to close it when he's finished reading it.

**Action ID**: `Message`

**Reversible**: Yes

**Requires User Interaction**: Yes, the user needs to close the message before continuing.

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| message\_id | `string` | The name of the message you want to show. These must be declared beforehand using this action configuration functions. |

## Configuration

To show a message, you must first declare it with all of it's characteristics. To do so, the message action has a configuration function where you can define your id or name for each message and their respective information.

```javascript
monogatari.action ('Message').messages ({
    '<message_id>': {
        title: '',
        subtitle: '',
        body: ''
    }
});
```

### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| title | `string` | The title of the message |
| subtitle | `string` | A subtitle for the message |
| body | `string` | The body or contents of the message |

## Examples

### Text Message

The following script will show a simple text message:

**Script:**

```javascript
monogatari.script ({
    'Start': [
        'show message SampleWriting',
        'end'
    ] 
});
```

**Message Configuration:**

```javascript
monogatari.action ('Message').messages ({
    'SampleWriting':{
        title: 'Some sample writing',
        subtitle: 'From Evelyn',
        body:'Just look how easy it is!'
    }
});
```

### HTML Message

You can also include HTML on your message, the following script and configuration will show a message with HTML on it.

**Script:**

```javascript
monogatari.script ({
    'Start': [
        'show message SampleHTML',
        'end'
    ] 
});
```

**Message Configuration:**

```javascript
monogatari.action ('Message').messages ({
    'SampleHTML':{
        title: 'Some sample writing',
        subtitle: 'From Evelyn',
        body: `
            <p>This message is being formatted with HTML</p>
            <img src="assets/images/message.png">
        `
    }
});
```

### Custom Button Text

You can customize the close button text using the `actionString` property:

```javascript
monogatari.action ('Message').messages ({
    'Letter': {
        title: 'A Letter From Home',
        subtitle: 'From Mom',
        body: 'Hope you\'re doing well! Come visit soon.',
        actionString: 'Close Letter'
    }
});
```

### Adding CSS Classes

You can pass additional CSS classes after the message ID to style specific messages:

```javascript
'show message ImportantNote urgent highlighted'
```

## Related Actions

- [Input](input.md) - Get player input
- [Choices](choices.md) - Present options to players
