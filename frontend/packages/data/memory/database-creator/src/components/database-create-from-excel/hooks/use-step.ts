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

import { useEffect } from 'react';

import { type Callback } from '../types';
import { useStepStore } from '../store/step';
import { eventEmitter } from '../helpers/event-emitter';

const generateEventCallback =
  (eventName: 'validate' | 'next' | 'prev') =>
  (callback: Callback): void => {
    const step = useStepStore(state => state.step);
    useEffect(() => {
      const key = `${eventName}-${step}`;
      eventEmitter.on(key, callback);

      return () => {
        eventEmitter.off(key);
      };
    }, [callback, step]);
  };

export const useStep = () => {
  const step = useStepStore(state => state.step);
  const enableGoToNextStep = useStepStore(state => state.enableGoToNextStep);
  const set_enableGoToNextStep = useStepStore(
    state => state.set_enableGoToNextStep,
  );

  const computingEnableGoToNextStep = (compute: () => boolean) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    useEffect(() => {
      const res = compute();
      if (res !== enableGoToNextStep) {
        set_enableGoToNextStep(res);
      }
    }, [compute, enableGoToNextStep]);
  };

  return {
    computingEnableGoToNextStep,
    onValidate: generateEventCallback('validate'),
    onSubmit: generateEventCallback('next'),
    onPrevious: generateEventCallback('prev'),
    getCallbacks: () => ({
      onValidate: eventEmitter.getEventCallback(`validate-${step}`),
      onSubmit: eventEmitter.getEventCallback(`next-${step}`),
      onPrevious: eventEmitter.getEventCallback(`prev-${step}`),
    }),
  };
};
