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

import { useState, useEffect, useRef } from 'react';

import { isEqual, cloneDeep } from 'lodash-es';
import { type WorkflowVariableFacade } from '@coze-workflow/variable/src/core/workflow-variable-facade';

import {
  getVariableInfoFromExpression,
  findInputVariable,
} from '@/node-registries/http/components/variable-support/utils';
import type {
  VariableWithNodeInfo,
  InputVariableInfo,
} from '@/node-registries/http/components/variable-support/types';

export interface UrlVariableInfoType extends InputVariableInfo {
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface SplitedUrlType {
  content: string;
  isVariable: boolean;
}

export interface UseHttpUrlVariablesProps {
  urlExpressionString: string;
  availableVariables: VariableWithNodeInfo[];
  getVariableByKeyPath: (
    keyPath: string[],
  ) => WorkflowVariableFacade | undefined;
}

export function useHttpUrlVariables({
  urlExpressionString,
  availableVariables,
  getVariableByKeyPath,
}: UseHttpUrlVariablesProps): {
  urlVariables: UrlVariableInfoType[];
  splitedUrl: SplitedUrlType[];
} {
  const [urlVariables, setUrlVariables] = useState<UrlVariableInfoType[]>([]);
  const [splitedUrl, setSplitedUrl] = useState<SplitedUrlType[]>([]);
  const doubleBracedPattern = /{{([^}]+)}}/g;

  const apiUrlRef = useRef<string>('');
  const variableRef = useRef<VariableWithNodeInfo[]>([]);

  useEffect(() => {
    if (!urlExpressionString) {
      return;
    }

    const isUrlChange = apiUrlRef.current !== urlExpressionString;
    if (isUrlChange) {
      apiUrlRef.current = urlExpressionString;
    }
    const isVariableChange = !isEqual(variableRef.current, availableVariables);
    if (isVariableChange) {
      variableRef.current = cloneDeep(availableVariables);
    }

    if (!isUrlChange && !isVariableChange) {
      return;
    }

    const matches: UrlVariableInfoType[] = [];
    const urlPieces: SplitedUrlType[] = [];
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while (true) {
      match = doubleBracedPattern.exec(urlExpressionString);
      if (!match) {
        break;
      }

      const content = match[0]; // With double curly braces
      const {
        globalVariableKey,
        nodeName,
        fieldPart,
        fieldKeyPath,
        parsedKeyPath,
      } = getVariableInfoFromExpression(match[1]);

      const matchedVariable = getVariableByKeyPath(fieldKeyPath ?? []);
      const variableInfo = findInputVariable(
        availableVariables,
        {
          globalVariableKey,
          nodePart: nodeName,
          fieldPart,
          parsedKeyPath,
        },
        matchedVariable,
      );

      const startIndex = match.index;
      const endIndex = match.index + content.length;
      // Add previous string
      urlPieces.push({
        content: urlExpressionString.slice(lastIndex, match.index),
        isVariable: false,
      });
      // Add current string
      urlPieces.push({ content, isVariable: true });
      // Update lastIndex to the end position of the current match
      lastIndex = match.index + content.length;

      matches.push({
        ...variableInfo,
        content,
        startIndex,
        endIndex,
      });
    }

    // Add the string after the last match
    if (lastIndex < urlExpressionString.length) {
      urlPieces.push({
        content: urlExpressionString.slice(lastIndex),
        isVariable: false,
      });
    }

    setUrlVariables(matches);
    setSplitedUrl(urlPieces);
  }, [urlExpressionString, availableVariables]);

  return { urlVariables, splitedUrl };
}
