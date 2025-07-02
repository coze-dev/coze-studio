import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

import EventEmitter from 'eventemitter3';
import { type BotMode } from '@coze-arch/bot-api/developer_api';

import { isValidContext } from '../utils/is-valid-context';
import { type IAbilityStoreState } from '../typings/store';
import { type IEventCenterEventName } from '../typings/scoped-events';
import { type Nullable } from '../typings/index';
import { type IEventCallbacks } from '../typings/event-callbacks';
import { type ToolAreaStore } from '../store/tool-area';
import { type AgentAreaStore } from '../store/agent-area';
import { AbilityStoreProvider } from '../hooks/store/use-ability-store-context';
import { useCreateStore } from '../hooks/builtin/use-create-store';

type IAbilityAreaContext = Nullable<{
  store: {
    useToolAreaStore: ToolAreaStore;
    useAgentAreaStore: AgentAreaStore;
  };
  scopedEventBus: EventEmitter<IEventCenterEventName>;
  eventCallbacks: Partial<IEventCallbacks>;
}>;

const DEFAULT_ABILITY_AREA: IAbilityAreaContext = {
  store: null,
  scopedEventBus: null,
  eventCallbacks: null,
};

const AbilityAreaContext =
  createContext<IAbilityAreaContext>(DEFAULT_ABILITY_AREA);

export const AbilityAreaContextProvider: FC<
  PropsWithChildren<{
    eventCallbacks?: Partial<IEventCallbacks>;
    mode: BotMode;
    modeSwitching: boolean;
    isInit: boolean;
  }>
> = ({ children, eventCallbacks = {}, mode, modeSwitching, isInit }) => {
  const store = useCreateStore();
  const scopedEventBus = useMemo(() => new EventEmitter<string>(), []);

  const { useToolAreaStore, useAgentAreaStore } = store;

  const clearAgentAreaStore = useAgentAreaStore(state => state.clearStore);
  const {
    updateIsInitialed,
    updateIsModeSwitching,
    clearStore: clearToolAreaStore,
  } = useToolAreaStore.getState();
  /**
   * 清除
   */
  useEffect(() => {
    updateIsModeSwitching(modeSwitching);

    if (modeSwitching || !isInit) {
      return;
    }

    updateIsInitialed(true);
    eventCallbacks?.onInitialed?.();

    const cleanUp = () => {
      updateIsInitialed(false);
      eventCallbacks?.onDestroy?.();
      clearToolAreaStore();
      clearAgentAreaStore();
    };

    return cleanUp;
  }, [mode, modeSwitching, isInit]);

  return (
    <AbilityAreaContext.Provider
      value={{
        store,
        scopedEventBus,
        eventCallbacks,
      }}
    >
      <AbilityStore>{children}</AbilityStore>
    </AbilityAreaContext.Provider>
  );
};

const AbilityStore: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<IAbilityStoreState>({});

  return (
    <AbilityStoreProvider state={state} setState={setState}>
      {children}
    </AbilityStoreProvider>
  );
};

export const useAbilityAreaContext = () => {
  const toolAreaContext = useContext(AbilityAreaContext);

  if (!isValidContext(toolAreaContext)) {
    throw new Error('toolAreaContext is not valid');
  }

  return toolAreaContext;
};
