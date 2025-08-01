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

/* eslint-disable @coze-arch/no-batch-import-or-export */
export {
  ViewVariableType,
  VARIABLE_TYPE_ALIAS_MAP,
  type InputVariable,
  FILE_TYPES,
} from './view-variable-type';
export {
  type RecursedParamDefinition,
  ParamValueType,
} from './param-definition';
export {
  ViewVariableTreeNode,
  type ViewVariableMeta,
} from './view-variable-tree';
export {
  type DTODefine,
  ValueExpressionDTO,
  type InputValueDTO,
  VariableTypeDTO,
  AssistTypeDTO,
  type VariableMetaDTO,
  type BatchDTOInputList,
  type BatchDTO,
  type NodeDTO,
  type NodeDataDTO,
  type InputTypeValueDTO,
} from './dto';
export { BlockInput } from './block-input-dto';
export {
  type RefExpressionContent,
  ValueExpressionType,
  type LiteralExpression,
  type RefExpression,
  type ObjectRefExpression,
  ValueExpression,
  type InputValueVO,
  type OutputValueVO,
  BatchMode,
  type BatchVOInputList,
  type BatchVO,
  type InputTypeValueVO,
} from './vo';

export {
  StandardNodeType,
  NODE_ORDER,
  CONVERSATION_NODES,
  MESSAGE_NODES,
  CONVERSATION_HISTORY_NODES,
  type BasicStandardNodeTypes,
} from './node-type';
export { type WorkflowJSON, type WorkflowNodeJSON } from './node';
// ! Notice data-set.ts is using io-ts for runtime type checking, and direct export is prohibited to avoid io-ts being hit into other pages
// export { datasetParams, type DatasetParams } from './data-set';
import { InputType } from '@coze-arch/bot-api/developer_api';

import {
  VARIABLE_TYPE_ALIAS_MAP,
  ViewVariableType,
} from './view-variable-type';
import { AssistTypeDTO } from './dto';

export { type ValueOf, type WithCustomStyle } from './utils';
// Bumped with the back-end definition, comment
export { type WorkflowInfo as FrontWorkflowInfo } from './workflow';

export {
  type WorkflowNodeRegistry,
  WorkflowNodeVariablesMeta,
  type NodeMeta,
} from './registry';

/**
 * Parameter type display copy
 * @Tips workflow edit page please use {PARAM_TYPE_ALIAS_MAP}
 */
export const PARAM_TYPE_LABEL_MAP: Record<InputType, string> = {
  [InputType.String]: 'String',
  [InputType.Integer]: 'Integer',
  [InputType.Boolean]: 'Boolean',
  [InputType.Double]: 'Double',
  [InputType.List]: 'List',
  [InputType.Object]: 'Object',
};

export const STRING_ASSIST_TYPE_LABEL_MAP = {
  [AssistTypeDTO.file]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.File],
  [AssistTypeDTO.image]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Image],
  [AssistTypeDTO.doc]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Doc],
  [AssistTypeDTO.code]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Code],
  [AssistTypeDTO.ppt]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Ppt],
  [AssistTypeDTO.txt]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Txt],
  [AssistTypeDTO.excel]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Excel],
  [AssistTypeDTO.audio]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Audio],
  [AssistTypeDTO.zip]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Zip],
  [AssistTypeDTO.video]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Video],
  [AssistTypeDTO.svg]: VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.Svg],
};

export enum WorkflowExecStatus {
  DEFAULT = 'default',
  /** in progress */
  EXECUTING = 'executing',
  /** End of execution (there is still an end of execution banner at this time, and the workflow is disabled) */
  DONE = 'done',
}

export * from './llm';

export {
  type WorkflowDatabase,
  type DatabaseField,
  type DatabaseSettingField,
  type DatabaseSettingFieldDTO,
  type DatabaseCondition,
  type DatabaseConditionOperator,
  type DatabaseConditionLeft,
  type DatabaseConditionRight,
  type DatabaseConditionDTO,
} from './database';

export {
  ConditionLogic,
  type ConditionOperator,
  ConditionLogicDTO,
} from './condition';
