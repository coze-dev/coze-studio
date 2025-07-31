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

import { StandardNodeType } from '@coze-workflow/base';

// All nodes are available by default and can be customized.
export const getEnabledNodeTypes = (_params: {
  loopSelected: boolean;
  isProject: boolean;
  isSupportImageflowNodes: boolean;
  isSceneFlow: boolean;
  isBindDouyin: boolean;
}) => {
  const { loopSelected } = _params;
  const nodesMap = {
    [StandardNodeType.LLM]: true,
    [StandardNodeType.Api]: true,
    [StandardNodeType.Code]: true,
    [StandardNodeType.Dataset]: true,
    [StandardNodeType.If]: true,
    [StandardNodeType.SubWorkflow]: true,
    [StandardNodeType.Database]: true,
    [StandardNodeType.Output]: true,
    [StandardNodeType.Text]: true,
    [StandardNodeType.Question]: true,
    [StandardNodeType.Break]: loopSelected,
    [StandardNodeType.SetVariable]: loopSelected,
    [StandardNodeType.Continue]: loopSelected,
    [StandardNodeType.Loop]: true,
    [StandardNodeType.Intent]: true,
    [StandardNodeType.DatasetWrite]: true,
    [StandardNodeType.Batch]: true,
    [StandardNodeType.Input]: true,
    [StandardNodeType.Comment]: true,
    [StandardNodeType.VariableMerge]: true,
    // [StandardNodeType.QueryMessageList]: true,
    // [StandardNodeType.ClearContext]: true,
    // [StandardNodeType.CreateConversation]: true,
    [StandardNodeType.VariableAssign]: true,
    [StandardNodeType.Http]: true,
    [StandardNodeType.DatabaseUpdate]: true,
    [StandardNodeType.DatabaseQuery]: true,
    [StandardNodeType.DatabaseDelete]: true,
    [StandardNodeType.DatabaseCreate]: true,
    // [StandardNodeType.JsonParser]: true,
    [StandardNodeType.JsonStringify]: true,
    // [StandardNodeType.UpdateConversation]: true,
    // [StandardNodeType.DeleteConversation]: true,
    // [StandardNodeType.QueryConversationList]: true,
    // [StandardNodeType.QueryConversationHistory]: true,
    // [StandardNodeType.CreateMessage]: true,
    // [StandardNodeType.UpdateMessage]: true,
    // [StandardNodeType.DeleteMessage]: true,
  };
  const enabledNodeTypes: StandardNodeType[] = Object.keys(nodesMap)
    .filter(key => nodesMap[key])
    .map(key => key as StandardNodeType);

  return enabledNodeTypes;
};
