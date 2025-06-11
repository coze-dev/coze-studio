import { createContext, useContext } from 'react';

import { type FormApi } from '@coze/coze-design';

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
