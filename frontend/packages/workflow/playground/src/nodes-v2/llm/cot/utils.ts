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

import { nanoid } from '@flowgram-adapter/free-layout-editor';
import {
  ViewVariableType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { type WorkflowModelsService } from '@/services';

import { REASONING_CONTENT_NAME } from './constants';

const readonlyTooltip = I18n.t(
  'workflow_250217_02',
  undefined,
  '推理内容，支持输出思维链的模型特有',
);

interface ViewVariableTreeNodeWithReadonly extends ViewVariableTreeNode {
  readonly?: boolean;
  readonlyTooltip?: string;
}

const generateReasoningContent = () => ({
  key: nanoid(),
  name: REASONING_CONTENT_NAME,
  type: ViewVariableType.String,
  readonly: true,
  readonlyTooltip,
});

const isReasoningContent = (node: ViewVariableTreeNodeWithReadonly) =>
  node.name === REASONING_CONTENT_NAME;

export const isSystemReasoningContent = (
  node: ViewVariableTreeNodeWithReadonly,
) => !!(isReasoningContent(node) && node.readonly);

const excludeReasoningContent = (nodes?: ViewVariableTreeNode[]) =>
  (nodes ?? []).filter(node => !isSystemReasoningContent(node));

const includeReasoningContent = (nodes?: ViewVariableTreeNode[]) =>
  (nodes ?? []).filter(node => isSystemReasoningContent(node));

const addReasoningContent = (
  value?: ViewVariableTreeNode[],
  isBatch?: boolean,
) => {
  if (!value) {
    return value;
  }

  if (isBatch) {
    return [
      {
        ...value[0],
        children: [
          ...excludeReasoningContent(value[0]?.children),
          generateReasoningContent(),
        ],
      },
    ];
  }

  return [...excludeReasoningContent(value), generateReasoningContent()];
};

const removeReasoningContent = (
  value?: ViewVariableTreeNode[],
  isBatch?: boolean,
) => {
  if (!value) {
    return value;
  }
  if (isBatch) {
    const [one, ...rest] = value;
    return [
      {
        ...one,
        children: excludeReasoningContent(one?.children),
      },
      ...rest,
    ];
  } else {
    return [...excludeReasoningContent(value)];
  }
};

function findReasoningContent(
  outputs: ViewVariableTreeNodeWithReadonly[] | undefined,
  isBatch: boolean,
  fn: (node) => boolean,
): ViewVariableTreeNodeWithReadonly | undefined {
  if (!outputs) {
    return undefined;
  }

  if (isBatch) {
    return outputs[0]?.children?.find(node => fn(node));
  }
  return outputs.find(node => fn(node));
}

/**
 * Output attribute sort to ensure that the reasoning content is at the bottom
 */
export const sortOutputs = (
  value: ViewVariableTreeNode[] | undefined,
  isBatch?: boolean,
) => {
  if (!value) {
    return value;
  }

  if (isBatch) {
    const [one, ...rest] = value;
    return [
      {
        ...one,
        children: [
          ...excludeReasoningContent(one?.children),
          ...includeReasoningContent(one?.children),
        ],
      },
      ...rest,
    ];
  }
  return [...excludeReasoningContent(value), ...includeReasoningContent(value)];
};

/**
 * Get output based on model type
 * @param modelType
 * @param outputs
 * @param isBatch
 * @returns
 */
export function getOutputs({
  modelType,
  outputs,
  isBatch,
  modelsService,
}: {
  modelType: number | undefined;
  outputs: ViewVariableTreeNode[] | undefined;
  isBatch: boolean;
  modelsService: WorkflowModelsService;
}) {
  if (!modelType) {
    return outputs;
  }

  if (modelsService.isCoTModel(modelType)) {
    outputs = addReasoningContent(outputs, isBatch);
  } else {
    outputs = removeReasoningContent(outputs, isBatch);
  }
  return outputs;
}

/**
 * Format inference content as read-only during initialization
 * @param outputs
 * @param isBatch
 * @returns
 */
export function formatReasoningContentOnInit({
  outputs,
  isBatch,
  modelType,
  modelsService,
}: {
  outputs: ViewVariableTreeNode[] | undefined;
  isBatch: boolean;
  modelType?: number;
  modelsService: WorkflowModelsService;
}) {
  if (!outputs) {
    return outputs;
  }

  let newOutputs: ViewVariableTreeNode[] | undefined = outputs;
  if (modelType && modelsService.isCoTModel(modelType)) {
    // There is no readonly field returned by the backend, which needs to be processed by the front end. Take the first type that is string reasoning_content
    const reasoningContent = findReasoningContent(
      outputs,
      isBatch,
      item => isReasoningContent(item) && item.type === ViewVariableType.String,
    );
    if (reasoningContent) {
      reasoningContent.readonly = true;
      reasoningContent.readonlyTooltip = readonlyTooltip;
    } else {
      // The existing data is compatible, if it is an inference model, add the inference content field
      newOutputs = addReasoningContent(outputs, isBatch);
    }
  }

  return newOutputs;
}

/**
 * Format inference content on commit Remove readonly
 * @param outputs
 * @param isBatch
 * @returns
 */
export function formatReasoningContentOnSubmit(
  outputs: ViewVariableTreeNodeWithReadonly[] | undefined,
  isBatch: boolean,
) {
  if (!outputs) {
    return outputs;
  }

  const reasoningContent = findReasoningContent(
    outputs,
    isBatch,
    isSystemReasoningContent,
  );
  if (reasoningContent?.readonly) {
    delete reasoningContent.readonly;
  }

  if (reasoningContent?.readonlyTooltip) {
    delete reasoningContent.readonlyTooltip;
  }

  return outputs;
}

/**
 * Remove the reasoning_content in outputs for readonly
 */
export const omitSystemReasoningContent = (
  value: ViewVariableTreeNodeWithReadonly[] | undefined,
  isBatch?: boolean,
) => {
  // Batch, remove from children, for readonly reasoning_content
  if (isBatch) {
    return value?.map(v => ({
      ...v,
      children: v?.children?.filter(c => !isSystemReasoningContent(c)),
    }));
  }
  // Single, remove the reasoning_content in value for readonly
  return value?.filter(v => !isSystemReasoningContent(v));
};
