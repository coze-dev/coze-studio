import {
  type PublishConnectorInfo,
  type PublishResultStatus,
} from '@coze-arch/bot-api/developer_api';

export type ConnectResultInfo = PublishConnectorInfo & {
  publish_status: PublishResultStatus;
  fail_text?: string;
};
