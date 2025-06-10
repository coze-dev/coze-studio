// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { type ISignal, Signal } from '../signaling';
import { type Widget } from './widget';
import { StackedLayout } from './stackedlayout';
import { Panel } from './panel';

/**
 * A panel where visible widgets are stacked atop one another.
 *
 * #### Notes
 * This class provides a convenience wrapper around a {@link StackedLayout}.
 */
export class StackedPanel extends Panel {
  /**
   * Construct a new stacked panel.
   *
   * @param options - The options for initializing the panel.
   */
  constructor(options: StackedPanel.IOptions = {}) {
    super({ layout: Private.createLayout(options) });
    this.addClass('lm-StackedPanel');
  }

  /**
   * The method for hiding widgets.
   *
   * #### Notes
   * If there is only one child widget, `Display` hiding mode will be used
   * regardless of this setting.
   */
  get hiddenMode(): Widget.HiddenMode {
    return (this.layout as StackedLayout).hiddenMode;
  }

  /**
   * Set the method for hiding widgets.
   *
   * #### Notes
   * If there is only one child widget, `Display` hiding mode will be used
   * regardless of this setting.
   */
  set hiddenMode(v: Widget.HiddenMode) {
    (this.layout as StackedLayout).hiddenMode = v;
  }

  /**
   * A signal emitted when a widget is removed from a stacked panel.
   */
  get widgetRemoved(): ISignal<this, Widget> {
    return this._widgetRemoved;
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: Widget.ChildMessage): void {
    msg.child.addClass('lm-StackedPanel-child');
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    msg.child.removeClass('lm-StackedPanel-child');
    this._widgetRemoved.emit(msg.child);
  }

  private _widgetRemoved = new Signal<this, Widget>(this);
}

/**
 * The namespace for the `StackedPanel` class statics.
 */
export namespace StackedPanel {
  /**
   * An options object for creating a stacked panel.
   */
  export interface IOptions {
    /**
     * The stacked layout to use for the stacked panel.
     *
     * The default is a new `StackedLayout`.
     */
    layout?: StackedLayout;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Create a stacked layout for the given panel options.
   */
  export function createLayout(options: StackedPanel.IOptions): StackedLayout {
    return options.layout || new StackedLayout();
  }
}
