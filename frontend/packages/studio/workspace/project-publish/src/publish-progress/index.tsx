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

import { useParams } from 'react-router-dom';
import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  ConnectorPublishStatus,
  type PublishRecordDetail,
  PublishRecordStatus,
  ResourceType,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlugin, IconCozWorkflow } from '@coze-arch/coze-design/icons';
import {
  type StepProps,
  Steps,
  TagGroup,
  Typography,
} from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { type UITagProps } from '@coze-arch/bot-semi';

import { useWebSdkGuideModal } from '@/web-sdk-guide';
import { WEB_SDK_CONNECTOR_ID } from '@/utils/constants';
import { type ProjectPublishStore } from '@/store';

import { PublishStepTitle } from './components/publish-step-title';
import { PublishStepIcon } from './components/publish-step-icon';
import {
  ConnectorStatus,
  type ConnectorStatusProps,
} from './components/connector-status';

function getDefaultStepProps(title: string): StepProps {
  return {
    icon: <PublishStepIcon status="wait" />,
    title: <PublishStepTitle title={title} />,
  };
}

function toPackStepProps(
  record: PublishRecordDetail,
  tagGroupRef: React.RefObject<HTMLDivElement>,
  maxTagCount?: number,
): StepProps {
  const title = I18n.t('project_release_package');
  if (typeof record.publish_status !== 'number') {
    return getDefaultStepProps(title);
  }
  switch (record.publish_status) {
    case PublishRecordStatus.Packing: {
      return {
        icon: <PublishStepIcon status="process" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_in_progress')}
            color="brand"
          />
        ),
      };
    }
    case PublishRecordStatus.PackFailed: {
      const tags: UITagProps[] | undefined =
        record.publish_status_detail?.pack_failed_detail?.map(item => ({
          tagKey: item.entity_id,
          className: 'pack-status-tag',
          prefixIcon:
            item.entity_type === ResourceType.Workflow ? (
              <IconCozWorkflow />
            ) : (
              <IconCozPlugin />
            ),
          children: item.entity_name,
        }));
      return {
        icon: <PublishStepIcon status="error" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_package_failed')}
            color="red"
          />
        ),
        description: tags ? (
          <div ref={tagGroupRef}>
            <Typography.Paragraph className="coz-fg-secondary mb-[4px]">
              {I18n.t('project_release_pack_fail_reason')}
            </Typography.Paragraph>
            <TagGroup
              tagList={tags}
              maxTagCount={maxTagCount}
              showPopover
              popoverProps={{
                position: 'top',
                style: {
                  padding: 8,
                  maxWidth: 800,
                },
              }}
            />
          </div>
        ) : null,
      };
    }
    default: {
      return {
        icon: <PublishStepIcon status="finish" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_finish')}
            color="green"
          />
        ),
      };
    }
  }
}

function PackStep(props: { record: PublishRecordDetail }) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxTagCount, setMaxTagCount] = useState<number | undefined>(undefined);
  const stepProps = toPackStepProps(props.record, ref, maxTagCount);

  /**
   * TagGroup only supports setting maxTagCount to control the number of display tags, not the number of display rows.
   * Here, the number of rows it is in is determined by iterating over the offsetTop of all Tags, and maxTagCount
   * Set to just enough to display the number of two rows.
   */
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const tags = ref.current.getElementsByClassName(
      'pack-status-tag',
    ) as HTMLCollectionOf<HTMLElement>;
    if (tags.length <= 0) {
      return;
    }
    let top = -1;
    let rowCount = 0;
    for (let i = 0; i < tags.length; i++) {
      const tagTop = tags[i].offsetTop;
      if (top !== tagTop) {
        top = tagTop;
        rowCount++;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- offsetTop The third change, the current Tag is in the third line
        if (rowCount >= 3) {
          setMaxTagCount(i);
          break;
        }
      }
    }
  }, [props.record.publish_status_detail?.pack_failed_detail]);

  return <Steps.Step {...stepProps} />;
}

function toAuditStepProps(record: PublishRecordDetail): StepProps {
  const title = I18n.t('project_release_coze_audit');
  if (typeof record.publish_status !== 'number') {
    return getDefaultStepProps(title);
  }
  switch (record.publish_status) {
    case PublishRecordStatus.Packing:
    case PublishRecordStatus.PackFailed: {
      return getDefaultStepProps(title);
    }
    case PublishRecordStatus.Auditing: {
      return {
        status: 'process',
        icon: <PublishStepIcon status="process" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_in_progress')}
            color="brand"
          />
        ),
      };
    }
    case PublishRecordStatus.AuditNotPass: {
      return {
        status: 'error',
        icon: <PublishStepIcon status="error" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_not_pass')}
            color="red"
          />
        ),
      };
    }
    default: {
      return {
        status: 'finish',
        icon: <PublishStepIcon status="finish" />,
        title: (
          <PublishStepTitle
            title={title}
            tag={I18n.t('project_release_pass')}
            color="green"
          />
        ),
      };
    }
  }
}

function getConnectorsPublishStatus(
  record: ProjectPublishStore['publishRecordDetail'],
) {
  const connectorResults = record.connector_publish_result ?? [];
  if (connectorResults.length <= 0) {
    return 'wait';
  }
  const failedCount = connectorResults.filter(
    item => item.connector_publish_status === ConnectorPublishStatus.Failed,
  ).length;
  if (failedCount > 0) {
    // All channels failed with a red cross; some channels failed with a yellow exclamation mark
    return failedCount === connectorResults.length ? 'error' : 'warn';
  }
  const publishingCount = connectorResults.filter(
    item =>
      item.connector_publish_status === ConnectorPublishStatus.Default ||
      item.connector_publish_status === ConnectorPublishStatus.Auditing,
  ).length;
  if (publishingCount > 0) {
    // Some channels are in the release, showing the clock icon.
    return 'process';
  }
  return 'finish';
}

function toPublishStepProps(
  record: ProjectPublishStore['publishRecordDetail'],
  onShowWebSdkGuide: ConnectorStatusProps['onShowWebSdkGuide'],
): StepProps {
  const title = I18n.t('project_release_channel');
  if (typeof record.publish_status !== 'number') {
    return getDefaultStepProps(title);
  }
  // The "Channel Review and Publish" step has not been reached, the default gray clock icon is displayed
  if (record.publish_status < PublishRecordStatus.ConnectorPublishing) {
    return {
      ...getDefaultStepProps(title),
      description: record.connector_publish_result?.map(item => (
        <ConnectorStatus result={item} showTag={false} />
      )),
    };
  }
  return {
    icon: <PublishStepIcon status={getConnectorsPublishStatus(record)} />,
    title: (
      <PublishStepTitle
        title={title}
        {...(IS_OVERSEA &&
          // publish_monetization_result nil indicates that the interface may fail and does not show
          record.publish_monetization_result === false && {
            tag: I18n.t('monetization_publish_fail'),
            color: 'red',
          })}
      />
    ),
    description: record.connector_publish_result?.map(item => (
      <ConnectorStatus result={item} onShowWebSdkGuide={onShowWebSdkGuide} />
    )),
  };
}

function PublishStep(props: { record: PublishRecordDetail }) {
  const { project_id = '' } = useParams<DynamicParams>();
  const { node, show: showWebSdkGuideModal } = useWebSdkGuideModal();
  const onShowWebSdkGuide = (workflowId: string) =>
    showWebSdkGuideModal({
      projectId: project_id,
      workflowId,
      version: props.record.connector_publish_result?.find(
        item => item.connector_id === WEB_SDK_CONNECTOR_ID,
      )?.connector_bind_info?.sdk_version,
    });
  const stepProps = toPublishStepProps(props.record, onShowWebSdkGuide);
  return (
    <>
      <Steps.Step {...stepProps} />
      {node}
    </>
  );
}

export interface ProjectPublishProgressProps {
  record: ProjectPublishStore['publishRecordDetail'];
}

export function ProjectPublishProgress({
  record,
}: ProjectPublishProgressProps) {
  return (
    <Steps type="basic" direction="vertical" size="small">
      <PackStep record={record} />
      <Steps.Step {...toAuditStepProps(record)} />
      <PublishStep record={record} />
    </Steps>
  );
}
