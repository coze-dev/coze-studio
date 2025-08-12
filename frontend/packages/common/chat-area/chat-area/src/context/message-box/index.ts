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
 * If the context may also appear in scenarios without messageBoxContext, such as onboarding;
 * If the invoked environment is inside a normal message box, use regular useMessageBoxContext
 */
export const useUnsafeMessageBoxContext = () => useContext(MessageBoxContext);
