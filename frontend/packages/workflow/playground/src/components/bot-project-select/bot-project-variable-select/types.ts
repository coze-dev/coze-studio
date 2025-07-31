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

import { type CSSProperties, type ReactNode } from 'react';

import { type IntelligenceType } from '@coze-arch/idl/intelligence_api';

import { type VariableMetaWithNode } from '@/form-extensions/typings';
import type {
  DisableExtraOptions,
  IBotSelectOption,
} from '@/components/bot-project-select/types';

export interface Variable extends VariableMetaWithNode {
  disabled?: boolean;
  value?: string;
}

export interface RelatedVariablesHookProps {
  variablesFormatter?: (variables: Variable[]) => Variable[];
}

export interface RelatedEntitiesHookProps {
  relatedEntityValue?: RelatedValue;
}

export interface RelatedValue {
  id: string;
  type: IntelligenceType;
}

export interface RelatedEntitiesProps extends DisableExtraOptions {
  onLoadMore: () => Promise<void>;
  isLoadMore: boolean;
  relatedEntities?: IBotSelectOption[];
  relatedEntityValue?: RelatedValue;
  onRelatedSelect?: (item: IBotSelectOption) => void;
  relatedBotPanelStyle?: CSSProperties;
}

export interface VariablesPanelProps {
  onVariableSelect?: (value?: string) => void;
  variableValue?: string;
  variablePanelStyle?: CSSProperties;
  variablesFormatter?: (variables: Variable[]) => Variable[];
}

export interface BotProjectVariableSelectProps extends DisableExtraOptions {
  className?: string;
  onVariableSelect?: (value?: string) => void;
  variablesFormatter?: (variables: Variable[]) => Variable[];
  relatedEntityValue?: RelatedValue;
  variableValue?: string;
  variablePanelStyle?: CSSProperties;
  relatedBotPanelStyle?: CSSProperties;
  customVariablePanel?: ReactNode;
}
