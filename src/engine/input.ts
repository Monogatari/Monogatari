import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { DOM, Callable } from '@aegis-framework/artemis';
import { $_, Util } from '@aegis-framework/artemis';
import mousetrap, { ExtendedKeyboardEvent } from 'mousetrap';

export function keyboardShortcut (engine: VisualNovelEngine, shortcut: string | string[], callback: (this: VisualNovelEngine, event: KeyboardEvent, element: DOM) => void): void {
  engine.debug.log (`Binding Keyboard Shortcut: ${shortcut}`);

  mousetrap.bind (shortcut, (event: ExtendedKeyboardEvent) => {
    const target = event.target as HTMLElement | null;

    if (target && target.tagName?.toLowerCase () !== 'input') {
      event.preventDefault ();
      callback.apply (engine, [event, $_(target)]);
    }
  });
}

export function registerListener (engine: VisualNovelEngine, name: string, listener: { keys?: string | string[]; callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown }, replace = false): void {
  const listenerWithName = { ...listener, name };

  if (replace === true) {
    const index = engine._listeners.findIndex (l => l.name === name);

    if (index > -1) {
      engine._listeners[index] = listenerWithName;
      return;
    }
  }

  // If a listener is registered post-bind, we want to register the keyboard
  // shortcut as well or else it will not happen automatically
  if (engine.global ('_didBind') === true && listenerWithName.keys) {
    keyboardShortcut (engine, listenerWithName.keys, listenerWithName.callback);
  }

  engine._listeners.push (listenerWithName);
}

export function unregisterListener (engine: VisualNovelEngine, name: string): void {
  const listener = engine._listeners.find((l) => l.name.toLowerCase () === name.toLowerCase ());

  if (listener) {
    if (listener.keys) {
      engine.debug.log (`Unbinding Keys: ${listener.keys}`);
      mousetrap.unbind (listener.keys as string | string[]);
    }

    engine._listeners = engine._listeners.filter((l) => l.name.toLowerCase () !== name.toLowerCase ());
  }
}

export async function runListener (engine: VisualNovelEngine, name: string, event: Event | null = null, element: DOM | null = null): Promise<void> {
  const promises: Promise<void>[] = [];
  let actionName = name;

  // Check if the click event happened on a path of an icon.
  // This fixes a bug with font-awesome icons being clicked but the
  // click being registered at an inner path instead of the svg element
  // that holds the data information
  if (element && element.matches ('path')) {
    element = element.closest ('[data-action]');

    if (element.length > 0) {
      actionName = element.data ('action') || name;
    }
  }

  for (const listener of engine._listeners) {
    if (listener.name === actionName) {
      promises.push (Util.callAsync(listener.callback as Callable<unknown>, engine, event, element).then ((data) => {
        if (data) {
          return Promise.resolve ();
        }

        return Promise.reject ();
      }));

      engine.debug.debug ('Running Listener', actionName);
    }
  }

  await Promise.all (promises).catch ((e) => {
    if (event) {
      event.stopImmediatePropagation ();
      event.stopPropagation ();
      event.preventDefault ();
    }

    engine.debug.debug ('Listener Event Propagation Stopped', e);
  });
}
