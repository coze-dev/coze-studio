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

/* eslint-disable @coze-arch/max-line-per-function */
import { useMemo, type FC } from 'react';

import semver from 'semver';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { type VersionMetaInfo, OperateType } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import {
  Avatar,
  IconButton,
  Menu,
  Space,
  Tag,
  Typography,
} from '@coze-arch/coze-design';

import { type WorkflowCommitListProps } from './type';

export interface CommitItemProps {
  className?: string;
  data: VersionMetaInfo;
  /** Is it selected? */
  isActive?: boolean;
  readonly?: WorkflowCommitListProps['readonly'];
  enablePublishPPE?: WorkflowCommitListProps['enablePublishPPE'];
  onClick?: WorkflowCommitListProps['onItemClick'];
  onPublishPPE?: WorkflowCommitListProps['onPublishPPE'];
  onResetToCommit?: WorkflowCommitListProps['onResetToCommit'];
  onShowCommit?: WorkflowCommitListProps['onShowCommit'];
  /** Hide action drop-down menu */
  hiddenActionMenu?: boolean;
  /** Hide commitId */
  hideCommitId?: boolean;
}

const { Text } = Typography;

// eslint-disable-next-line complexity
export const CommitItem: FC<CommitItemProps> = ({
  className,
  data,
  readonly,
  isActive,
  hiddenActionMenu,
  enablePublishPPE,
  onClick,
  onPublishPPE,
  onResetToCommit,
  onShowCommit,
  hideCommitId,
}) => {
  const action = hiddenActionMenu ? null : (
    <Menu
      className="min-w-[96px] mb-2px flex-shrink-0"
      trigger="hover"
      stopPropagation={true}
      position="bottomRight"
      render={
        <Menu.SubMenu mode="menu">
          <Menu.Item
            onClick={(_, e) => {
              e.stopPropagation();
              onShowCommit?.(data);
            }}
          >
            {I18n.t('bmv_view_version')}
          </Menu.Item>
          <Menu.Item
            onClick={(_, e) => {
              e.stopPropagation();
              onResetToCommit?.(data);
            }}
          >
            {I18n.t('bmv_load_to_draft')}
          </Menu.Item>
          {enablePublishPPE ? (
            <Menu.Item
              onClick={(_, e) => {
                e.stopPropagation();
                onPublishPPE?.(data);
              }}
            >
              {I18n.t('bmv_pre_release_to_lane')}
            </Menu.Item>
          ) : null}
        </Menu.SubMenu>
      }
    >
      <IconButton
        color="secondary"
        iconSize="small"
        icon={
          <>
            <IconCozMore className="rotate-90" />
          </>
        }
      />
    </Menu>
  );

  const time = useMemo(
    () =>
      data.create_time
        ? dayjs(data.create_time).format('YYYY-MM-DD HH:mm:ss')
        : '',
    [data],
  );

  return (
    <div
      className={classNames(
        'commit-item',
        isActive && 'active',
        'p-2 rounded-mini',
        isActive && 'coz-mg-hglt',
        !readonly && !isActive && 'hover:coz-mg-secondary',
        !readonly && 'cursor-pointer',
        className,
      )}
      onClick={() => onClick?.(data)}
    >
      <div className="mb-2">
        {data.type === OperateType.SubmitOperate && (
          <Tag size="small">
            {I18n.t('workflow_publish_multibranch_submitted_title')}
          </Tag>
        )}
        {data.type === OperateType.PubPPEOperate && (
          <Tag size="small" color={data.offline ? 'primary' : 'green'}>
            {data.env}
          </Tag>
        )}
        {data.type === OperateType.PublishOperate && (
          <Tag size="small" color={data.offline ? 'primary' : 'green'}>
            {semver.valid(data.version)
              ? data.version
              : I18n.t('bmv_official_version')}
          </Tag>
        )}
      </div>
      {!hideCommitId && (
        <Space className="w-full items-start" vertical spacing={4}>
          <Text
            ellipsis={{
              showTooltip: {
                opts: { content: data.submit_commit_id || data.commit_id },
              },
            }}
          >
            <span className="font-bold mr-2">{I18n.t('bmv_submit_id')}:</span>
            {data.submit_commit_id || data.commit_id}
          </Text>
          {data.type !== OperateType.SubmitOperate &&
          data.offline &&
          data.update_time ? (
            <Text
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: dayjs(data.update_time as number).format(
                      'YYYY-MM-DD HH:mm',
                    ),
                  },
                },
              }}
            >
              <span className="font-bold mr-2">
                {I18n.t('bmv_offline_time')}:
              </span>
              {dayjs(data.update_time as number).format('YYYY-MM-DD HH:mm')}
            </Text>
          ) : null}
        </Space>
      )}

      {data.type === OperateType.PublishOperate && data.desc ? (
        <div>
          <Text ellipsis={{ rows: 4, showTooltip: true }}>{data.desc}</Text>
        </div>
      ) : null}

      <div className="flex items-end mt-2">
        <div>
          <div className="min-w-0 flex items-center mb-1">
            <Avatar
              className="mr-2 flex-shrink-0"
              size="extra-extra-small"
              src={data.user?.user_avatar}
              alt="avatar"
            />
            <Text ellipsis fontSize="12px">
              {data.user?.user_name}
            </Text>
          </div>
          <Text type="secondary" fontSize="12px">
            {time}
          </Text>
        </div>

        <div className="flex-1" />
        {action}
      </div>
    </div>
  );
};
