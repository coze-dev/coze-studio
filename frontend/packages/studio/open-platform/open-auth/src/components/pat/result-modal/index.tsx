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

import copy from 'copy-to-clipboard';
import { useMemoizedFn } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import {
  UIModal,
  Typography,
  Toast,
  Space,
  Tooltip,
} from '@coze-arch/bot-semi';
import { type CreatePersonalAccessTokenAndPermissionResponseData } from '@coze-arch/bot-api/pat_permission_api';

import { getExpirationTime } from '@/utils/time';

import s from './index.module.less';

interface ResultProps {
  data?: CreatePersonalAccessTokenAndPermissionResponseData;
  visible: boolean;
  onOk: () => void;
}

// New Edit PAT
export const ResultModal = ({ visible, onOk, data }: ResultProps) => {
  const doCopyAsync = useMemoizedFn(() => {
    const targetKey = data?.token;
    if (targetKey) {
      doCopy(targetKey);
    }
  });

  const doCopy = useMemoizedFn(targetText => {
    const res = copy(targetText);
    if (!res) {
      throw new Error('custom error');
    }
    Toast.success({
      content: I18n.t('token_copied_1'),
      showClose: false,
    });
  });
  return (
    <UIModal
      className={s['result-frame']}
      title={I18n.t('new_pat_1')}
      visible={visible}
      width={560}
      centered
      onOk={onOk}
      onCancel={onOk}
      okText={I18n.t('confirm')}
      footer={null}
    >
      <p className={s['warn-text']}>{I18n.t('new_pat_reminder_1')}</p>
      <p className={s['title-text']}>{I18n.t('coze_api_list1')}</p>
      <Typography.Paragraph className={s.para} ellipsis={{ rows: 1 }}>
        {data?.personal_access_token?.name ?? '-'}
      </Typography.Paragraph>
      <p className={s['title-text']}>{I18n.t('expire_time_1')}</p>
      <Typography.Paragraph className={s.para} ellipsis={{ rows: 1 }}>
        {getExpirationTime(data?.personal_access_token.expire_at as number)}
      </Typography.Paragraph>
      <p className={s['title-text']}>{I18n.t('token_key_1')}</p>
      <Space spacing={4} className={s.sp}>
        <Typography.Paragraph className={s['key-text']} ellipsis={{ rows: 1 }}>
          {data?.token}
        </Typography.Paragraph>
        <Tooltip content={I18n.t('Copy')}>
          <IconCozCopy className={s.icon} onClick={doCopyAsync} />
        </Tooltip>
      </Space>
    </UIModal>
  );
};
