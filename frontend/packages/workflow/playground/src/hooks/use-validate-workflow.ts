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
    // 无论是否有错误，都需要校验连线
    lineService.validateAllLine();
    return hasError;
  }, [validationService, lineService]);

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
      return beHasError;
    } finally {
      validationService.validating = false;
    }
  }, [feValidate, beValidate, validationService]);

  return { validate };
};

/**
 * 校验的触发频率
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
