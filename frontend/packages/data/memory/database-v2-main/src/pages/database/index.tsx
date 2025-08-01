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
