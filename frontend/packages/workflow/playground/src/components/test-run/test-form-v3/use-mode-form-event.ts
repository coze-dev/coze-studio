/* eslint-disable @coze-arch/no-batch-import-or-export */
import { type MutableRefObject } from 'react';

import { cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import {
  type IFormSchema,
  useTestRunFormStore,
} from '@coze-workflow/test-run-next';
import { useTestFormService } from '@coze-workflow/test-run';

import { type TestRunFormModel } from './test-run-form-model';
import * as ModeFormKit from './mode-form-kit';

interface UseModeFormEventOptions {
  schemaWithMode: IFormSchema | null;
  formApiRef: MutableRefObject<TestRunFormModel>;
}

export const useModeFormEvent = ({
  schemaWithMode,
  formApiRef,
}: UseModeFormEventOptions) => {
  const testFormService = useTestFormService();
  const getSchema = useTestRunFormStore(store => store.getSchema);

  const onMounted = useMemoizedFn(model => {
    formApiRef.current.mounted(model);
  });

  const onFormValuesChange = useMemoizedFn(({ values }) => {
    const currentValue = cloneDeep(values);
    const nodeId = schemaWithMode?.['x-node-id'];
    const originSchema = getSchema();
    if (originSchema && schemaWithMode) {
      ModeFormKit.formatValues({
        mode: schemaWithMode['x-form-mode'] || 'form',
        originFormSchema: originSchema,
        formValues: currentValue,
      });
    }

    if (nodeId) {
      testFormService.setCacheValues(nodeId, currentValue);
    }
  });

  return {
    onFormValuesChange,
    onMounted,
  };
};
