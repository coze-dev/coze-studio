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

import Joyride, {
  type Props,
  ACTIONS,
  EVENTS,
  type CallBackProps,
} from 'react-joyride';
import React, { useState, useEffect, useCallback } from 'react';

import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { localStorageService } from '@coze-foundation/local-storage';

import { Tooltip, type IExtraAction } from './tooltip';
import { StepCard } from './step-card';

export { type Placement, type Step } from 'react-joyride';

const COACHMARK_KEY = 'coachmark';
const COACHMARK_END = 10000;

export default function Coachmark({
  steps,
  extraAction,
  showProgress = true,
  caseId,
  itemIndex = 0,
}: {
  steps: Props['steps'];
  showProgress?: Props['showProgress'];
  extraAction?: IExtraAction;
  caseId: string;
  itemIndex?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(itemIndex);

  const initVisible = async (cid: string) => {
    const coachMarkStorage = await localStorageService.getValueSync(
      COACHMARK_KEY,
    );
    // readStep represents the read step index
    const readStep = (
      typeSafeJSONParse(coachMarkStorage) as Record<string, number> | undefined
    )?.[cid];

    // Displays if it has not been read, or if the read step index is less than the index of the current item.
    const shouldShow = readStep === undefined || itemIndex > readStep;
    setVisible(shouldShow);
  };

  // Set the read step index
  const setCoachmarkReadStep = useCallback(
    (step: number) => {
      const coachmarkStorage =
        localStorageService.getValue(COACHMARK_KEY) ?? '{}';
      const coachmarkValue: Record<string, number | undefined> =
        (typeSafeJSONParse(coachmarkStorage) ?? {}) as unknown as Record<
          string,
          number | undefined
        >;

      // If it has not been read, or the index to be set is greater than the read step index, otherwise it is ignored.
      if (
        coachmarkValue[caseId] === undefined ||
        step > Number(coachmarkValue[caseId])
      ) {
        localStorageService.setValue(
          COACHMARK_KEY,
          JSON.stringify({
            ...coachmarkValue,
            [caseId]: step,
          }),
        );
      }
    },
    [caseId],
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, type } = data;

    if (
      [EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(
        type as 'step:after' | 'error:target_not_found',
      )
    ) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      // Set the step index that has been read
      setCoachmarkReadStep(index);
      setStepIndex(nextIndex);
    }
  };

  useEffect(() => {
    initVisible(caseId);

    return () => {
      setCoachmarkReadStep(itemIndex);
    };
  }, [caseId, setCoachmarkReadStep, itemIndex]);

  return visible ? (
    <Joyride
      steps={steps}
      tooltipComponent={props => (
        <Tooltip
          {...props}
          extraAction={extraAction}
          showProgress={showProgress}
          onClose={() => {
            setVisible(false);
            setCoachmarkReadStep(COACHMARK_END);
          }}
        />
      )}
      continuous
      disableOverlay
      disableScrollParentFix
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      spotlightPadding={-6}
      styles={{
        options: {
          zIndex: 100,
          primaryColor: '#4E40E5',
        },
        buttonClose: {
          display: 'none',
        },
        tooltip: {
          width: 300,
          padding: 8,
          borderRadius: 12,
        },
        tooltipContent: {
          padding: 0,
        },
        buttonBack: {
          display: 'none', // Hide back button
        },
      }}
      floaterProps={{
        styles: {
          arrow: {
            length: 7,
            spread: 14,
            margin: 40,
          },
          floater: {
            filter: 'none',
          },
        },
      }}
    />
  ) : null;
}

export { StepCard };
