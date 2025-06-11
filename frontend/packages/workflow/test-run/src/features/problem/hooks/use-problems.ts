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

    // 处理节点错误
    const nodeLevelErrors = nodeErrors.filter(
      item => item.errorLevel === 'error',
    );
    const nodeLevelWarnings = nodeErrors.filter(
      item => item.errorLevel === 'warning',
    );
    // errors 优先，其次才显示 warning
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

    // 处理线错误
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
