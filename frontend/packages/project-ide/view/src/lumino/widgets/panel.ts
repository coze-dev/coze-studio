/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { Widget } from './widget';
import { PanelLayout } from './panellayout';

/**
 * A simple and convenient panel widget class.
 *
 * #### Notes
 * This class is suitable as a base class for implementing a variety of
 * convenience panel widgets, but can also be used directly with CSS to
 * arrange a collection of widgets.
 *
 * This class provides a convenience wrapper around a {@link PanelLayout}.
 */
export class Panel extends Widget {
  /**
   * Construct a new panel.
   *
   * @param options - The options for initializing the panel.
   */
  constructor(options: Panel.IOptions = {}) {
    super();
    this.addClass('lm-Panel');
    this.layout = Private.createLayout(options);
  }

  /**
   * A read-only array of the widgets in the panel.
   */
  get widgets(): ReadonlyArray<Widget> {
    return (this.layout as PanelLayout).widgets;
  }

  /**
   * Add a widget to the end of the panel.
   *
   * @param widget - The widget to add to the panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   */
  addWidget(widget: Widget): void {
    (this.layout as PanelLayout).addWidget(widget);
  }

  /**
   * Insert a widget at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into to the panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   */
  insertWidget(index: number, widget: Widget): void {
    (this.layout as PanelLayout).insertWidget(index, widget);
  }
}

/**
 * The namespace for the `Panel` class statics.
 */
export namespace Panel {
  /**
   * An options object for creating a panel.
   */
  export interface IOptions {
    /**
     * The panel layout to use for the panel.
     *
     * The default is a new `PanelLayout`.
     */
    layout?: PanelLayout;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Create a panel layout for the given panel options.
   */
  export function createLayout(options: Panel.IOptions): PanelLayout {
    return options.layout || new PanelLayout();
  }
}
