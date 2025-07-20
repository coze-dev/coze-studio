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
    // 画布基础层，提供缩放、手势等能力
    registry.registerLayer(PlaygroundLayer, {
      hoverService: this.hoverService,
    });
    registry.registerLayers(
      FlowNodesContentLayer,
      // FlowScrollLimitLayer, // 控制滚动范围
      FlowScrollBarLayer, // 滚动条
      HoverLayer, // 控制hover
      ShortcutsLayer, // 快捷键配置
    );
    // 线条
    registry.registerLayer(WorkflowLinesLayer, {
      renderElement: () => this.stackingContext.node,
    });
    // 节点位置
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
        // 需满足以下条件：
        // 1. 非左键不能触发框选
        if (event.button !== 0) {
          return false;
        }
        const element = event.target as Element;
        // 2. 没有元素不能触发框选
        if (!element) {
          return false;
        }
        // 3. 如存在自定义配置，以配置为准
        if (element) {
          if (element.closest('[data-flow-editor-selectable="true"]')) {
            return true;
          }
          if (element.closest('[data-flow-editor-selectable="false"]')) {
            return false;
          }
        }
        // 4. hover 到节点或者线条不能触发框选
        if (this.hoverService.isSomeHovered()) {
          return false;
        }
        // 5. 未处于画布内不能触发框选
        if (
          !element.classList.contains('gedit-playground-layer') &&
          !element.classList.contains('gedit-flow-background-layer') &&
          // 连线的空白区域
          !element.closest('.gedit-flow-activity-edge')
        ) {
          return false;
        }
        return true;
      },
    });
    // 调试画布
    if (location.search.match('playground_debug')) {
      registry.registerLayers(FlowDebugLayer);
    }
    // 背景最后插入，因为里边会调整位置
    registry.registerLayer(BackgroundLayer);
  }

  /**
   * 这个用于阻止 document.body 的手势缩放
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
