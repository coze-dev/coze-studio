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
