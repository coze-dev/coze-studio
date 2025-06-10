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
