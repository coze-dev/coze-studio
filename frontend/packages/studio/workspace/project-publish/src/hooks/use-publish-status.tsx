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
  // project 本身失败 或 部分渠道发布失败 -> 整体失败
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
  // project 本身发布中 或 部分渠道发布中 -> 整体发布中
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

  // 轮询最新发布记录，直到不属于“发布中”状态后停止
  const latestRecordRequest = useRequest(
    () => intelligenceApi.GetPublishRecordDetail({ project_id: projectId }),
    {
      manual: true,
      pollingInterval: 5000,
      pollingWhenHidden: false,
      pollingErrorRetryCount: 3,
      onSuccess: res => {
        const record = res.data;
        // 没有发布记录时停止轮询
        if (!record || typeof record.publish_status !== 'number') {
          latestRecordRequest.cancel();
          return;
        }
        setStatus(toPublishStatus(record));
        setLatestRecord(record);
        // 首次请求最新发布记录后，默认选中其版本号
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

  // 获取发布记录列表
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

  // 用户有“发布”权限时，启动轮询
  useEffect(() => {
    if (!hasPermission || defaultRecordID) {
      return;
    }
    latestRecordRequest.run();
  }, [hasPermission, defaultRecordID]);

  // 手动请求选择的发布记录
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
        // Tag 组件默认 display: inline-flex, 而外层 span line-height > 1, 会导致其高度大于 Tag 本身
        className="flex !px-[3px] font-medium"
      >
        {I18n.t(tagConfig.text)}
      </Tag>
    ),
  };
}
