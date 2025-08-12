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

import React, { useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  ConnectorPublishStatus,
  PublishRecordStatus,
  type PublishRecordDetail,
} from '@coze-arch/idl/intelligence_api';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircle,
  IconCozClock,
  IconCozCrossCircle,
} from '@coze-arch/coze-design/icons';
import { Modal, Select, Tag, type TagProps } from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { intelligenceApi } from '@coze-arch/bot-api';
import { EProjectPermission, useProjectAuth } from '@coze-common/auth';

import { isPublishFinish } from '../utils/is-publish-finish';
import { ProjectPublishProgress } from '../publish-progress';

enum PublishStatus {
  Publishing,
  Failed,
  Success,
}

const PublishStatusMap: Record<
  PublishStatus,
  Pick<TagProps, 'prefixIcon' | 'color'> & { text: I18nKeysNoOptionsType }
> = {
  [PublishStatus.Publishing]: {
    prefixIcon: <IconCozClock />,
    color: 'brand',
    text: 'project_releasing',
  },
  [PublishStatus.Failed]: {
    prefixIcon: <IconCozCrossCircle />,
    color: 'red',
    text: 'project_release_failed',
  },
  [PublishStatus.Success]: {
    prefixIcon: <IconCozCheckMarkCircle />,
    color: 'green',
    text: 'project_release_success',
  },
};

function toPublishStatus(record: PublishRecordDetail) {
  const projectFailed =
    record.publish_status === PublishRecordStatus.PackFailed ||
    record.publish_status === PublishRecordStatus.AuditNotPass;
  const connectorsFailed =
    record.connector_publish_result?.some(
      item => item.connector_publish_status === ConnectorPublishStatus.Failed,
    ) ?? false;
  // The project itself failed, or some channels failed to publish - > overall failed
  if (projectFailed || connectorsFailed) {
    return PublishStatus.Failed;
  }
  const projectPublishing =
    record.publish_status === PublishRecordStatus.Packing ||
    record.publish_status === PublishRecordStatus.Auditing ||
    record.publish_status === PublishRecordStatus.ConnectorPublishing;
  const connectorsPublishing =
    record.connector_publish_result?.some(
      item =>
        item.connector_publish_status === ConnectorPublishStatus.Default ||
        item.connector_publish_status === ConnectorPublishStatus.Auditing,
    ) ?? false;
  // The project itself is being released, or some channels are being released - > the overall release is in progress
  if (projectPublishing || connectorsPublishing) {
    return PublishStatus.Publishing;
  }
  return PublishStatus.Success;
}

export interface ProjectPublishStatusProps {
  spaceId: string;
  projectId: string;
  defaultRecordID?: string;
}

/* eslint @coze-arch/max-line-per-function: ["error", {"max": 300}] */
export function usePublishStatus({
  spaceId,
  projectId,
  defaultRecordID,
}: ProjectPublishStatusProps) {
  const [status, setStatus] = useState<PublishStatus | undefined>();
  const [latestRecord, setLatestRecord] = useState<PublishRecordDetail>();
  const [recordList, setRecordList] = useState<OptionProps[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(defaultRecordID);
  const [selectedRecord, setSelectedRecord] = useState<PublishRecordDetail>();

  const [modalVisible, setModalVisible] = useState(false);

  // Polling the latest release history until it stops when it is not in the "In Release" state
  const latestRecordRequest = useRequest(
    () => intelligenceApi.GetPublishRecordDetail({ project_id: projectId }),
    {
      manual: true,
      pollingInterval: 5000,
      pollingWhenHidden: false,
      pollingErrorRetryCount: 3,
      onSuccess: res => {
        const record = res.data;
        // Stop polling when no record is published
        if (!record || typeof record.publish_status !== 'number') {
          latestRecordRequest.cancel();
          return;
        }
        setStatus(toPublishStatus(record));
        setLatestRecord(record);
        // After first requesting the latest release record, its version number is selected by default
        if (!selectedVersion) {
          setRecordList([
            { value: record.publish_record_id, label: record.version_number },
          ]);
          setSelectedVersion(record.publish_record_id ?? '');
        } else if (selectedVersion === record.publish_record_id) {
          setSelectedRecord(record);
        }
        if (isPublishFinish(record)) {
          latestRecordRequest.cancel();
        }
      },
    },
  );

  // Get a list of publication records
  const recordListRequest = useRequest(
    () => intelligenceApi.GetPublishRecordList({ project_id: projectId }),
    {
      manual: true,
      onSuccess: res => {
        setRecordList(
          res.data?.map(item => ({
            value: item.publish_record_id,
            label: item.version_number,
          })) ?? [],
        );
      },
    },
  );

  const hasPermission = useProjectAuth(
    EProjectPermission.PUBLISH,
    projectId,
    spaceId,
  );

  // When the user has "publish" permission, start polling
  useEffect(() => {
    if (!hasPermission || defaultRecordID) {
      return;
    }
    latestRecordRequest.run();
  }, [hasPermission, defaultRecordID]);

  // Manually request selected release records
  const recordDetailRequest = useRequest(
    (recordId: string) =>
      intelligenceApi.GetPublishRecordDetail({
        project_id: projectId,
        publish_record_id: recordId,
      }),
    {
      manual: true,
      onSuccess: res => {
        const record = res.data;
        setSelectedRecord(record);
        if (record?.publish_record_id === latestRecord?.publish_record_id) {
          setLatestRecord(record);
        }
      },
    },
  );

  const tagConfig = PublishStatusMap[status ?? PublishStatus.Failed];
  const showingRecord = selectedRecord ?? latestRecord;

  const open = async () => {
    await recordListRequest.runAsync();
    if (defaultRecordID) {
      await changeVersion(defaultRecordID);
    }
    setModalVisible(true);
  };

  const close = () => {
    setModalVisible(false);
  };

  const changeVersion = async (version: string) => {
    setSelectedVersion(version);
    await recordDetailRequest.run(version);
  };

  return {
    latestVersion: latestRecord,
    currentVersion: recordList.find(item => item.value === selectedVersion),

    open,

    close,

    modal: (
      <Modal
        title={I18n.t('project_release_stage')}
        visible={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <div className="flex flex-col gap-[16px]">
          <Select
            className="w-full"
            optionList={recordList}
            value={selectedVersion}
            onSelect={version => {
              if (typeof version === 'string') {
                changeVersion(version);
              }
            }}
          />
          {showingRecord ? (
            <ProjectPublishProgress record={showingRecord} />
          ) : null}
        </div>
      </Modal>
    ),
    tag: (
      <Tag
        size="mini"
        prefixIcon={tagConfig.prefixIcon}
        color={tagConfig.color}
        // The Tag component defaults to display: inline-flex, and the outer span line-height > 1 will cause its height to be larger than the Tag itself
        className="flex !px-[3px] font-medium"
      >
        {I18n.t(tagConfig.text)}
      </Tag>
    ),
  };
}
