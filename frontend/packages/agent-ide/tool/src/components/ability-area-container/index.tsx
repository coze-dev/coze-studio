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
