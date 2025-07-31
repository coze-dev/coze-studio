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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconButton,
  Tag,
  Typography,
  Space,
  Avatar,
} from '@coze-arch/coze-design';
import { IconCardSearchOutlined, IconEdit } from '@coze-arch/bot-icons';
import {
  CreationMethod,
  type GetPluginInfoResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { IconTickCircle, IconClock } from '@douyinfe/semi-icons';

import { OauthHeaderAction } from '../../components/oauth-action';
import { PLUGIN_PUBLISH_MAP } from '../../common';

import s from './index.module.less';

const { Text } = Typography;

const PluginHeader = ({
  pluginInfo,
  loading,
  canEdit,
  extraRight,
  onClickEdit,
}: {
  pluginInfo: GetPluginInfoResponse;
  loading: boolean;
  canEdit: boolean;
  extraRight?: ReactNode;
  onClickEdit?: () => void;
}) => (
  <Space
    className={classNames(
      s['plugin-detail-info'],
      'w-full',
      'px-[16px]',
      'py-[16px]',
      'shrink-0',
      'grow-0',
    )}
    spacing={20}
  >
    <Space style={{ flex: 1 }} spacing={12}>
      <Avatar
        className={classNames(s['plugin-detail-avatar'])}
        size="medium"
        shape="square"
        src={pluginInfo?.meta_info?.icon?.url}
      />
      <div>
        <div>
          <Space spacing={4} className="mb-1">
            <Text
              ellipsis={{
                showTooltip: {
                  opts: { style: { wordBreak: 'break-word' } },
                },
              }}
              className={classNames(s['plugin-detail-title'])}
            >
              {pluginInfo?.meta_info?.name}
            </Text>
            {!loading ? (
              <IconButton
                icon={canEdit ? <IconEdit /> : <IconCardSearchOutlined />}
                size="small"
                color="secondary"
                className={classNames(s['edit-plugin-btn'], {
                  [s.edit]: canEdit,
                })}
                onClick={onClickEdit}
              />
            ) : null}
          </Space>
        </div>
        <Space spacing={4}>
          <Tag size="mini" color="primary">
            <Space spacing={2}>
              {pluginInfo?.published ? (
                <IconTickCircle
                  size="small"
                  style={{
                    color: PLUGIN_PUBLISH_MAP.get(Boolean(pluginInfo.published))
                      ?.color,
                  }}
                />
              ) : (
                <IconClock
                  size="small"
                  style={{
                    color: PLUGIN_PUBLISH_MAP.get(
                      Boolean(pluginInfo?.published),
                    )?.color,
                  }}
                />
              )}
              {PLUGIN_PUBLISH_MAP.get(Boolean(pluginInfo?.published))?.label}
            </Space>
          </Tag>
          {pluginInfo?.creation_method === CreationMethod.IDE && (
            <Tag size="mini" color="purple">
              {I18n.t('plugin_mark_created_by_ide')}
            </Tag>
          )}
          <Text
            ellipsis={{
              showTooltip: {
                opts: {
                  style: {
                    wordBreak: 'break-word',
                    maxWidth: '560px',
                  },
                },
              },
            }}
            className={classNames(s['plugin-detail-desc'])}
          >
            {pluginInfo?.meta_info?.desc}
          </Text>
          <OauthHeaderAction />
        </Space>
      </div>
    </Space>
    {/* filter */}
    {extraRight ? <Space spacing={12}>{extraRight}</Space> : null}
  </Space>
);

export default PluginHeader;
