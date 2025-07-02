import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';

import { merge } from 'lodash-es';

export interface IToolItemContext {
  isForceShowAction: boolean;
  setIsForceShowAction: (visible: boolean) => void;
}

const DEFAULT_TOOL_ITEM_CONTEXT: IToolItemContext = {
  isForceShowAction: false,
  setIsForceShowAction: (visible: boolean) => false,
};

const ToolItemContext = createContext<IToolItemContext>(
  DEFAULT_TOOL_ITEM_CONTEXT,
);

export const ToolItemContextProvider: FC<PropsWithChildren> = props => {
  const { children } = props;

  const [_isForceShowAction, _setIsForceShowAction] = useState(false);

  return (
    <ToolItemContext.Provider
      value={merge({}, DEFAULT_TOOL_ITEM_CONTEXT, {
        isForceShowAction: _isForceShowAction,
        setIsForceShowAction: _setIsForceShowAction,
      })}
    >
      {children}
    </ToolItemContext.Provider>
  );
};

export const useToolItemContext = () => useContext(ToolItemContext);
