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
 
/**
 * 这个模块是干什么的
 * 在 workflow 的 node 模型中，默认对于数据的存储只有表单，即 formMeta。这部分数据实际上代表的是提交给后端用来做 workflow 运行的数据
 * 然而实际业务场景中，我们需要的不仅是提交给后端用来做运行的数据，还有一些前端业务场景下需要消费，而后端用不到的数据。比如：
 *  1. api 节点的 spaceId、发布状态
 *  2. 子流程节点的 spaceId、发布状态
 * 所以这个模块增加一个 NodeData 实体，来管理每一个node 上的一些数据，让业务层消费使用
 */
import { EntityData } from '@flowgram-adapter/free-layout-editor';

import { type EditAbleNodeData, type NodeData } from './types';

export class WorkflowNodeData extends EntityData {
  private nodeData;

  private hasSetNodeData = false;

  init() {
    this.hasSetNodeData = false;
    this.nodeData = undefined;
  }

  getDefaultData() {
    return undefined;
  }

  /**
   *
   * @param data
   * 设置节点上除form之外的数据
   * 泛型必须传入节点类型 StandardNodeType
   */
  setNodeData<T extends keyof NodeData = never>(data: NodeData[T]) {
    if (this.hasSetNodeData) {
      // 撤销重做时会重复设置，没必要报错
      console.warn(`node ${this.entity.id} has already set WorkflowNodeData`);
      return;
    }

    this.nodeData = { ...data };
    this.hasSetNodeData = true;
  }

  /**
   *
   * @param data
   * 更新数据，只放非readonly字段的更新
   * 泛型必须传入节点类型 StandardNodeType
   */
  updateNodeData<T extends keyof NodeData = never>(
    data: Partial<EditAbleNodeData<T>>,
  ) {
    this.nodeData = { ...this.nodeData, ...data };
  }
  /**
   *
   * @returns
   * 获取节点上除form之外的数据
   */
  getNodeData<T extends keyof NodeData>(): NodeData[T] {
    return this.nodeData;
  }
}
