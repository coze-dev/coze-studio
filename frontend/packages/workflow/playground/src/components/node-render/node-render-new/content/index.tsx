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

import { StandardNodeType, useWorkflowNode } from '@coze-workflow/base';

import { VariableContent } from '@/node-registries/variable';
import { TriggerUpsertContent } from '@/node-registries/trigger-upsert';
import { TriggerReadContent } from '@/node-registries/trigger-read';
import { TriggerDeleteContent } from '@/node-registries/trigger-delete';
import { SubWorkflowContent as SubWorkflowContentV2 } from '@/node-registries/sub-workflow';
import { StartContent } from '@/node-registries/start';
import { SetVariableContent } from '@/node-registries/set-variable';
import { PluginContent } from '@/node-registries/plugin';
import { OutputContent } from '@/node-registries/output';
import { LtmContent } from '@/node-registries/ltm';
import { LoopContent } from '@/node-registries/loop';
import { JsonStringifyContent } from '@/node-registries/json-stringify';
import { IntentContent } from '@/node-registries/intent';
import { InputContent } from '@/node-registries/input';
import { ImageCanvasContent } from '@/node-registries/image-canvas';
import { IfContent } from '@/node-registries/if';
import { EndContent } from '@/node-registries/end';
import { ContinueContent } from '@/node-registries/continue';
import { CodeContent } from '@/node-registries/code';
import { BreakContent } from '@/node-registries/break';
import { BatchContent } from '@/node-registries/batch';

import { ExceptionField } from '../fields/exception-field';
import { VariableMergeContent } from './variable-merge-content';
import { VariableAssignContent } from './variable-assign-content';
import { QuestionContent } from './question-content';
import { LLMContent } from './llm-content';
import { DatasetContent } from './knowledge-content';
import { ImageGenerateContent } from './image-generate-content';
import { HttpContent } from './http-content';
import { DatabaseUpdateContent } from './database-update-content';
import { DatabaseQueryContent } from './database-query-content';
import { DatabaseDeleteContent } from './database-delete-content';
import { DatabaseCreateContent } from './database-create-content';
import { DatabaseContent } from './database-content';
import { CommonContent } from './common-content';
// CLI script insert ID (import), do not modify/delete this line comment

import styles from './index.module.less';

const ContentMap = {
  [StandardNodeType.Start]: StartContent,
  [StandardNodeType.End]: EndContent,
  [StandardNodeType.If]: IfContent,
  [StandardNodeType.Intent]: IntentContent,
  [StandardNodeType.SubWorkflow]: SubWorkflowContentV2,
  [StandardNodeType.Dataset]: DatasetContent,
  [StandardNodeType.DatasetWrite]: DatasetContent,
  [StandardNodeType.Question]: QuestionContent,
  [StandardNodeType.Output]: OutputContent,
  [StandardNodeType.LLM]: LLMContent,
  [StandardNodeType.Loop]: LoopContent,
  [StandardNodeType.Break]: BreakContent,
  [StandardNodeType.Continue]: ContinueContent,
  [StandardNodeType.SetVariable]: SetVariableContent,
  [StandardNodeType.Batch]: BatchContent,
  [StandardNodeType.ImageGenerate]: ImageGenerateContent,
  [StandardNodeType.Input]: InputContent,
  [StandardNodeType.Database]: DatabaseContent,
  [StandardNodeType.VariableMerge]: VariableMergeContent,
  [StandardNodeType.VariableAssign]: VariableAssignContent,
  [StandardNodeType.Http]: HttpContent,
  [StandardNodeType.DatabaseCreate]: DatabaseCreateContent,
  [StandardNodeType.DatabaseDelete]: DatabaseDeleteContent,
  [StandardNodeType.DatabaseUpdate]: DatabaseUpdateContent,
  [StandardNodeType.DatabaseQuery]: DatabaseQueryContent,
  [StandardNodeType.LTM]: LtmContent,
  [StandardNodeType.Code]: CodeContent,
  [StandardNodeType.TriggerUpsert]: TriggerUpsertContent,
  [StandardNodeType.ImageCanvas]: ImageCanvasContent,
  [StandardNodeType.TriggerDelete]: TriggerDeleteContent,
  [StandardNodeType.TriggerRead]: TriggerReadContent,
  [StandardNodeType.Api]: PluginContent,
  [StandardNodeType.Variable]: VariableContent,
  [StandardNodeType.JsonStringify]: JsonStringifyContent,
  // The cli script inserts the identifier (registry), do not modify/delete this line comment
};

/**
 * Node content area
 */
export function Content() {
  const { type } = useWorkflowNode();
  const NodeContent = ContentMap[type] || CommonContent;

  return (
    <div className={styles.wrapper}>
      <NodeContent />
      <ExceptionField />
    </div>
  );
}
