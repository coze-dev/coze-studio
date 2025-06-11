import { isAppleDevice } from './device';

const BaseKey: Record<string, string> = {
  RIGHTARROW: '→',
  LEFTARROW: '←',
  UPARROW: '↑',
  DOWNARROW: '↓',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  SPACE: 'Space',
  SHIFT: '⇧',
  PERIOD: '.',
  SLASH: '/',
  BACKSLASH: '\\',
  EQUALS: '=',
  MINUS: '-',
  BRACKETLEFT: '[',
  BRACKETRIGHT: ']',
  QUOTE: "'",
  SEMICOLON: ';',
  BACKQUOTE: '`',
  OPENBRACKET: '[',
  CLOSEBRACKET: ']',
  COMMA: ',',
};

const ControlKey: Record<string, string> = isAppleDevice
  ? {
      ...BaseKey,
      META: '⌘',
      OPTION: '⌥',
      ALT: '⌥',
      CONTROL: '^',
    }
  : {
      ...BaseKey,
      META: 'Alt',
      CAPSLOCK: '⇪',
      CTRL: 'Ctrl',
      ALT: 'Alt',
    };

export const getKeyLabel = (keyString: string): string[] =>
  keyString.split(/\s+/).map(key => {
    const k = key.toLocaleUpperCase();
    return ControlKey[k] || k;
  });
