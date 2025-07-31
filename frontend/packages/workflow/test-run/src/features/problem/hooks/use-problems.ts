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

import { useMemo } from 'react';

import { uniq } from 'lodash-es';
import {
  useValidationServiceStore,
  type ValidateError,
  type ValidationState,
} from '@coze-workflow/base/services';

import { type WorkflowProblem } from '../types';

const generateErrors2Problems = (errors: ValidationState['errors']) => {
  const nodeProblems: ValidateError[] = [];
  const lineProblems: ValidateError[] = [];
  Object.entries(errors).forEach(([id, list]) => {
    const nodeErrors = list.filter(i => i.errorType === 'node');
    const lineErrors = list.filter(i => i.errorType === 'line');

    // Handling node errors
    const nodeLevelErrors = nodeErrors.filter(
      item => item.errorLevel === 'error',
    );
    const nodeLevelWarnings = nodeErrors.filter(
      item => item.errorLevel === 'warning',
    );
    // Errors first, warnings second
    const nodeCurrentErrors = nodeLevelErrors.length
      ? nodeLevelErrors
      : nodeLevelWarnings;
    if (nodeCurrentErrors.length) {
      const nodeProblem: ValidateError = {
        nodeId: id,
        errorInfo: uniq(nodeCurrentErrors.map(error => error.errorInfo)).join(
          ';',
        ),
        errorLevel: nodeCurrentErrors[0].errorLevel,
        errorType: 'node',
      };
      nodeProblems.push(nodeProblem);
    }

    // processing line error
    if (lineErrors.length) {
      lineProblems.push(...lineErrors);
    }
  });

  return {
    node: nodeProblems,
    line: lineProblems,
  };
};

const generateProblemsV2 = (
  errors: ValidationState['errorsV2'],
  workflowId: string,
) => {
  let myProblems: WorkflowProblem | undefined;
  const otherProblems: WorkflowProblem[] = [];
  Object.entries(errors).forEach(([id, error]) => {
    if (!Object.keys(error.errors).length) {
      return;
    }
    const value = {
      ...error,
      problems: generateErrors2Problems(error.errors),
    };
    if (id === workflowId) {
      myProblems = value;
    } else {
      otherProblems.push(value);
    }
  });
  return {
    myProblems,
    otherProblems,
  };
};

export const useProblems = (workflowId: string) => {
  const { errorsV2, validating } = useValidationServiceStore(store => ({
    errorsV2: store.errorsV2,
    validating: store.validating,
  }));

  const problemsV2 = useMemo(
    () => generateProblemsV2(errorsV2, workflowId),
    [errorsV2, workflowId],
  );

  return { problemsV2, validating };
};
