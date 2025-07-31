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

import React, { useContext, useEffect } from 'react';

import classNames from 'classnames';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { Steps } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { IconCozCheckMarkFill } from '@coze-arch/coze-design/icons';

import type {
  UploadBaseState,
  UploadBaseAction,
  UploadConfig,
} from './protocol/base';
import { KnowledgeUploadStoreContext } from './context';

import styles from './index.module.less';

const BOT_DATA_REFACTOR_CLASS_NAME = 'data-refactor';
export const Upload = <
  T extends number,
  R extends UploadBaseState<T> & UploadBaseAction<T>,
>(props: {
  config: UploadConfig<T, R>;
}) => {
  useEffect(
    () => () => {
      // It is necessary, otherwise it will be wrong to re-enter the page status
      reset();
    },
    [],
  );

  /** get store */
  const storeContext = useContext(KnowledgeUploadStoreContext);
  if (!storeContext.storeRef.knowledge) {
    throw new CustomError(
      REPORT_EVENTS.normalError,
      'no knowledge store context',
    );
  }
  const store = storeContext.storeRef.knowledge;

  /** get steps */
  const { config } = props;

  if (!config) {
    return null;
  }

  const { className, useUploadMount, showStep = true } = config;
  const currentStep = store(state => state.currentStep);
  const reset = store(state => state.reset);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const [placeHolder, checkStatus] = useUploadMount?.(store) ?? [];
  const showStepFlags = config.steps.map(
    step => step.showThisStep?.(checkStatus) ?? true,
  );
  const steps = config.steps.filter((_v, index) => showStepFlags[index]);
  // After the array is filtered, there is a problem with steps getting the value through the index, so it is changed to get the corresponding step value to associate the item data.
  const ContentComp = steps.find(item => item.step === currentStep)?.content;
  if (placeHolder) {
    return placeHolder;
  }
  return (
    <div
      className={classNames(
        `${className} ${BOT_DATA_REFACTOR_CLASS_NAME}`,
        styles['knowledge-steps'],
      )}
    >
      {showStep ? (
        <Steps
          type="basic"
          hasLine={false}
          current={currentStep}
          className="mb-[32px]"
        >
          {steps.map(step =>
            currentStep > step.step ? (
              <Steps.Step
                key={step.title}
                title={step.title}
                icon={
                  <div className={styles['finish-icon']}>
                    <IconCozCheckMarkFill />
                  </div>
                }
              />
            ) : (
              <Steps.Step key={step.title} title={step.title} />
            ),
          )}
        </Steps>
      ) : null}
      {ContentComp ? (
        <ContentComp useStore={store} checkStatus={checkStatus} />
      ) : null}
    </div>
  );
};
