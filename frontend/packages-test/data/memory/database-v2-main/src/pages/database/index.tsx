import React from 'react';

import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { type DatabaseTabs } from '@coze-data/database-v2-base/types';
import { useSpaceStore } from '@coze-arch/bot-studio-store';

import { DatabaseInner } from '../library';

export interface DatabaseDetailProps {
  needHideCloseIcon?: boolean;
  initialTab?: DatabaseTabs;
  version?: string;
}

export const DatabaseDetail = ({
  version,
  needHideCloseIcon,
  initialTab,
}: DatabaseDetailProps) => {
  const params = useKnowledgeParams();
  const { botID, tableID, biz } = params;
  const spaceId = useSpaceStore(store => store.getSpaceId());

  if (!tableID) {
    return <div>no database id!</div>;
    // return null;
  }

  return (
    <DatabaseInner
      version={version}
      botId={botID ?? ''}
      databaseId={tableID}
      needHideCloseIcon={needHideCloseIcon}
      enterFrom={biz ?? ''}
      spaceId={spaceId ?? ''}
      initialTab={initialTab ?? (params.initialTab as DatabaseTabs)}
    />
  );
};
