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

import { get } from 'lodash-es';
import { PluginType, StandardNodeType } from '@coze-workflow/base';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import {
  SETTING_ON_ERROR_DEFAULT_TIMEOUT,
  SETTING_ON_ERROR_MIN_TIMEOUT,
  SETTING_ON_ERROR_NODES_CONFIG,
} from '../constants';
import { WorkflowNodeData } from '../../entity-datas';

/**
 * Is it a side plug-in?
 * @param node
 * @returns
 */
const isLocalPlugin = (node?: WorkflowNodeEntity) => {
  if (!node) {
    return false;
  }

  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity?.getNodeData();

  return !!(
    node?.flowNodeType === StandardNodeType.Api &&
    get(nodeData, 'pluginType') === PluginType.LOCAL
  );
};

/**
 * Get node timeout configuration
 */
export const getTimeoutConfig = (
  node?: WorkflowNodeEntity,
): {
  max: number;
  default: number;
  min: number;
  init?: number;
  disabled: boolean;
} => {
  let timeoutConfig = SETTING_ON_ERROR_DEFAULT_TIMEOUT;

  if (
    node?.flowNodeType &&
    SETTING_ON_ERROR_NODES_CONFIG[node.flowNodeType]?.timeout
  ) {
    timeoutConfig = SETTING_ON_ERROR_NODES_CONFIG[node.flowNodeType].timeout;
  }

  return {
    ...timeoutConfig,
    min: SETTING_ON_ERROR_MIN_TIMEOUT,
    disabled: isLocalPlugin(node),
  };
};
