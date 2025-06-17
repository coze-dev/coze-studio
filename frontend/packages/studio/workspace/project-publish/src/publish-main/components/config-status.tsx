import {
  ConnectorBindType,
  ConnectorClassification,
  ConnectorStatus,
  type PublishConnectorInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, type TagProps, Tooltip } from '@coze-arch/coze-design';

import { getConfigStatus } from '../utils/get-config-status';

interface TipTagProps {
  showText: string;
  tip: string;
  tagProps?: TagProps;
}

const TipTag: React.FC<TipTagProps> = ({ showText, tip, tagProps }) => (
  <Tooltip content={tip}>
    {showText ? (
      <Tag color="yellow" {...tagProps} size="mini" className="font-[500]">
        {showText}
        <IconCozInfoCircle />
      </Tag>
    ) : (
      <IconCozInfoCircle />
    )}
  </Tooltip>
);

/** 需要展示配置状态的渠道类别 */
const Classes = [
  ConnectorClassification.SocialPlatform,
  ConnectorClassification.MiniProgram,
  ConnectorClassification.CozeSpaceExtensionLibrary,
];

export const ConfigStatus = ({ record }: { record: PublishConnectorInfo }) => {
  if (
    !Classes.includes(record.connector_classification) ||
    record.bind_type === ConnectorBindType.NoBindRequired
  ) {
    return null;
  }

  const { text, color } = getConfigStatus(record);

  return (
    <div className="flex gap-[6px]">
      {/* 配置状态 */}
      <Tag color={color} size="mini" className="font-[500]">
        {text}
      </Tag>
      {record?.connector_status === ConnectorStatus.Normal ? null : (
        <TipTag
          showText={
            record?.connector_status === ConnectorStatus.InReview
              ? I18n.t('bot_publish_columns_status_in_review')
              : I18n.t('bot_publish_columns_status_offline')
          }
          tip={
            record?.connector_status === ConnectorStatus.InReview
              ? I18n.t('bot_publish_in_review_notice')
              : I18n.t('bot_publish_offline_notice_no_certain_time', {
                  platform: record?.name,
                })
          }
        />
      )}
    </div>
  );
};
