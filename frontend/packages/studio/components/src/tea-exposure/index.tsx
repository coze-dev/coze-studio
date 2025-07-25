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

/** 后续考虑通用化封装，增加诸如延迟时间、露出比例等参数 */
type TeaExposureProps<TEventName extends EVENT_NAMES> = {
  /**
   * 是否只上报一次
   * @default false
   * @todo 有余力再考虑兼容虚拟滚动
   */
  once?: boolean;
  teaEvent: {
    name: TEventName;
    params: ParamsTypeDefine[TEventName];
  };
} & ClassAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement>;

/**
 * 曝光埋点上报组件
 * 可以当成普通的 div 来用（比如配置样式）
 *
 * 封装的意义：避免组件 rerender
 *
 * useInViewport 会造成组件频繁 rerender，哪怕你并未使用其返回值，只要调用了这个 hook，就会随着其内部的 setState 触发 rerender。
 * 而我们都知道，对于下面这段代码，A rerender 会触发 B 和 C 的rerender；而 B rerender 不会触发 A 和 C 的 rerender。
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
