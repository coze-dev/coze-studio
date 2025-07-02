import {
  type PublishRecordDetail,
  PublishRecordStatus,
  ConnectorPublishStatus,
} from '@coze-arch/idl/intelligence_api';

/**
 * 判断发布过程是否已经结束，可以停止轮询
 */
export function isPublishFinish(record: PublishRecordDetail) {
  // project 打包失败/审核不通过
  const projectFinish =
    record.publish_status === PublishRecordStatus.PackFailed ||
    record.publish_status === PublishRecordStatus.AuditNotPass;
  // 所有渠道均处于 审核中/失败/成功 状态
  const connectorsFinish =
    record.connector_publish_result?.every(
      item =>
        item.connector_publish_status === ConnectorPublishStatus.Auditing ||
        item.connector_publish_status === ConnectorPublishStatus.Failed ||
        item.connector_publish_status === ConnectorPublishStatus.Success,
    ) ?? false;
  return projectFinish || connectorsFinish;
}
