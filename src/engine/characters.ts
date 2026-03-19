import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { Character } from '../lib/types';
import deeply from 'deeply';

const merge = deeply.bind({});

export function characters (engine: VisualNovelEngine, object: Record<string, Character> | null = null): Record<string, Character> {
  if (object !== null) {
    // const identifiers = Object.keys (object);
    // for (const id of identifiers) {
    // 	engine.character (id, object[id]);
    // }
    engine._characters = merge (engine._characters, object) as Record<string, Character>;
  }

  return engine._characters;
}

export function character (engine: VisualNovelEngine, id: string, object: Partial<Character> | null = null): Character | undefined {
  if (object !== null) {
    if (typeof engine._characters[id] !== 'undefined') {
      engine._characters[id] = merge (engine._characters[id], object) as Character;
    } else {
      engine._characters[id] = object as Character;
    }
  } else {
    const character = engine._characters[id];

    // Translate the old character properties into the new ones
    if (typeof character !== 'undefined') {
      if (typeof character.Images === 'object') {
        character.sprites = merge ({}, character.Images);
        delete character.Images;
      }

      if (typeof character.Directory === 'string') {
        character.directory = character.Directory;
        delete character.Directory;
      }

      if (typeof character.Color === 'string') {
        character.color = character.Color;
        delete character.Color;
      }

      if (typeof character.Name === 'string') {
        character.name = character.Name;
        delete character.Name;
      }

      if (typeof character.Face === 'string') {
        character.default_expression = character.Face;
        delete character.Face;
      }

      if (typeof character.Side === 'object') {
        character.expressions = character.Side;
        delete character.Side;
      }

      if (typeof character.TypeAnimation === 'boolean') {
        character.type_animation = character.TypeAnimation;
        delete character.TypeAnimation;
      }
    }

    return character;
  }
}
