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

import { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';
import { Modal, type FormApi } from '@coze-arch/coze-design';

import { ExpirationDate, getExpireAt } from '@/utils/time';
import {
  usePATPermission,
  useCreatePAT,
  useUpdatePAT,
} from '@/hooks/pat/use-token';

export interface FormApiInfo {
  name: string;
  duration_day: ExpirationDate;

  expire_at: Date;
}

interface PatFormProps {
  editInfo?: PersonalAccessToken;
  isCreate: boolean;
  isShowAuthMigrateNotice?: boolean;
  formApi: React.MutableRefObject<FormApi<FormApiInfo> | undefined>;
  validateCustomParams?: () => boolean;
  getCustomParams?: () => Record<string, unknown>;
  afterSubmit?: (params: Record<string, unknown>) => void;
}

const getDurationData = (durationDay: ExpirationDate, expireAt: Date) => ({
  duration_day: durationDay,
  ...(durationDay === ExpirationDate.CUSTOMIZE
    ? { expire_at: getExpireAt(expireAt as Date) }
    : {}),
});

const validateName = (name?: string) => Boolean(name);
const validateDuration = (durationDay?: ExpirationDate, expireAt?: Date) => {
  if (!durationDay) {
    return false;
  }
  if (durationDay === ExpirationDate.CUSTOMIZE && !expireAt) {
    return false;
  }
  return true;
};

const authMigrateNoticeLSKey = 'auth_migrate_notice_do_not_show_again';

const useAuthMigrateNotice = (isShowAuthMigrateNotice?: boolean) => {
  useEffect(() => {
    if (!isShowAuthMigrateNotice) {
      return;
    }
    if (!localStorage.getItem(authMigrateNoticeLSKey)) {
      Modal.info({
        title: I18n.t('api_permissionkey_notification_title'),
        content: I18n.t('api_permissionkey_notification_content'),
        okText: I18n.t('got_it'),
        onOk: () => {
          localStorage.setItem(authMigrateNoticeLSKey, 'true');
        },
        showCancelButton: false,
        closable: false,
        maskClosable: false,
      });
    }
  }, []);
};

export const usePatForm = ({
  editInfo,
  isCreate,
  formApi,
  getCustomParams,
  validateCustomParams,
  afterSubmit,
  isShowAuthMigrateNotice,
}: PatFormProps) => {
  const { patPermission } = usePATPermission({
    patId: editInfo?.id,
  });

  const { loading: createLoading, runCreate, successData } = useCreatePAT();
  const {
    loading: updateLoading,
    runUpdate,
    updateSuccessData,
  } = useUpdatePAT();

  const [isFailToValid, setIsFailToValid] = useState(true);

  const onSubmit = () => {
    const {
      name = '',
      duration_day,
      expire_at,
    } = formApi.current?.getValues() || {};

    const params = {
      name,
      ...(getCustomParams?.() || {}),
    };
    if (isCreate) {
      runCreate({
        ...params,
        ...getDurationData(duration_day as ExpirationDate, expire_at as Date),
      });
    } else {
      runUpdate({ ...params, id: editInfo?.id ?? '' });
    }
    afterSubmit?.({ ...params, duration_day, expire_at });
  };

  const validateParams = () => {
    const { name, duration_day, expire_at } =
      formApi.current?.getValues() || {};

    const nameValid = validateName(name);
    const isCustomParamsValid = validateCustomParams?.() !== false;
    const durationValid = isCreate
      ? validateDuration(duration_day, expire_at)
      : true;
    setIsFailToValid(!(nameValid && isCustomParamsValid && durationValid));
  };

  const onFormValueChange = (
    _values: FormApiInfo,
    _changedValue: FormApiInfo,
  ) => {
    validateParams();
  };

  useEffect(() => {
    if (isCreate) {
      formApi.current?.setValue('name', 'Secret token');
    } else if (patPermission && patPermission?.personal_access_token?.name) {
      formApi.current?.setValue(
        'name',
        patPermission?.personal_access_token?.name,
      );
    }
  }, [patPermission]);

  const ready = isCreate ? true : !!patPermission;

  useAuthMigrateNotice(isShowAuthMigrateNotice);

  return {
    isFailToValid,
    ready,
    loading: updateLoading || createLoading,
    onSubmit,
    onFormValueChange,
    patPermission,
    validateParams,
    successData,
    updateSuccessData,
  };
};
