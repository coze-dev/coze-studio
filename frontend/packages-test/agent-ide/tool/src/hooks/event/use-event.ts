/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAbilityAreaContext } from '../../context/ability-area-context';

export const useEvent = () => {
  const { scopedEventBus } = useAbilityAreaContext();

  function on<T extends Record<string, any>>(
    eventName: string,
    listener: (params: T) => void,
  ) {
    scopedEventBus.on(eventName, listener);

    return () => {
      scopedEventBus.off(eventName, listener);
    };
  }

  function once<T extends Record<string, any>>(
    eventName: string,
    listener: (params: T) => void,
  ) {
    scopedEventBus.once(eventName, listener);
  }

  function emit<T extends Record<string, any>>(eventName: string, params: T) {
    scopedEventBus.emit(eventName, params);
  }

  return {
    on,
    once,
    emit,
  };
};
