/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

export const ToolPaneContext = React.createContext<{
  hideTitle?: boolean;
  focusItemKey?: string;
  focusDragModal?: (v: string) => void;
  reComputeOverflow?: () => void;
  showBackground?: boolean;
}>({});

export const ToolPaneContextProvider = ToolPaneContext.Provider;
