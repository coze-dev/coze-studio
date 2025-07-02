import { type Event } from '@flowgram-adapter/common';

import { type URI } from '../common';
export interface LabelChangeEvent {
  affects: (element: object) => boolean;
}

export const LabelHandler = Symbol('LabelHandler');

export interface LabelHandler {
  /**
   * Emit when something has changed that may result in this label provider returning a different
   * value for one or more properties (name, icon etc).
   */
  readonly onChange?: Event<LabelChangeEvent>;
  /**
   * whether this contribution can handle the given element and with what priority.
   * All contributions are ordered by the returned number if greater than zero. The highest number wins.
   * If two or more contributions return the same positive number one of those will be used. It is undefined which one.
   */
  canHandle: (uri: URI) => number;
  /**
   * returns an icon class for the given element.
   */
  getIcon?: (uri: URI) => string | undefined | React.ReactNode;

  /**
   * 自定义渲染 label
   */
  renderer?: (uri: URI, opt?: any) => React.ReactNode;

  /**
   * returns a short name for the given element.
   */
  getName?: (uri: URI) => string | undefined;

  /**
   * returns a long name for the given element.
   */
  getDescription?: (uri: URI) => string | undefined;

  /**
   * Check whether the given element is affected by the given change event.
   * Contributions delegating to the label provider can use this hook
   * to perform a recursive check.
   */
  affects?: (uri: URI, event: LabelChangeEvent) => boolean;
}
