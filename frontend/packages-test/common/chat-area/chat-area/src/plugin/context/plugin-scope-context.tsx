import React, { createContext, useContext } from 'react';
import { type PropsWithChildren } from 'react';

import { type PluginName } from '../constants/plugin-name';

interface PluginScopeContextProps {
  pluginName?: PluginName;
}

const PluginScopeContext = createContext<PluginScopeContextProps>({});

export const usePluginScopeContext = () => useContext(PluginScopeContext);

export const PluginScopeContextProvider: React.FC<
  PropsWithChildren<PluginScopeContextProps>
> = ({ children, ...props }) => (
  <PluginScopeContext.Provider value={props}>
    {children}
  </PluginScopeContext.Provider>
);
