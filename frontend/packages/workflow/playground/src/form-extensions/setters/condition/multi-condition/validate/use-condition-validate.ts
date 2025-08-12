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
