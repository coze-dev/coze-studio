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

import { createContext, useContext } from 'react';

import { type IEventCallbacks } from '@coze-common/chat-uikit-shared';
/**
 * In order to support CozeImage's empty fetching and performance optimization, consider the temporarily opened Context, don't use it indiscriminately...
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OnboardingContext = createContext<{
  imageAutoSizeContainerWidth: number | undefined;
  eventCallbacks: IEventCallbacks | undefined;
}>({
  imageAutoSizeContainerWidth: undefined,
  eventCallbacks: undefined,
});

export const useOnboardingContext = () => useContext(OnboardingContext);
