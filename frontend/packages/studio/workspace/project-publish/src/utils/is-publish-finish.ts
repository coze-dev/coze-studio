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

import {
  type PublishRecordDetail,
  PublishRecordStatus,
  ConnectorPublishStatus,
} from '@coze-arch/idl/intelligence_api';

/**
 * Determine whether the publishing process has ended and stop polling
 */
export function isPublishFinish(record: PublishRecordDetail) {
  // Project packaging failed/review failed
  const projectFinish =
    record.publish_status === PublishRecordStatus.PackFailed ||
    record.publish_status === PublishRecordStatus.AuditNotPass;
  // All channels are under review, failed, or successful
  const connectorsFinish =
    record.connector_publish_result?.every(
      item =>
        item.connector_publish_status === ConnectorPublishStatus.Auditing ||
        item.connector_publish_status === ConnectorPublishStatus.Failed ||
        item.connector_publish_status === ConnectorPublishStatus.Success,
    ) ?? false;
  return projectFinish || connectorsFinish;
}
