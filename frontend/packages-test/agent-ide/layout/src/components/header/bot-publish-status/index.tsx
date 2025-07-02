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
