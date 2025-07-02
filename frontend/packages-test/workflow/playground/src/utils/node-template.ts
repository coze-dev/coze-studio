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
