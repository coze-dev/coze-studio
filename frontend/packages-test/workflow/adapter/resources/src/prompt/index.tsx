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
