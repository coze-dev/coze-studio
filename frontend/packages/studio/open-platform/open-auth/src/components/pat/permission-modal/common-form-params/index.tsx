import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Form, Input } from '@coze-arch/coze-design';
import { type GetPersonalAccessTokenAndPermissionResponseData } from '@coze-arch/bot-api/pat_permission_api';

import {
  ExpirationDate,
  disabledDate,
  getExpirationOptions,
  getExpirationTime,
} from '@/utils/time';
import { Tips } from '@/components/instructions-wrap';

import styles from './index.module.less';

export const CommonFormParams: FC<{
  isCreate?: boolean;
  patPermission?: GetPersonalAccessTokenAndPermissionResponseData;
}> = ({ isCreate, patPermission }) => {
  const [durationDay, setDurationDay] = useState<ExpirationDate>();
  const dataOptionsList = getExpirationOptions();

  return (
    <>
      <Form.Input
        trigger={['blur', 'change']}
        field="name"
        label={{
          text: I18n.t('coze_api_list1'),
          required: true,
        }}
        placeholder={''}
        maxLength={20}
        rules={[{ required: true, message: '' }]}
      />
      <Form.Slot
        label={{
          text: I18n.t('expire_time_1'),
          required: true,
          extra: <Tips tips={I18n.t('expired_time_forbidden_1')} />,
        }}
      >
        {isCreate ? (
          <>
            <div className={styles['expiration-select']}>
              <Form.Select
                noLabel={true}
                field="duration_day"
                style={{ width: '100%' }}
                disabled={!isCreate}
                optionList={dataOptionsList}
                onChange={v => setDurationDay(v as ExpirationDate)}
                rules={[{ required: true, message: '' }]}
                placeholder={I18n.t('select_expired_time_1')}
              />

              {durationDay === ExpirationDate.CUSTOMIZE && (
                <Form.DatePicker
                  noLabel={true}
                  field="expire_at"
                  style={{ width: '100%' }}
                  disabled={!isCreate}
                  disabledDate={disabledDate}
                  position="bottomRight"
                />
              )}
            </div>
          </>
        ) : (
          <Input
            disabled
            value={
              patPermission?.personal_access_token?.expire_at
                ? getExpirationTime(
                    patPermission?.personal_access_token?.expire_at as number,
                  )
                : ''
            }
          />
        )}
      </Form.Slot>
    </>
  );
};
