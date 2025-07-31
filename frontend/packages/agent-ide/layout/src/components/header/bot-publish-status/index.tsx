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

import { useState, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFill,
  IconCozInfoCircleFill,
} from '@coze-arch/coze-design/icons';
import { Tag, Popover, Divider } from '@coze-arch/coze-design';
import { ConnectorDynamicStatus } from '@coze-arch/bot-api/developer_api';

import s from '../bot-status/style.module.less';
import { renderWarningContent } from '../bot-status/origin-status';

export const BotPublishStatus = ({
  deployButton,
}: {
  deployButton: ReactNode;
}) => {
  const { connectors, noPublish } = useBotInfoStore(
    useShallow(store => ({
      noPublish: !store.has_publish,
      connectors: store.connectors,
    })),
  );

  const [visible, setVisible] = useState(false);

  const renderPublishStatus = () => {
    const warningList = connectors?.filter(
      item => item.connector_status !== ConnectorDynamicStatus.Normal,
    );
    return warningList?.length ? (
      <Popover
        position="bottomLeft"
        visible={visible}
        content={renderWarningContent({
          warningList,
          onCancel: () => setVisible(false),
          deployButton,
        })}
        trigger="custom"
      >
        <Divider layout="vertical" className="!h-3 mx-2" />
        <Tag
          color="yellow"
          className="!p-0"
          prefixIcon={<IconCozInfoCircleFill />}
          onClick={() => {
            setVisible(true);
          }}
        >
          <div>{I18n.t('bot_status_published')}</div>
        </Tag>
      </Popover>
    ) : (
      <>
        <Divider layout="vertical" className="!h-3 mx-2" />
        <Tag
          color="primary"
          className="!bg-transparent !p-0 !coz-fg-secondary"
          prefixIcon={
            <IconCozCheckMarkCircleFill className="coz-fg-hglt-green" />
          }
        >
          {I18n.t('bot_status_published')}
        </Tag>
      </>
    );
  };

  return (
    <div className={s['status-tag']}>
      {noPublish ? null : renderPublishStatus()}
    </div>
  );
};
