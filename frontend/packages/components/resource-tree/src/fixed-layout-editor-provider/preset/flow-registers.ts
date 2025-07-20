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
 
import { injectable } from 'inversify';
import {
  FlowNodesContentLayer,
  FlowNodesTransformLayer,
  type FlowRendererContribution,
  type FlowRendererRegistry,
  FlowScrollBarLayer,
  FlowScrollLimitLayer,
  type FlowDocument,
  type FlowDocumentContribution,
  FlowNodeRenderData,
  FlowNodeTransformData,
  FlowNodeTransitionData,
  PlaygroundLayer,
  FixedLayoutRegistries,
} from '@flowgram-adapter/fixed-layout-editor';

import { FlowLinesLayer } from '../../layers';

@injectable()
export class FlowRegisters
  implements FlowDocumentContribution, FlowRendererContribution
{
  /**
   * 注册数据层
   * @param document
   */
  registerDocument(document: FlowDocument) {
    /**
     * 注册节点 (ECS - Entity)
     */
    document.registerFlowNodes(
      // 等待简化
      FixedLayoutRegistries.RootRegistry, // 根节点
      FixedLayoutRegistries.StartRegistry, // 开始节点
      FixedLayoutRegistries.DynamicSplitRegistry, // 动态分支（并行、排他）
      FixedLayoutRegistries.BlockRegistry, // 单条 block 注册
      FixedLayoutRegistries.InlineBlocksRegistry, // 多个 block 组成的 block 列表
      FixedLayoutRegistries.BlockIconRegistry, // icon 节点，如条件分支的菱形图标
      // FixedLayoutRegistries.EndRegistry, // 结束节点
      FixedLayoutRegistries.EmptyRegistry, // 占位节点
    );
    /**
     * 注册节点数据 (ECS - Component)
     */
    document.registerNodeDatas(
      FlowNodeRenderData, // 渲染节点相关数据
      FlowNodeTransitionData, // 线条绘制数据
      FlowNodeTransformData, // 坐标计算数据
    );
  }

  /**
   * 注册渲染层
   * @param renderer
   */
  registerRenderer(renderer: FlowRendererRegistry) {
    /**
     * 注册 layer (ECS - System)
     */
    renderer.registerLayers(
      FlowNodesTransformLayer, // 节点位置渲染
      FlowNodesContentLayer, // 节点内容渲染
      FlowLinesLayer, // 线条渲染
      // FlowLabelsLayer, // Label 渲染
      PlaygroundLayer, // 画布基础层，提供缩放、手势等能力
      FlowScrollLimitLayer, // 控制滚动范围
      FlowScrollBarLayer, // 滚动条
    );
  }
}
