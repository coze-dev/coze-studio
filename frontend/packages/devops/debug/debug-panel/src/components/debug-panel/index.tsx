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
