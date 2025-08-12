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
   * The current node (if it is an icon, it will return its parent node)
   */
  node: FlowNodeEntity;
  /**
   * Is the node active?
   */
  activated: boolean;
  /**
   * Is the node expanded?
   */
  expanded: boolean;
  /**
   * Mouse entry, mainly used to control the activated state
   */
  onMouseEnter: (e: React.MouseEvent) => void;
  /**
   * The mouse leaves, mainly used to control the activated state
   */
  onMouseLeave: (e: React.MouseEvent) => void;

  /**
   * Render the form, which can only be used if the node engine is turned on
   */
  form: NodeFormProps<any> | undefined;

  /**
   * Get the extended data of the node
   */
  getExtInfo<T = any>(): T;

  /**
   * Update the extended data of the node
   * @param extInfo
   */
  updateExtInfo<T = any>(extInfo: T): void;

  /**
   * Expand/Collapse Nodes
   * @param expanded
   */
  toggleExpand(): void;
  /**
   * Global readonly state
   */
  readonly: boolean;
}

/**
 * Custom useNodeRender
 * Do not distinguish between blockIcon and inlineBlocks
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
