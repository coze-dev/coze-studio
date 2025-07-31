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

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  ViewVariableType,
  type RefExpression,
  ValueExpression,
} from '@coze-workflow/base';

import { useVariableService } from '@/hooks';
import { type CustomFilterVar } from '@/form-extensions/components/tree-variable-selector/types';

import { getVariableViewType } from '../../utils/get-variable-view-type';
import { getMatchedVariableTypes } from '../../utils/get-matched-variable-types';
/**
 * variable filtering
 */
export const useVariablesFilter = (
  variables: ValueExpression[],
): {
  customFilterVar: CustomFilterVar;
  disabledTypes: ViewVariableType[];
  viewType?: ViewVariableType;
} => {
  const variableService = useVariableService();
  const node = useCurrentEntity();
  const viewType = getVariableViewType(
    variables[0] as RefExpression,
    variableService,
    node,
  );

  // Only variables of the same type as the first variable are allowed to be selected
  const matchedTypes = getMatchedVariableTypes(viewType);
  const disabledTypes =
    matchedTypes.length > 0 ? ViewVariableType.getComplement(matchedTypes) : [];

  const paths = variables
    .filter(variable => ValueExpression.isRef(variable))
    .map(variable => variable.content?.keyPath)
    .filter(Boolean)
    .map(path => (path as string[]).join('.'));

  // Variables that have been selected are not allowed to be selected again
  const customFilterVar: CustomFilterVar = ({ meta: _meta, path }) =>
    !paths.includes((path || []).join('.'));

  return {
    customFilterVar,
    disabledTypes,
    viewType,
  };
};
