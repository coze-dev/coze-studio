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

import { useHotkeys } from 'react-hotkeys-hook';
import { Suspense, lazy, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { userStoreService } from '@coze-studio/user-store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { setPCBody } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { Spin } from '@coze-arch/bot-semi';

import { setPCBodyWithDebugPanel } from '../../util';
import { useDebugStore } from '../../store/debug-panel';

import s from './index.module.less';

const DebugPanel = lazy(() => import('@coze-devops/debug-panel'));

export const BotDebugPanel = () => {
  const {
    isDebugPanelShow,
    currentDebugQueryId,
    setIsDebugPanelShow,
    setCurrentDebugQueryId,
  } = useDebugStore();
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );

  const userID = userStoreService.useUserInfo()?.user_id_str ?? '';

  const { id: spaceID } = useSpaceStore(state => state.space);

  useHotkeys('ctrl+k, meta+k', () => {
    if (!isDebugPanelShow) {
      sendTeaEvent(EVENT_NAMES.open_debug_panel, {
        path: 'shortcut_debug',
      });
    }
    setCurrentDebugQueryId('');
    setIsDebugPanelShow(!isDebugPanelShow);
  });

  useEffect(() => {
    if (isDebugPanelShow) {
      setPCBodyWithDebugPanel();
      window.scrollTo(document.body.scrollWidth, 0);
    } else {
      setPCBody();
    }
    return () => {
      setPCBody();
    };
  }, [isDebugPanelShow]);

  useEffect(
    () => () => {
      setCurrentDebugQueryId('');
    },
    [],
  );

  return isDebugPanelShow ? (
    <div className={s.container}>
      <Suspense
        fallback={
          <div className={s['debug-panel-lazy-loading']}>
            <Spin />
          </div>
        }
      >
        <DebugPanel
          isShow={isDebugPanelShow}
          botId={botId}
          userID={userID}
          spaceID={spaceID}
          placement="left"
          currentQueryLogId={currentDebugQueryId}
          onClose={() => {
            setIsDebugPanelShow(false);
            setCurrentDebugQueryId('');
          }}
        />
      </Suspense>
    </div>
  ) : null;
};
