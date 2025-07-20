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
 
import { useState } from 'react';

import { useShowBackGround } from '../public/use-show-bgackground';

interface UseBackgroundScrollReturnType {
  onReachTop: () => void;
  onLeaveTop: () => void;
  beforeClassName: string;
  beforeNode: JSX.Element | null;
  maskClassName: string;
  showGradient: boolean;
}

// 背景图模式下scrollView增加以下处理：
// 1. 当存在顶部Node时，滚动后增加 一层高度固定的黑色渐变div，页面向下滚动不僵硬
// 2. 对话区域增加一层蒙版，底部会话区域渐变消失，会话元素底部不僵硬
export const useBackgroundScroll = ({
  hasHeaderNode,
  maskNode,
  styles,
}: {
  hasHeaderNode?: boolean;
  maskNode: JSX.Element;
  styles: Record<string, string>;
}): UseBackgroundScrollReturnType => {
  const [showGradient, setShowGradient] = useState(true);
  const showBackground = useShowBackGround();

  return {
    onReachTop: () => setShowGradient(false),
    onLeaveTop: () => setShowGradient(true),
    beforeClassName: showBackground ? 'absolute left-0' : '',
    beforeNode:
      showGradient && hasHeaderNode && showBackground ? maskNode : null,
    // 增加蒙版，处理聊天会话底部无渐变生硬问题
    maskClassName: showBackground ? styles['scroll-mask'] ?? '' : '',
    showGradient,
  };
};
