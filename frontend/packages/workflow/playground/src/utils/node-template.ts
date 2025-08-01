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
import { StandardNodeType } from '@coze-workflow/base';

import {
  type UnionNodeTemplate,
  type NodeTemplate,
  type PluginApiNodeTemplate,
  type PluginCategoryNodeTemplate,
  type SubWorkflowNodeTemplate,
} from '@/typing';

export const isPluginApiNodeTemplate = (
  nodeTemplate: unknown,
): nodeTemplate is PluginApiNodeTemplate =>
  Boolean(get(nodeTemplate, 'nodeJSON')) &&
  get(nodeTemplate, 'type') === StandardNodeType.Api;

export const isPluginCategoryNodeTemplate = (
  nodeTemplate: unknown,
): nodeTemplate is PluginCategoryNodeTemplate =>
  Boolean(get(nodeTemplate, 'categoryInfo'));

export const isSubWorkflowNodeTemplate = (
  nodeTemplate: unknown,
): nodeTemplate is SubWorkflowNodeTemplate =>
  Boolean(get(nodeTemplate, 'nodeJSON')) &&
  get(nodeTemplate, 'type') === StandardNodeType.SubWorkflow;

export const isNodeTemplate = (
  nodeTemplate: UnionNodeTemplate,
): nodeTemplate is NodeTemplate =>
  !isPluginApiNodeTemplate(nodeTemplate) &&
  !isPluginCategoryNodeTemplate(nodeTemplate) &&
  !isSubWorkflowNodeTemplate(nodeTemplate);
