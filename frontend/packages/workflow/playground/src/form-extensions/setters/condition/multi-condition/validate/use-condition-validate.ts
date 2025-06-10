import { useMemo } from 'react';

import { create } from 'zustand';
import {
  useEntityFromContext,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { PlaygroundContext } from '@coze-workflow/nodes';

import { type ConditionBranchValue } from '../types';
import {
  type BranchesValidateResult,
  validateAllBranches as originValidateAllBranches,
} from './validate';

export const useConditionValidate = () => {
  const validateResultStore = useMemo(
    () =>
      create<{
        validateResults: BranchesValidateResult;
        setValidateResults: (results: BranchesValidateResult) => void;
      }>(set => ({
        validateResults: [],
        setValidateResults: results =>
          set(state => ({
            validateResults: results,
          })),
      })),
    [],
  );

  const { validateResults, setValidateResults } = validateResultStore(
    state => ({
      validateResults: state.validateResults,
      setValidateResults: state.setValidateResults,
    }),
  );

  const nodeEntity = useEntityFromContext<WorkflowNodeEntity>();
  const playgroundContext = useService<PlaygroundContext>(PlaygroundContext);

  const initValidateResultsWithBranches = (
    branches: ConditionBranchValue[],
  ) => {
    setValidateResults(
      originValidateAllBranches(branches, nodeEntity, playgroundContext),
    );
  };

  const validateAllBranches = (branches: ConditionBranchValue[]) => {
    const r = originValidateAllBranches(
      branches,
      nodeEntity,
      playgroundContext,
    );

    setValidateResults(r);
  };

  return {
    validateResults,
    initValidateResultsWithBranches,
    validateAllBranches,
  };
};
