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

import React, { type CSSProperties } from 'react';

import type { RenderLeafProps } from 'slate-react';

import { ExpressionEditorSignal } from '../../constant';

const LeafStyle: Partial<Record<ExpressionEditorSignal, CSSProperties>> = {
  [ExpressionEditorSignal.Valid]: {
    color: '#6675D9',
  },
  [ExpressionEditorSignal.Invalid]: {
    color: 'inherit',
  },
  [ExpressionEditorSignal.SelectedValid]: {
    color: '#6675D9',
    borderRadius: 2,
    backgroundColor:
      'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
  },
  [ExpressionEditorSignal.SelectedInvalid]: {
    color: 'inherit',
    borderRadius: 2,
    backgroundColor:
      'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
  },
};

export const ExpressionEditorLeaf = (props: RenderLeafProps) => {
  const { type } = props.leaf as {
    type?: ExpressionEditorSignal;
  };
  return (
    <span style={type && LeafStyle[type]} {...props.attributes}>
      {props.children}
    </span>
  );
};
