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

import { set } from 'lodash-es';
import {
  type NodeContext,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import {
  settingOnErrorInit,
  settingOnErrorSave,
  isSettingOnError,
  isSettingOnErrorV2,
} from '@coze-workflow/nodes';
import {
  type StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { settingOnErrorValidate } from '@/nodes-v2/materials/setting-on-error-validate';

const updateNodeValidate = (node: WorkflowNodeRegistry) => {
  set(node, 'formMeta.validate.settingOnError', settingOnErrorValidate);
  return node;
};

const updateNodePorts = (node: WorkflowNodeRegistry) => {
  if (!isSettingOnErrorV2(node.type as StandardNodeType)) {
    return node;
  }

  const meta = node.meta || {};

  // It needs to be transformed into a dynamic channel.
  if (!meta.useDynamicPort) {
    set(node, 'meta', {
      ...meta,
      ...{
        useDynamicPort: true,
        defaultPorts: [{ type: 'input' }, { type: 'output' }],
      },
    });
  }

  return node;
};

const updateNodeFormat = (node: WorkflowNodeRegistry) => {
  const formMeta = node.formMeta as FormMetaV2;
  const formatOnInit = formMeta?.formatOnInit;
  const formatOnSubmit = formMeta?.formatOnSubmit;

  set(node, 'formMeta.formatOnInit', (value, context: NodeContext) => {
    const formated = formatOnInit ? formatOnInit(value, context) : value;

    // Null value returned directly
    if (!formated) {
      return formated;
    }

    return {
      ...formated,
      ...settingOnErrorInit(value, context),
    };
  });

  set(node, 'formMeta.formatOnSubmit', (_value, context: NodeContext) => {
    const value = { ..._value };
    const formated = formatOnSubmit ? formatOnSubmit(value, context) : value;
    set(
      formated,
      'inputs.settingOnError',
      settingOnErrorSave(value, context).settingOnError,
    );
    return formated;
  });
  return node;
};

export const withSettingOnError = (
  node: WorkflowNodeRegistry,
): WorkflowNodeRegistry => {
  if (!isSettingOnError(node.type as StandardNodeType)) {
    return node;
  }

  updateNodeValidate(node);
  updateNodeFormat(node);
  updateNodePorts(node);

  return node;
};
