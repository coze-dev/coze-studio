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

import { useEffect } from 'react';

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { useDebugPanelStore } from '../../store';
import { SideDebugPanel } from './side-panel';

export interface DebugPanelProps {
  botId: string;
  spaceID?: string;
  userID?: string;
  placement: 'left';
  currentQueryLogId: string;
  isShow: boolean;
  onClose: () => void;
}

export const DebugPanel = (props: DebugPanelProps) => {
  const {
    botId,
    spaceID,
    userID,
    placement,
    currentQueryLogId,
    isShow,
    onClose,
  } = props;
  const { setBasicInfo, setEntranceMessageLogId, setIsPanelShow, resetStore } =
    useDebugPanelStore();

  useEffect(() => {
    setBasicInfo({
      botId,
      spaceID,
      userID,
      placement,
    });
    setEntranceMessageLogId(currentQueryLogId);
    setIsPanelShow(isShow);
  }, [botId, spaceID, userID, placement, isShow, currentQueryLogId]);

  useEffect(() => {
    sendTeaEvent(EVENT_NAMES.debug_page_show, {
      bot_id: botId,
      workspace_id: spaceID,
    });
  }, []);

  const onDebugPanelClose = () => {
    onClose();
  };

  useEffect(
    () => () => {
      resetStore();
    },
    [],
  );

  return <SideDebugPanel onClose={onDebugPanelClose} />;
};
