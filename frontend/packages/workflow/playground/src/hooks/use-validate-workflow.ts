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

import { useCallback, useEffect } from 'react';

import { debounce } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection } from '@flowgram-adapter/common';
import { GlobalVariableService } from '@coze-workflow/variable';
import { useValidationService } from '@coze-workflow/base/services';

import { useLineService, useGlobalState } from '@/hooks';

export const useValidateWorkflow = () => {
  const lineService = useLineService();
  const validationService = useValidationService();
  const globalState = useGlobalState();

  const feValidate = useCallback(async () => {
    const { hasError, nodeErrorMap: feErrorMap } =
      await validationService.validateWorkflow();
    if (hasError && feErrorMap) {
      validationService.setErrorsV2({
        [globalState.workflowId]: {
          workflowId: globalState.workflowId,
          errors: feErrorMap,
        },
      });
    }
    return hasError;
  }, [validationService, globalState]);

  const beValidate = useCallback(async () => {
    const { hasError, errors } = await validationService.validateSchemaV2();
    if (hasError) {
      validationService.setErrorsV2(errors);
    }

    return hasError;
  }, [validationService]);

  const validate = useCallback(async () => {
    validationService.validating = true;
    try {
      const feHasError = await feValidate();
      if (feHasError) {
        return feHasError;
      }
      const beHasError = await beValidate();
      if (!feHasError && !beHasError) {
        validationService.clearErrors();
      }
      lineService.validateAllLine();
      return beHasError;
    } finally {
      validationService.validating = false;
    }
  }, [feValidate, beValidate, validationService, lineService]);

  return { validate };
};

/**
 * trigger frequency of validation
 */
const DEBOUNCE_TIME = 2000;

export const useWatchValidateWorkflow = () => {
  const { isInIDE } = useGlobalState();

  const { validate } = useValidateWorkflow();
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  const debounceValidate = useMemoizedFn(debounce(validate, DEBOUNCE_TIME));

  const globalVariableService = useService<GlobalVariableService>(
    GlobalVariableService,
  );

  useEffect(() => {
    const globalVariableDispose = new DisposableCollection();

    globalVariableDispose.push(
      globalVariableService.onLoaded(() => {
        if (!isInIDE) {
          debounceValidate();
        }
      }),
    );

    const contentChangeDispose = workflowDocument.onContentChange(() => {
      debounceValidate();
    });

    return () => {
      contentChangeDispose.dispose();
      globalVariableDispose.dispose();
    };
  }, [workflowDocument, isInIDE]);
};
