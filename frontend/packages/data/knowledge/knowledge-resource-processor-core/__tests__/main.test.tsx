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

import React, { useState } from 'react';

import { type StoreApi, type UseBoundStore, create } from 'zustand';
import { expect, describe, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '@coze-arch/bot-semi';

import { type ProgressItem, type UnitItem } from '../src/types/common';
import {
  type UploadBaseState,
  type UploadBaseAction,
  type UploadConfig,
} from '../src/protocol/base';
import { Upload } from '../src/main';
import { CheckedStatus, CreateUnitStatus } from '../src/constants/common';
import { type ContentProps } from '../src';
import { KnowledgeUploadStoreProvider } from '../src';

enum UploadStep {
  UPLOAD = 0,
  MANAGE = 1,
  PROCESS = 2,
}

describe('test upload struct', () => {
  const testConfig: UploadConfig<
    UploadStep,
    UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>
  > = {
    steps: [
      {
        content: (
          props: ContentProps<
            UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>
          >,
        ) => {
          const { useStore } = props;
          // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
          const { setCurrentStep, currentStep } = useStore();
          return (
            <>
              Upload
              <Button
                onClick={() => {
                  console.log('debug there setCurrentStep');
                  setCurrentStep(currentStep + 1);
                }}
              >
                next Step
              </Button>
            </>
          );
        },
        title: 'test',
        step: UploadStep.UPLOAD,
        showThisStep: checkStatus => checkStatus === CheckedStatus.NO_FILE,
      },
      {
        content: (
          props: ContentProps<
            UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>
          >,
        ) => {
          const { useStore } = props;
          // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
          const { setCurrentStep, currentStep } = useStore();
          return (
            <>
              MANAGE
              <Button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                }}
              >
                prev Step
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                }}
              >
                next Step
              </Button>
            </>
          );
        },
        title: 'test',
        step: UploadStep.MANAGE,
      },
      {
        content: (
          props: ContentProps<
            UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>
          >,
        ) => {
          const { useStore } = props;
          // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
          const { setCurrentStep, currentStep } = useStore();
          return (
            <>
              PROCESS
              <Button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                }}
              >
                prev Step
              </Button>
            </>
          );
        },
        title: 'test',
        step: UploadStep.PROCESS,
      },
    ],

    createStore: () =>
      create<UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>>()(
        set => ({
          currentStep: UploadStep.MANAGE,
          createStatus: CreateUnitStatus.UPLOAD_UNIT,
          progressList: [],
          unitList: [],
          setCurrentStep: (step: UploadStep) =>
            set({
              currentStep: step,
            }),
          setCreateStatus: (createStatus: CreateUnitStatus) =>
            set({
              createStatus,
            }),
          setProgressList: (progressList: ProgressItem[]) =>
            set({
              progressList,
            }),
          setUnitList: (unitList: UnitItem[]) =>
            set({
              unitList,
            }),
          reset: () =>
            set({
              currentStep: UploadStep.MANAGE,
              createStatus: CreateUnitStatus.UPLOAD_UNIT,
              progressList: [],
              unitList: [],
            }),
        }),
      ),
  };

  test('step render', async () => {
    await render(
      <KnowledgeUploadStoreProvider createStore={testConfig.createStore}>
        <Upload config={testConfig} />
      </KnowledgeUploadStoreProvider>,
    );
    const currentStepComp = await screen.queryByText('MANAGE');
    expect(currentStepComp).toBeDefined();
  });

  test('no step comp', async () => {
    testConfig.showStep = false;
    await render(
      <KnowledgeUploadStoreProvider createStore={testConfig.createStore}>
        <Upload config={testConfig} />
      </KnowledgeUploadStoreProvider>,
    );
    const currentStepComp = await screen.queryByText('MANAGE');
    const stepComp = await screen.queryByText('1');
    expect(stepComp).toBeNull();
    expect(currentStepComp).toBeDefined();
  });

  test('next step', async () => {
    testConfig.showStep = true;
    await render(
      <KnowledgeUploadStoreProvider createStore={testConfig.createStore}>
        <Upload config={testConfig} />
      </KnowledgeUploadStoreProvider>,
    );
    const nextButton = await screen.queryByText('next Step');
    expect(nextButton).toBeDefined();
    await fireEvent.click(nextButton as unknown as any);
    const manageComp = await screen.queryByText('PROCESS');
    expect(manageComp).toBeDefined();
  });

  test('skip step', async () => {
    await render(
      <KnowledgeUploadStoreProvider createStore={testConfig.createStore}>
        <Upload config={testConfig} />
      </KnowledgeUploadStoreProvider>,
    );
    const uploadStep = await screen.queryByText('Upload');
    expect(uploadStep).toBeNull();
  });

  test('enter placeHolder & no skip', async () => {
    testConfig.useUploadMount = (
      store: UseBoundStore<
        StoreApi<UploadBaseState<UploadStep> & UploadBaseAction<UploadStep>>
      >,
    ) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
      const [showPlaceHolder, setShowPlaceHolder] = useState(true);
      const setCurrentStep = store(s => s.setCurrentStep);
      setCurrentStep(UploadStep.UPLOAD);
      if (!showPlaceHolder) {
        return [undefined, CheckedStatus.NO_FILE];
      }
      return [
        <Button
          onClick={() => {
            setShowPlaceHolder(false);
          }}
        >
          skip
        </Button>,
        CheckedStatus.NO_FILE,
      ];
    };
    await render(
      <KnowledgeUploadStoreProvider createStore={testConfig.createStore}>
        <Upload config={testConfig} />
      </KnowledgeUploadStoreProvider>,
    );
    const skipButton = await screen.queryByText('skip');
    await fireEvent.click(skipButton as unknown as any);
    const uploadStep = await screen.queryByText('Upload');
    expect(uploadStep).not.toBeNull();
  });
});
