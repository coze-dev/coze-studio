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
  type publish,
  ConnectorPublishStatus,
} from '@coze-arch/idl/intelligence_api';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  CozAvatar,
  Tag,
  type TagProps,
  Typography,
} from '@coze-arch/coze-design';

import {
  MINI_PROGRAM_DOUYIN_DOWNLOAD_CONNECTOR_ID,
  MINI_PROGRAM_WECHAT_DOWNLOAD_CONNECTOR_ID,
  WEB_SDK_CONNECTOR_ID,
} from '@/utils/constants';

function getMiniProgramGuideUrl(connectorId?: string) {
  switch (connectorId) {
    case MINI_PROGRAM_DOUYIN_DOWNLOAD_CONNECTOR_ID:
      return '/docs/guides/publish_app_to_douyin_microapp';
    case MINI_PROGRAM_WECHAT_DOWNLOAD_CONNECTOR_ID:
      return '/docs/guides/publish_app_to_wechat_mini_program';
    default:
      return '';
  }
}

export interface ConnectorStatusProps {
  result: publish.ConnectorPublishResult;
  showTag?: boolean;
  onShowWebSdkGuide?: (workflowId: string) => void;
}

const ConnectorTagMap: Record<
  ConnectorPublishStatus,
  (Pick<TagProps, 'color'> & { text: I18nKeysNoOptionsType }) | null
> = {
  [ConnectorPublishStatus.Default]: {
    color: 'brand',
    text: 'project_releasing',
  },
  [ConnectorPublishStatus.Auditing]: {
    color: 'brand',
    text: 'under_review',
  },
  [ConnectorPublishStatus.Failed]: {
    color: 'red',
    text: 'project_release_failed',
  },
  [ConnectorPublishStatus.Success]: {
    color: 'green',
    text: 'project_release_success',
  },
  [ConnectorPublishStatus.Disable]: null, // The corresponding state will not be returned to the front end and will not be adapted.
};

export function ConnectorStatus({
  result,
  showTag,
  onShowWebSdkGuide,
}: ConnectorStatusProps) {
  const tagConfig = ConnectorTagMap[result.connector_publish_status ?? 0];
  // When the Web SDK channel is successfully released, the installation instructions will be displayed
  const shouldShowWebSdkGuide =
    result.connector_id === WEB_SDK_CONNECTOR_ID &&
    result.connector_publish_status === ConnectorPublishStatus.Success;
  const workflowId =
    result.connector_publish_config?.selected_workflows?.[0]?.workflow_id;
  const showWebSdkGuide = () => onShowWebSdkGuide?.(workflowId ?? '');
  return (
    <div
      className="h-[40px] flex items-center border-0 border-b border-solid coz-stroke-primary last:border-none"
      key={result.connector_id}
    >
      <CozAvatar
        size="small"
        type="platform"
        className="mr-[8px] rounded-[6px] shrink-0"
        src={result.connector_icon_url}
      />
      <Typography.Text
        weight={500}
        className="whitespace-nowrap"
        ellipsis={{ showTooltip: true }}
      >
        {result.connector_name}
      </Typography.Text>
      {showTag !== false && tagConfig ? (
        <Tag
          size="mini"
          color={tagConfig.color}
          className="!px-[4px] ml-[4px] shrink-0"
        >
          {I18n.t(tagConfig.text)}
        </Tag>
      ) : null}
      <div className="px-[8px] ml-auto max-w-[206px]">
        {result.connector_publish_status_msg ? (
          <Typography.Text
            type="secondary"
            fontSize="14px"
            ellipsis={{
              showTooltip: {
                type: 'tooltip',
                opts: {
                  theme: 'dark',
                  style: {
                    maxWidth: 200,
                  },
                },
              },
            }}
          >
            {result.connector_publish_status_msg}
          </Typography.Text>
        ) : null}
        {/* Web SDK Channel - Installation Guide */}
        {shouldShowWebSdkGuide ? (
          <Typography.Text fontSize="14px" link onClick={showWebSdkGuide}>
            {I18n.t('project_release_guide')}
          </Typography.Text>
        ) : null}
        {/* Mini Program Channel - Download Code & Installation Guide */}
        {result.download_link ? (
          <>
            <Typography.Text
              fontSize="14px"
              link={{ href: result.download_link, target: '_blank' }}
            >
              {I18n.t('project_release_download_code')}
            </Typography.Text>
            <Typography.Text
              className="ml-[12px]"
              fontSize="14px"
              link={{
                href: getMiniProgramGuideUrl(result.connector_id),
                target: '_blank',
              }}
            >
              {I18n.t('project_release_guide')}
            </Typography.Text>
          </>
        ) : null}
        {result.share_link ? (
          <Typography.Text
            fontSize="14px"
            link={{ href: result.share_link, target: '_blank' }}
          >
            {I18n.t('project_release_open_in_store')}
          </Typography.Text>
        ) : null}
      </div>
    </div>
  );
}
