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

import ruleComposer from 'eslint-rule-composer';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import reactPlugin from 'eslint-plugin-react';

const originRule = reactPlugin.rules['jsx-no-leaked-render'];

// Expand the react/jsx-no-leaked-render. If the left side of the "& &" expression is boolean, null, undefined TS type, no error will be reported.
export const tsxNoLeakedRender = ruleComposer.filterReports(
  originRule,
  problem => {
    const { parent } = problem.node;
    // If the expression is used for jsx properties, it does not need to be fixed. Such as < Comp prop = {{foo: 1} & & obj}/>
    if (
      parent?.type === AST_NODE_TYPES.JSXExpressionContainer &&
      parent?.parent?.type === AST_NODE_TYPES.JSXAttribute
    ) {
      return false;
    }

    return true;
  },
);
