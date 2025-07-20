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
 
import { useState, useLayoutEffect, useRef } from 'react';

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    // 定义更新尺寸的函数
    const updateSize = () => {
      setWidth(ref.current ? ref.current.offsetWidth : 0);
    };

    // 创建ResizeObserver实例并观察目标元素
    const observer = new ResizeObserver(updateSize);
    if (ref.current) {
      observer.observe(ref.current);
    }

    // 当组件加载时更新一次尺寸
    updateSize();

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return { ref, width };
}
