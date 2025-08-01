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
import { Gesture } from '@use-gesture/vanilla';
import {
  FlowDebugLayer,
  FlowNodesContentLayer,
  FlowNodesTransformLayer,
  FlowScrollBarLayer,
  FlowSelectorBoundsLayer,
  FlowSelectorBoxLayer,
  type FlowRendererContribution,
  type FlowRendererRegistry,
} from '@flowgram-adapter/free-layout-editor';
import { StackingContextManager } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowBezierLineContribution,
  WorkflowFoldLineContribution,
  WorkflowLinesLayer,
} from '@flowgram-adapter/free-layout-editor';
import {
  PlaygroundLayer,
  type PlaygroundContribution,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowHoverService,
  WorkflowLinesManager,
} from '@flowgram-adapter/free-layout-editor';

import { BackgroundLayer, HoverLayer, ShortcutsLayer } from './layer';
import { SelectorBounds } from './components/selector-bounds';

@injectable()
export class WorkflowRenderContribution
  implements FlowRendererContribution, PlaygroundContribution
{
  @inject(WorkflowHoverService) protected hoverService: WorkflowHoverService;
  @inject(StackingContextManager)
  protected stackingContext: StackingContextManager;
  @inject(WorkflowLinesManager)
  protected linesManager: WorkflowLinesManager;

  registerRenderer(registry: FlowRendererRegistry): void {
    // Canvas base layer, providing zoom, gesture, and more
    registry.registerLayer(PlaygroundLayer, {
      hoverService: this.hoverService,
    });
    registry.registerLayers(
      FlowNodesContentLayer,
      // FlowScrollLimitLayer,//control scrolling range
      FlowScrollBarLayer, // scroll bar
      HoverLayer, // Control hover
      ShortcutsLayer, // Shortcut configuration
    );
    // line
    registry.registerLayer(WorkflowLinesLayer, {
      renderElement: () => this.stackingContext.node,
    });
    // Node location
    registry.registerLayer(FlowNodesTransformLayer, {
      renderElement: () => this.stackingContext.node,
    });
    registry.registerLayer<FlowSelectorBoundsLayer>(FlowSelectorBoundsLayer, {
      disableBackground: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      CustomBoundsRenderer: SelectorBounds as any,
    });
    registry.registerLayer<FlowSelectorBoxLayer>(FlowSelectorBoxLayer, {
      canSelect: (event, entity) => {
        // The following conditions must be met:
        // 1. Non-left button cannot trigger box selection
        if (event.button !== 0) {
          return false;
        }
        const element = event.target as Element;
        // 2. No element can trigger the box selection
        if (!element) {
          return false;
        }
        // 3. If there is a custom configuration, the configuration shall prevail.
        if (element) {
          if (element.closest('[data-flow-editor-selectable="true"]')) {
            return true;
          }
          if (element.closest('[data-flow-editor-selectable="false"]')) {
            return false;
          }
        }
        // 4. Hovering to nodes or lines cannot trigger box selection
        if (this.hoverService.isSomeHovered()) {
          return false;
        }
        // 5. Cannot trigger box selection without being in the canvas
        if (
          !element.classList.contains('gedit-playground-layer') &&
          !element.classList.contains('gedit-flow-background-layer') &&
          // Blank space for connection
          !element.closest('.gedit-flow-activity-edge')
        ) {
          return false;
        }
        return true;
      },
    });
    // Debug Canvas
    if (location.search.match('playground_debug')) {
      registry.registerLayers(FlowDebugLayer);
    }
    // The background is inserted at the end, because the position will be adjusted inside.
    registry.registerLayer(BackgroundLayer);
  }

  /**
   * This is used to prevent gesture scaling of document.body
   * @private
   */
  private _gestureForStopDefault = new Gesture(document.body, {
    onPinch: () => {
      // Do nothing
    },
  });
  onReady(): void {
    if (document.documentElement) {
      document.documentElement.style.overscrollBehavior = 'none';
    }
    document.body.style.overscrollBehavior = 'none';
    this.linesManager
      .registerContribution(WorkflowBezierLineContribution)
      .registerContribution(WorkflowFoldLineContribution);
  }

  onDispose() {
    this._gestureForStopDefault.destroy();
  }
}
