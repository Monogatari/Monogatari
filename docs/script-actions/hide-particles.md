---
title: Hide Particles
order: 29
description: Hide a particle system animation
---


# Hide Particles

## Description

```javascript
'hide particles'
```

This `hide` action will stop the currently shown particle system. To learn more about the particle systems, read the [Show Particles documentation](particles.md).

**Action ID**: `Particles::Hide`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

None

## Examples

The following sample will show the particle system named snow, previously declared on the [particles action configuration](particles.md#configuration) and then hide it.



**Script**

```javascript
Monogatari.script ({
    'Start': [
        'show particles snow',
        'Snow is now falling from the sky!',
        'hide particles',
        'There is no more snow :('
        'end'
    ] 
});
```



**Particles Configuration**

```javascript
Monogatari.action('Particles').particles({
    'snow': {
        'particles': {
            'number': {
                'value': 400,
                'density': {
                    'enable': true,
                    'value_area': 800
                }
            },
            'color': {
                'value': '#fff'
            },
            'shape': {
                'type': 'circle',
                'stroke': {
                    'width': 0,
                    'color': '#000000'
                },
                'polygon': {
                    'nb_sides': 5
                },
                'image': {
                    'src': 'img\/github.svg',
                    'width': 100,
                    'height': 100
                }
            },
            'opacity': {
                'value': 0.5,
                'random': true,
                'anim': {
                    'enable': false,
                    'speed': 1,
                    'opacity_min': 0.1,
                    'sync': false
                }
            },
            'size': {
                'value': 10,
                'random': true,
                'anim': {
                    'enable': false,
                    'speed': 40,
                    'size_min': 0.1,
                    'sync': false
                }
            },
            'line_linked': {
                'enable': false,
                'distance': 500,
                'color': '#ffffff',
                'opacity': 0.4,
                'width': 2
            },
            'move': {
                'enable': true,
                'speed': 6,
                'direction': 'bottom',
                'random': false,
                'straight': false,
                'out_mode': 'out',
                'bounce': false,
                'attract': {
                    'enable': false,
                    'rotateX': 600,
                    'rotateY': 1200
                }
            }
        },
        'interactivity': {
            'detect_on': 'canvas',
            'events': {
                'onhover': {
                    'enable': true,
                    'mode': 'bubble'
                },
                'onclick': {
                    'enable': true,
                    'mode': 'repulse'
                },
                'resize': true
            },
            'modes': {
                'grab': {
                    'distance': 400,
                    'line_linked': {
                        'opacity': 0.5
                    }
                },
                'bubble': {
                    'distance': 400,
                    'size': 4,
                    'duration': 0.3,
                    'opacity': 1,
                    'speed': 3
                },
                'repulse': {
                    'distance': 200,
                    'duration': 0.4
                },
                'push': {
                    'particles_nb': 4
                },
                'remove': {
                    'particles_nb': 2
                }
            }
        },
        'retina_detect': true
    }
});
```
