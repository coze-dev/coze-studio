import React from 'react';

export interface TreeContextValue {
  renderLinkNode?: (extInfo: any) => React.ReactNode;
}

export const TreeContext = React.createContext<TreeContextValue>({});
