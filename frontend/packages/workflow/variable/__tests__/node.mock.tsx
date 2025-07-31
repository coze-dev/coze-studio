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

import React from 'react';

import { createEffectFromVariableProvider } from 'src/utils/variable-provider';
import { provideNodeOutputVariables } from 'src/form-extensions/variable-providers/provide-node-output-variables';
import { provideLoopOutputsVariables } from 'src/form-extensions/variable-providers/provide-loop-output-variables';
import { provideLoopInputsVariables } from 'src/form-extensions/variable-providers/provide-loop-input-variables';
import { provideMergeGroupVariablesEffect } from 'src';
import { injectable } from 'inversify';
import {
  type WorkflowDocument,
  type FlowDocumentContribution,
} from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base/types';

@injectable()
export class MockNodeRegistry implements FlowDocumentContribution {
  registerDocument(document: WorkflowDocument): void {
    // Register Nodes
    document.registerFlowNodes({
      type: StandardNodeType.LLM,
      formMeta: {
        render: () => <div></div>,
        effect: {
          outputs: createEffectFromVariableProvider(provideNodeOutputVariables),
        },
      },
    });

    document.registerFlowNodes({
      type: StandardNodeType.Start,
      formMeta: {
        render: () => <div></div>,
        effect: {
          outputs: createEffectFromVariableProvider(provideNodeOutputVariables),
        },
      },
    });

    document.registerFlowNodes({
      type: StandardNodeType.End,
      // getNodeInputParameters: () => [...allEndRefInputs, ...allConstantInputs],
      formMeta: {
        render: () => <div></div>,
      },
    });

    document.registerFlowNodes({
      type: StandardNodeType.Loop,
      formMeta: {
        render: () => <div></div>,
        effect: {
          inputs: createEffectFromVariableProvider(provideLoopInputsVariables),
          outputs: createEffectFromVariableProvider(
            provideLoopOutputsVariables,
          ),
        },
      },
    });

    document.registerFlowNodes({
      type: StandardNodeType.VariableMerge,
      formMeta: {
        render: () => <div></div>,
        effect: {
          groups: provideMergeGroupVariablesEffect,
        },
      },
    });
  }
}
