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

import { inject, injectable } from 'inversify';
import { type URI } from '@coze-project-ide/core';

import { WidgetManager } from '../widget-manager';
import { type ReactWidget } from '../widget/react-widget';
import { ViewRenderer } from '../view-renderer';
import { ApplicationShell } from '../shell';
import { Drag } from '../lumino/dragdrop';
import { MimeData } from '../lumino/coreutils';

export interface DragPropsType {
  /**
   * Drag and drop to open the split-screen URI.
   */
  uris: URI[];
  /**
   * StartDrag event location data
   */
  position: {
    clientX: number;
    clientY: number;
  };
  /**
   * Drag and drop elements to echo, no transmission or display
   */
  dragImage?: HTMLElement;
  /**
   * Callback after dragging is complete
   * action: 'move' | 'copy' | 'link' | 'none'
   */
  callback: (action: Drag.DropAction) => void;
  backdropTransform?: Drag.BackDropTransform;
}

/**
 * DragService is mainly used for split-screen operation
 */
@injectable()
export class DragService {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(WidgetManager) widgetManager: WidgetManager;

  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  /**
   * Manually drag and drop on the business side to trigger the split screen (drag the sidebar file tree into the start split screen)
   */
  startDrag({
    uris,
    position,
    dragImage,
    callback,
    backdropTransform,
  }: DragPropsType) {
    const { clientX, clientY } = position;
    const mimeData = new MimeData();
    const factory = async () => {
      const widgets: ReactWidget[] = [];
      await Promise.all(
        uris.map(async uri => {
          const factory = this.widgetManager.getFactoryFromURI(uri)!;
          const widget = await this.widgetManager.getOrCreateWidgetFromURI(
            uri,
            factory,
          );
          this.viewRenderer.addReactPortal(widget);
          widgets.push(widget);
        }),
      );
      return widgets;
    };
    mimeData.setData('application/vnd.lumino.widget-factory', factory);
    const drag = new Drag({
      document,
      mimeData,
      dragImage,
      proposedAction: 'move',
      supportedActions: 'move',
      /**
       * Only supports split screen in the main panel area
       */
      source: this.shell.mainPanel,
      backdropTransform,
    });
    drag.start(clientX, clientY).then(callback);
  }
}
