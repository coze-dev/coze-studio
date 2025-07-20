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
 
import { useContext } from 'react';

import { MessageBoxContext } from './context';

export const useMessageBoxContext = () => {
  const { message, messageUniqKey, meta, ...rest } =
    useContext(MessageBoxContext);
  if (!message || !meta) {
    throw new Error(
      `failed to get message or meta by message id or local_id ${messageUniqKey}`,
    );
  }
  return { message, messageUniqKey, meta, ...rest };
};

/**
 * 如果上下文可能同时出现于 onboarding 等无 messageBoxContext 的场景中；
 * 如果被调用环境属于正常 message box 内，使用常规 useMessageBoxContext
 */
export const useUnsafeMessageBoxContext = () => useContext(MessageBoxContext);
