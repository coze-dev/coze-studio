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

import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozMinusCircle, IconCozEdit } from '@coze-arch/coze-design/icons';
import { type ColumnProps, Tooltip, Space } from '@coze-arch/coze-design';
import { UIButton, Popconfirm } from '@coze-arch/bot-semi';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getStatus } from '@/utils/time';

import styles from './index.module.less';
export const ColumnOpBody: FC<{
  record: PersonalAccessToken;
  isCurrentUser?: boolean;
  onEdit: (v: PersonalAccessToken) => void;
  onDelete: (id: string) => void;
  afterConfirmDelete?: () => void;
  afterCancelDelete?: () => void;
}> = ({
  record,
  isCurrentUser,
  onEdit,
  onDelete,
  afterConfirmDelete,
  afterCancelDelete,
}) => {
  const isActive = getStatus(record?.expire_at as number);

  return (
    <Space align="center" spacing={17}>
      <Tooltip
        content={
          isCurrentUser
            ? I18n.t(isActive ? 'Edit' : 'not_support_edit_1')
            : I18n.t('org_api_pat_edit_reminder')
        }
      >
        <UIButton
          onClick={() => onEdit(record)}
          className={classNames(styles['btn-frame'], {
            [styles['btn-frame-disabled']]: !isActive,
          })}
          theme="borderless"
          icon={<IconCozEdit className={styles.icon} />}
          disabled={!isActive || !isCurrentUser}
        ></UIButton>
      </Tooltip>
      <Popconfirm
        style={{ width: 400 }}
        okType="danger"
        trigger="click"
        onConfirm={() => {
          onDelete(`${record?.id}`);
          afterConfirmDelete?.();
        }}
        onCancel={() => {
          afterCancelDelete?.();
        }}
        content={I18n.t('remove_token_1')}
        title={I18n.t('remove_token_reminder_1')}
      >
        <div>
          <Tooltip content={I18n.t('Remove')}>
            <UIButton
              className={styles['btn-frame']}
              theme="borderless"
              icon={<IconCozMinusCircle className={styles.icon} />}
            ></UIButton>
          </Tooltip>
        </div>
      </Popconfirm>
    </Space>
  );
};

export const columnOpConf: () => ColumnProps<PersonalAccessToken> = () => ({
  title: I18n.t('coze_api_list5'),
  width: 120,
  render: (_: string, _record: unknown) => null,
});
