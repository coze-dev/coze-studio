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
 
import { useState, type FC } from 'react';

import { isNumber } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/bot-semi';

import { Step } from '../../types';
import { useStepStore } from '../../store/step';
import { useInitialConfigStore } from '../../store/initial-config';
import { useStep } from '../../hooks/use-step';

import styles from './index.module.less';
export const StepFooter: FC = () => {
  const { getCallbacks } = useStep();
  const { step, enableGoToNextStep, tablePreview } = useStepStore(state => ({
    step: state.step,
    enableGoToNextStep: state.enableGoToNextStep,
    tablePreview: state.step3_tablePreview,
  }));
  const { onCancel } = useInitialConfigStore(state => ({
    onCancel: state.onCancel,
  }));

  const stepList = Object.values(Step).filter(i => isNumber(i)) as Step[];
  const firstStep = Math.min(...stepList);
  const lastStep = Math.max(...stepList);
  const isFirstStep = step === firstStep;
  const isLastStep = step === lastStep;
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);

  const { previewData } = tablePreview;
  const total = previewData?.total_rows || 0;
  const previewCount = previewData?.preview_rows || 10;

  const handleClickNext = async () => {
    const { onValidate, onSubmit } = getCallbacks();
    // onValidate
    try {
      const callbackResult = onValidate?.();

      if (callbackResult instanceof Promise) {
        setSubmitButtonLoading(true);
      }
      const res = await callbackResult;

      // 返回 false 则直接 return
      if (typeof res === 'boolean' && res === false) {
        setSubmitButtonLoading(false);
        return;
      }
    } catch (e) {
      setSubmitButtonLoading(false);
      throw e;
    }

    // onSubmit
    try {
      // 判断传入的 submit 函数如果是异步，则按钮 loading
      const callbackResult = onSubmit?.();
      if (callbackResult instanceof Promise) {
        setSubmitButtonLoading(true);
      }
      await callbackResult;

      if (isLastStep) {
        //关闭
        onCancel?.();
      } else {
        // 下一步
        useStepStore.setState(state => ({
          step: Math.min(state.step + 1, lastStep),
        }));
      }
    } finally {
      setSubmitButtonLoading(false);
    }
  };

  const handleClickPrev = () => {
    getCallbacks()?.onPrevious?.();
    if (isFirstStep) {
      // 关闭
      onCancel?.();
    } else {
      // 上一步
      useStepStore.setState(state => ({
        step: Math.max(state.step - 1, firstStep),
      }));
    }
  };

  return (
    <div className={styles.footer}>
      {step === Step.Step3_TablePreview ? (
        <div className={styles['table-preview-tips']}>
          {I18n.t('db_table_0126_028', {
            TotalRows: total,
            ShowRows: previewCount,
          })}
        </div>
      ) : null}
      {isLastStep ? null : (
        <Button type="tertiary" onClick={onCancel}>
          {I18n.t('db_table_0126_001')}
        </Button>
      )}
      {isFirstStep || isLastStep ? null : (
        <Button type="tertiary" onClick={handleClickPrev}>
          {I18n.t('db_table_0126_004')}
        </Button>
      )}
      <Button
        theme="solid"
        type="primary"
        onClick={handleClickNext}
        loading={submitButtonLoading}
        disabled={!enableGoToNextStep}
      >
        {isLastStep ? I18n.t('db_table_0126_005') : I18n.t('db_table_0126_003')}
      </Button>
    </div>
  );
};
