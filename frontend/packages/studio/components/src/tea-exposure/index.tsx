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

import React, {
  useRef,
  type ClassAttributes,
  type HTMLAttributes,
  useEffect,
} from 'react';

import { useInViewport } from 'ahooks';
import {
  sendTeaEvent,
  type EVENT_NAMES,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';

/** Subsequent consideration of generalized packaging, adding parameters such as delay time and exposure ratio */
type TeaExposureProps<TEventName extends EVENT_NAMES> = {
  /**
   * Is it only reported once?
   * @default false
   * @Todo has the spare time to reconsider compatibility with virtual scrolling
   */
  once?: boolean;
  teaEvent: {
    name: TEventName;
    params: ParamsTypeDefine[TEventName];
  };
} & ClassAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement>;

/**
 * Exposure event tracking report component
 * It can be used as a normal div (e.g. configuration style).
 *
 * The meaning of encapsulation: avoid component rerendering
 *
 * useInViewport causes the component to rerender frequently, even if you don't use its return value. As long as this hook is called, rerender will be triggered with its internal setState.
 * And we all know that for the following code, A rerender will trigger the rerender of B and C, while B rerender will not trigger the rerender of A and C.
 * ```
 * const A = () => <B><C /></B>
 * ```
 */
export function TeaExposure<TEventName extends EVENT_NAMES>({
  once,
  teaEvent,
  children,
  ...divParams
}: TeaExposureProps<TEventName>) {
  const divRef = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(() => divRef.current);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!inViewport) {
      return;
    }
    if (once && reportedRef.current) {
      return;
    }
    sendTeaEvent(teaEvent.name, teaEvent.params);
    reportedRef.current = true;
  }, [inViewport]);

  return (
    <div {...divParams} ref={divRef}>
      {children}
    </div>
  );
}
