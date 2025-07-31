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

import { type FormApi } from '@coze-arch/coze-design';

import { type PromptConfiguratorModalProps } from '../types';

export interface PromptConfiguratorContextType {
  props: PromptConfiguratorModalProps;
  formApiRef: React.RefObject<FormApi>;
  isReadOnly: boolean;
}

export const PromptConfiguratorContext =
  createContext<PromptConfiguratorContextType | null>(null);

export const PromptConfiguratorProvider = PromptConfiguratorContext.Provider;

export const useCreatePromptContext = () =>
  useContext(PromptConfiguratorContext);
