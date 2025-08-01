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
