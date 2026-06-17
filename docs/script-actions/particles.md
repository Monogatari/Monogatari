---
title: Show Particles
order: 49
description: Show a particle system animation
---


# Show Particles

## Description

```javascript
'show particles <particles_id>'
```

The `particles` action let's you show amazing animations using particle systems. A particle system is useful when you want to add dynamic elements such as snow, stars, rain etc. and can be an awesome addition for your game!

To hide the particle systems, read the [Hide Particles documentation](hide-particles.md).

**Action ID**: Particles

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| particles\_id | `string` | The name of the particles system you want to show. These must be declared beforehand using this action configuration functions. |

## Configuration

To use a particle system, you must first declare it with all of it's characteristics. To do so, the particles action has a configuration function where you can define your id for each particle system and their configuration on a JSON Object.

```javascript
Monogatari.action ('Particles').particles ({
    '<particles_id>': ParticlesJSONObject
});
```

This action uses the [Particles.js library](https://github.com/VincentGarreau/particles.js/), reading their documentation you can find more information about it and also more information on how to create a custom particle system.

### Samples

Here are some examples that may be useful and also provide a good start point:



**Snow**

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



**Night Sky**

```javascript
Monogatari.action('Particles').particles({
    'stars': {
        'particles': {
            'number': {
                'value': 355,
                'density': {
                    'enable': true,
                    'value_area': 789.1476416322727
                }
            },
            'color': {
                'value': '#ffffff'
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
                    'src': '',
                    'width': 100,
                    'height': 100
                }
            },
            'opacity': {
                'value': 0.48927153781200905,
                'random': false,
                'anim': {
                    'enable': true,
                    'speed': 0.2,
                    'opacity_min': 0,
                    'sync': false
                }
            },
            'size': {
                'value': 2,
                'random': true,
                'anim': {
                    'enable': true,
                    'speed': 2,
                    'size_min': 0,
                    'sync': false
                }
            },
            'line_linked': {
                'enable': false,
                'distance': 150,
                'color': '#ffffff',
                'opacity': 0.4,
                'width': 1
            },
            'move': {
                'enable': true,
                'speed': 0.2,
                'direction': 'none',
                'random': true,
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
                    'mode': 'push'
                },
                'resize': true
            },
            'modes': {
                'grab': {
                    'distance': 400,
                    'line_linked': {
                        'opacity': 1
                    }
                },
                'bubble': {
                    'distance': 83.91608391608392,
                    'size': 1,
                    'duration': 3,
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



**Fireflies**

```javascript
Monogatari.action('Particles').particles({
    'fireflies': {
        'particles': {
            'number': {
                'value': 202,
                'density': {
                    'enable': true,
                    'value_area': 800
                }
            },
            'color': {
                'value': '#0bd318'
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
                    'src': 'img/github.svg',
                    'width': 100,
                    'height': 100
                }
            },
            'opacity': {
                'value': 0.9299789953020032,
                'random': true,
                'anim': {
                    'enable': true,
                    'speed': 1,
                    'opacity_min': 0,
                    'sync': false
                }
            },
            'size': {
                'value': 3,
                'random': true,
                'anim': {
                    'enable': false,
                    'speed': 4,
                    'size_min': 0.3,
                    'sync': false
                }
            },
            'line_linked': {
                'enable': false,
                'distance': 150,
                'color': '#ffffff',
                'opacity': 0.4,
                'width': 1
            },
            'move': {
                'enable': true,
                'speed': 3.017060304327615,
                'direction': 'none',
                'random': true,
                'straight': false,
                'out_mode': 'out',
                'bounce': false,
                'attract': {
                    'enable': false,
                    'rotateX': 1042.21783956259,
                    'rotateY': 600
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
                        'opacity': 1
                    }
                },
                'bubble': {
                    'distance': 250,
                    'size': 0,
                    'duration': 2,
                    'opacity': 0,
                    'speed': 3
                },
                'repulse': {
                    'distance': 400,
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



**Fire Sparks**

```javascript
Monogatari.action('Particles').particles({
    'fireSparks': {
        'particles': {
            'number': {
                'value': 400,
                'density': {
                    'enable': true,
                    'value_area': 3000
                }
            },
            'color': {
                'value': '#fc0000'
            },
            'shape': {
                'type': 'circle',
                'stroke': {
                    'width': 0,
                    'color': '#000000'
                },
                'polygon': {
                    'nb_sides': 3
                },
                'image': {
                    'src': 'img/github.svg',
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
                'value': 2,
                'random': true,
                'anim': {
                    'enable': true,
                    'speed': 5,
                    'size_min': 0,
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
                'speed': 7.8914764163227265,
                'direction': 'top',
                'random': true,
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
                    'enable': false,
                    'mode': 'bubble'
                },
                'onclick': {
                    'enable': false,
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



You can also play with the [Particles.js interactive tool](https://vincentgarreau.com/particles.js/) to create your own particle systems.

## Examples

For this examples, we'll assume you've used one of the sample configurations provided. Showing a particle system is as simple as:

```javascript
Monogatari.script ({
    'Start': [
        'show particles snow',
        'end'
    ] 
});
```
