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

import { useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';

import { useDataCallbacks } from '@coze-data/knowledge-stores';
import { type DatabaseTabs } from '@coze-data/database-v2-base/types';
import { I18n } from '@coze-arch/i18n';
import { MemoryApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { DatabaseDetail } from '../../components/database-detail';

interface IProps {
  version?: string;
  botId: string;
  spaceId?: string;
  databaseId: string;
  enterFrom: string;
  needHideCloseIcon?: boolean;
  initialTab?: DatabaseTabs;
}

export const DatabaseInner = ({
  version,
  botId,
  spaceId,
  databaseId,
  enterFrom,
  needHideCloseIcon,
  initialTab,
}: IProps) => {
  const { onStatusChange, onUpdateDisplayName } = useDataCallbacks();
  const navigate = useNavigate();
  const [actionText, setActionText] = useState<string>(
    enterFrom === 'bot_add' ? 'Add' : 'Remove',
  );

  const handleAddDatabase = async (id: string) => {
    const res = await MemoryApi.BindDatabase({
      database_id: id,
      bot_id: botId,
    });
    if (res.code === 0) {
      Toast.success('Add database success');
      setActionText('Remove');
    } else {
      Toast.error(res.msg);
    }
  };

  const handleRemoveDatabase = async (id: string) => {
    const res = await MemoryApi.UnBindDatabase({
      database_id: id,
      bot_id: botId,
    });
    if (res.code === 0) {
      Toast.success('Remove database success');
      setActionText('Add');
    } else {
      Toast.error(res.msg);
    }
  };

  const handleAddRemoveDatabase = (id?: string) => {
    if (!id) {
      return;
    }
    if (actionText === 'Add') {
      handleAddDatabase(id);
    } else if (actionText === 'Remove') {
      handleRemoveDatabase(id);
    } else {
      return;
    }
  };

  const handleClose = () => {
    if (window.history.length === 1) {
      navigate(`/space/${spaceId}/library`);
    }
    navigate(-1);
  };

  const addRemoveButtonText = useMemo(() => {
    if (actionText === 'Add') {
      return I18n.t('db2_030');
    } else if (actionText === 'Remove') {
      return I18n.t('db2_031');
    } else {
      return '';
    }
  }, [actionText]);

  return (
    <DatabaseDetail
      version={version}
      enterFrom={enterFrom}
      databaseId={databaseId}
      initialTab={initialTab}
      addRemoveButtonText={addRemoveButtonText}
      onIDECallback={{
        onStatusChange,
        onUpdateDisplayName,
      }}
      onClickAddRemoveButton={handleAddRemoveDatabase}
      needHideCloseIcon={needHideCloseIcon}
      onClose={handleClose}
    />
  );
};
