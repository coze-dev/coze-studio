import { type FC, type PropsWithChildren } from 'react';

import { type BotMode } from '@coze-arch/bot-api/developer_api';

import { InvisibleToolController } from '../invisible-tool-controller';
import { type IEventCallbacks } from '../../typings/event-callbacks';
import {
  type IPreferenceContext,
  PreferenceContextProvider,
} from '../../context/preference-context';
import { AbilityAreaContextProvider } from '../../context/ability-area-context';

type IProps = {
  eventCallbacks?: Partial<IEventCallbacks>;
  mode: BotMode;
  modeSwitching: boolean;
  isInit: boolean;
} & Partial<IPreferenceContext>;

export const AbilityAreaContainer: FC<PropsWithChildren<IProps>> = props => {
  const {
    children,
    eventCallbacks,
    enableToolHiddenMode,
    isReadonly,
    mode,
    modeSwitching,
    isInit,
  } = props;

  return (
    <PreferenceContextProvider
      enableToolHiddenMode={enableToolHiddenMode}
      isReadonly={isReadonly}
    >
      <AbilityAreaContextProvider
        eventCallbacks={eventCallbacks}
        mode={mode}
        modeSwitching={modeSwitching}
        isInit={isInit}
      >
        <InvisibleToolController />
        {children}
      </AbilityAreaContextProvider>
    </PreferenceContextProvider>
  );
};
