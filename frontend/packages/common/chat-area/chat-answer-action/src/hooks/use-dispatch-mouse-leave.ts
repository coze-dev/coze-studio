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
 
import { type RefObject, useEffect } from 'react';

/**
 * 点击赞、踩按钮，可以关闭打开原因填写面板
 * 填写面板关闭的时候, 会造成一次 Reflow。此时赞、踩按钮的位置会发生变化， 鼠标已经不在按钮上，但是对应按钮元素不会处罚 mouseleave 事件
 * 由于不触发 mouseleave 造成按钮上的 tooltip 不消失、错位等问题
 * 所以需要在面板 visible 变化时 patch 一个 mouseleave 事件
 */
export const useDispatchMouseLeave = (
  ref: RefObject<HTMLDivElement>,
  isFrownUponPanelVisible: boolean,
) => {
  useEffect(() => {
    ref.current?.dispatchEvent(
      new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, [isFrownUponPanelVisible, ref.current]);
};
