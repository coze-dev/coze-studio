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

import { useLayoutEffect, useRef } from 'react';

import classNames from 'classnames';
import { useGetWorkflowVariableByKeyPath } from '@coze-workflow/variable';
import { useInjector } from '@coze-editor/editor/react';
import {
  type SelectionEnlargerSpec,
  astDecorator,
  deletionEnlarger,
  selectionEnlarger,
} from '@coze-editor/editor';
import { StateField } from '@codemirror/state';

import { VariableSubfixWidget } from '../variable-subfix-widget';
import { VariablePrefixWidget } from '../variable-prefix-widget';
import { VariableDeleteWidget } from '../variable-deleted-widget';
import {
  useLatest,
  findInputVariable,
  getVariableRanges,
  getVariableInfoFromExpression,
} from '../utils';
import type { RangeType, InputVariableInfo } from '../types';
import s from '../index.module.less';

/**
 * Variable text is replaced with a custom style
 */
export const useVariableInjector = ({
  availableVariables,
  openUpdateDropdown,
  updateRange,
  setPos,
  readonly,
  isDarkTheme,
  languageId,
}) => {
  const darkThemeRef = useLatest(isDarkTheme);
  const openUpdateDropdownRef = useLatest(openUpdateDropdown);

  const varibaleInfoRef = useRef<InputVariableInfo>();
  const injector = useInjector();
  const getVariableByKeyPath = useGetWorkflowVariableByKeyPath();

  useLayoutEffect(() => {
    const field = StateField.define<SelectionEnlargerSpec[]>({
      create(state) {
        return getVariableRanges(state);
      },
      update(value, tr) {
        if (tr.docChanged) {
          return getVariableRanges(tr.state);
        }
        return value;
      },
    });

    return injector.inject([
      field,
      selectionEnlarger.of(state => state.field(field)),
      deletionEnlarger.of(state => state.field(field)),
      astDecorator.whole.of((cursor, state) => {
        if (
          cursor.name === 'Interpolation' &&
          cursor.node.firstChild?.name === '{{' &&
          cursor.node.lastChild?.name === '}}'
        ) {
          const from = cursor.node.firstChild.to;
          const to = cursor.node.lastChild.from;
          const sliceContent = state.sliceDoc(from, to);

          const {
            globalVariableKey,
            nodeName,
            nodeNameWithDot,
            fieldPart,
            fieldKeyPath,
            parsedKeyPath,
          } = getVariableInfoFromExpression(sliceContent);

          if (nodeName && fieldPart) {
            const nodeNameWithDotLength = nodeNameWithDot?.length;
            const matchedVariable = getVariableByKeyPath(fieldKeyPath);

            const varaibleInfo = findInputVariable(
              availableVariables,
              {
                globalVariableKey,
                nodePart: nodeName,
                fieldPart,
                parsedKeyPath,
              },
              matchedVariable,
            );

            varibaleInfoRef.current = varaibleInfo;

            // Variable does not exist
            if (!varaibleInfo?.isVariableExist) {
              const variableDeleteWidget = new VariableDeleteWidget(
                {
                  from: from - 2,
                  to: to + 2,
                },
                (range: RangeType) => {
                  openUpdateDropdownRef.current();
                  updateRange.current = range;
                  // When clicking on a variable, set the pop-up position
                  setPos(from);
                },
              );
              return [
                {
                  type: 'replace',
                  from: cursor.from,
                  to: cursor.node.lastChild.to,
                  widget: variableDeleteWidget,
                  atomicRange: true,
                },
              ];
            }

            const variablePrefixWidget = new VariablePrefixWidget(
              (range: RangeType) => {
                openUpdateDropdownRef.current();
                updateRange.current = range;
                // When clicking on a variable, set the pop-up position
                setPos(from);
              },
              {
                nodeName,
                range: {
                  from: from - 2,
                  to: to + 2,
                },
                varaibleInfo: varibaleInfoRef.current,
                isDarkTheme: darkThemeRef.current,
                languageId,
              },
              readonly,
            );

            const variableSubfixWidget = new VariableSubfixWidget(
              {
                from: from - 2,
                to: to + 2,
              },
              { varaibleInfo, isDarkTheme },
              (range: RangeType) => {
                openUpdateDropdownRef.current();
                updateRange.current = range;
                // When clicking on a variable, set the pop-up position
                setPos(from);
              },
            );

            const flowVariableSubfixWidget = new VariableSubfixWidget(
              {
                from,
                to,
              },
              { varaibleInfo, isDarkTheme, noLabel: true },
            );

            return [
              {
                type: 'replace',
                from: cursor.from,
                to: from + nodeNameWithDotLength,
                widget: variablePrefixWidget,
                atomicRange: true,
              },
              globalVariableKey
                ? {
                    type: 'replace',
                    from: from + nodeNameWithDotLength,
                    to,
                    // Global variable scene, non-editable variable fields
                    widget: variableSubfixWidget,
                    atomicRange: true,
                  }
                : {
                    type: 'className',
                    className: classNames(s.content, {
                      [s['dark-content']]: isDarkTheme,
                      [s['error-content']]: !varaibleInfo.isValid,
                    }),
                    from: from + nodeNameWithDotLength,
                    to,
                  },

              {
                type: 'replace',
                from: to,
                to: cursor.node.lastChild.to,
                widget: flowVariableSubfixWidget,
                atomicRange: true,
              },
            ];
          }
        }
      }),
    ]);
  }, [injector, availableVariables, isDarkTheme]);
};
