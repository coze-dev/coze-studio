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

import { type MouseEventHandler } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Button, Modal } from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { DeveloperApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

import { useProjectPublishStore } from '../../../store';

interface UnbindButtonProps {
  bindId: string;
  checked: boolean;
  connectorId: string;
  className?: string;
  onClick: MouseEventHandler;
}

const PROJECT_AGENT_TYPE = 1;

// Unpublish for APIs or WebSDKs
export const UndoButton = (props: UnbindButtonProps) => {
  const {
    bindId,
    checked,
    connectorId,
    className,
    onClick: inputOnclick,
  } = props;
  const { space_id = '', project_id = '' } = useParams<DynamicParams>();

  const { setProjectPublishInfo, selectedConnectorIds, connectorList } =
    useProjectPublishStore(
      useShallow(state => ({
        selectedConnectorIds: state.selectedConnectorIds,
        setProjectPublishInfo: state.setProjectPublishInfo,
        connectorList: state.connectorList,
      })),
    );

  const handleUnbind: MouseEventHandler = e => {
    inputOnclick(e);
    Modal.confirm({
      title: I18n.t('project_release_cancel1'),
      content: I18n.t('project_release_cancel1_desc'),
      okText: I18n.t('project_release_cancel'),
      okButtonColor: 'red',
      cancelText: I18n.t('Cancel'),
      onOk: async () => {
        await DeveloperApi.UnBindConnector({
          bind_id: bindId,
          agent_type: PROJECT_AGENT_TYPE,
          space_id,
          bot_id: project_id,
          connector_id: connectorId,
        });
        setProjectPublishInfo({
          selectedConnectorIds: selectedConnectorIds.filter(
            id => id !== connectorId,
          ),
          connectorList: connectorList.map(item => {
            if (item.id === connectorId) {
              return {
                ...item,
                bind_id: '',
              };
            }
            return item;
          }),
        });
      },
    });
  };
  return bindId && checked ? (
    <Button
      onClick={handleUnbind}
      size="small"
      color="primary"
      className={classNames('w-max', className)}
    >
      {I18n.t('project_release_cancel')}
    </Button>
  ) : null;
};
