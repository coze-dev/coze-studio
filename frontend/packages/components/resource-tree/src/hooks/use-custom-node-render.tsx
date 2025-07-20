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
 
import { useCallback, useContext, useMemo } from 'react';

import {
  usePlayground,
  type FlowNodeEntity,
  FlowNodeRenderData,
  PlaygroundEntityContext,
  type NodeFormProps,
  getNodeForm,
} from '@flowgram-adapter/fixed-layout-editor';
import { useObserve } from '@flowgram-adapter/common';

import { getStoreNode } from '../utils';

export interface NodeRenderReturnType {
  /**
   * 当前节点 (如果是 icon 则会返回它的父节点)
   */
  node: FlowNodeEntity;
  /**
   * 节点是否激活
   */
  activated: boolean;
  /**
   * 节点是否展开
   */
  expanded: boolean;
  /**
   * 鼠标进入, 主要用于控制 activated 状态
   */
  onMouseEnter: (e: React.MouseEvent) => void;
  /**
   * 鼠标离开, 主要用于控制 activated 状态
   */
  onMouseLeave: (e: React.MouseEvent) => void;

  /**
   * 渲染表单，只有节点引擎开启才能使用
   */
  form: NodeFormProps<any> | undefined;

  /**
   * 获取节点的扩展数据
   */
  getExtInfo<T = any>(): T;

  /**
   * 更新节点的扩展数据
   * @param extInfo
   */
  updateExtInfo<T = any>(extInfo: T): void;

  /**
   * 展开/收起节点
   * @param expanded
   */
  toggleExpand(): void;
  /**
   * 全局 readonly 状态
   */
  readonly: boolean;
}

/**
 * 自定义 useNodeRender
 * 不区分 blockIcon 和 inlineBlocks
 */
export function useCustomNodeRender(
  nodeFromProps?: FlowNodeEntity,
): NodeRenderReturnType {
  const ctx = useContext<FlowNodeEntity>(PlaygroundEntityContext);
  const renderNode = nodeFromProps || ctx;
  const renderData =
    renderNode.getData<FlowNodeRenderData>(FlowNodeRenderData)!;
  const { node } = getStoreNode(renderNode);
  const { expanded, activated } = renderData;
  const playground = usePlayground();

  const onMouseEnter = useCallback(() => {
    renderData.toggleMouseEnter();
  }, [renderData]);

  const onMouseLeave = useCallback(() => {
    renderData.toggleMouseLeave();
  }, [renderData]);

  const toggleExpand = useCallback(() => {
    renderData.toggleExpand();
  }, [renderData]);

  const getExtInfo = useCallback(() => node.getExtInfo() as any, [node]);
  const updateExtInfo = useCallback(
    (data: any) => {
      node.updateExtInfo(data);
    },
    [node],
  );
  const form = useMemo(() => getNodeForm(node), [node]);
  // Listen FormState change
  const formState = useObserve<any>(form?.state);

  const { readonly } = playground.config;

  return useMemo(
    () => ({
      node,
      activated,
      readonly,
      expanded,
      onMouseEnter,
      onMouseLeave,
      getExtInfo,
      updateExtInfo,
      toggleExpand,
      get form() {
        if (!form) {
          return undefined;
        }
        return {
          ...form,
          get values() {
            return form.values!;
          },
          get state() {
            return formState;
          },
        };
      },
    }),
    [
      node,
      activated,
      readonly,
      expanded,
      onMouseEnter,
      onMouseLeave,
      getExtInfo,
      updateExtInfo,
      toggleExpand,
      form,
      formState,
    ],
  );
}
