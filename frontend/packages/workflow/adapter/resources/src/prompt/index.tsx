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

/**
 * @file The open source version does not currently provide AI generation capabilities
 */

import React, { type PropsWithChildren } from 'react';

export const NLPromptButton = _props => null;
export const NLPromptModal = _props => null;
export const NlPromptAction = _props => null;
export const NlPromptShortcut = _props => null;
export const NLPromptProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <>{children}</>
);
