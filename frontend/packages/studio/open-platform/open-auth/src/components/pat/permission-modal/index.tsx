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
  forwardRef,
  type PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type PersonalAccessToken,
  type CreatePersonalAccessTokenAndPermissionResponseData,
  type GetPersonalAccessTokenAndPermissionResponseData,
} from '@coze-arch/bot-api/pat_permission_api';
import { Form, type FormApi, Modal, Spin, Toast } from '@coze-arch/coze-design';

import { usePatForm, type FormApiInfo } from '@/hooks/pat/action/use-pat-form';

import { CommonFormParams } from './common-form-params';

import styles from './index.module.less';

export interface PermissionModalProps {
  editInfo?: PersonalAccessToken;
  isCreate: boolean;
  isReady?: boolean;
  onRefresh: () => void;
  onCreateSuccess: (
    v: CreatePersonalAccessTokenAndPermissionResponseData,
  ) => void;
  onCancel: () => void;
  onPatPermissionChange?: (
    data?: GetPersonalAccessTokenAndPermissionResponseData,
  ) => void;
  onCustomFormValueChange?: (values: unknown, changedValue: unknown) => void;
  validateCustomParams?: () => boolean;
  getCustomParams?: () => Record<string, unknown>;
  afterSubmit?: (params: Record<string, unknown>) => void;
  isShowAuthMigrateNotice?: boolean;
}

export interface PermissionModalRef {
  setFormValue: (key: string, value: unknown) => void;
  validateParams: () => void;
  getFormValues: () => Record<string, unknown>;
}

export const PermissionModal = forwardRef(function PermissionModal(
  {
    editInfo,
    isCreate,
    onRefresh,
    onCreateSuccess,
    onCancel,
    children,
    onPatPermissionChange,
    onCustomFormValueChange,
    validateCustomParams,
    getCustomParams,
    afterSubmit,
    isReady = true,
    isShowAuthMigrateNotice = false,
  }: PropsWithChildren<PermissionModalProps>,
  ref,
) {
  const formApi = useRef<FormApi<FormApiInfo>>();
  const {
    isFailToValid,
    ready,
    loading,
    onSubmit,
    onFormValueChange,
    patPermission,
    successData,
    updateSuccessData,
    validateParams,
  } = usePatForm({
    editInfo,
    isCreate,
    formApi,
    validateCustomParams,
    getCustomParams,
    afterSubmit,
    isShowAuthMigrateNotice,
  });
  const modalReady = isReady && ready;

  useEffect(() => {
    if (successData) {
      Toast.success({ content: I18n.t('Create_success'), showClose: false });
      onCreateSuccess(successData);
      onRefresh();
    }
  }, [successData]);

  useEffect(() => {
    if (updateSuccessData) {
      Toast.success({ content: I18n.t('Edit_success'), showClose: false });
      onRefresh();
    }
  }, [updateSuccessData]);

  useImperativeHandle(
    ref,
    () => ({
      setFormValue: (key: string, value: unknown) => {
        formApi.current?.setValue(key as keyof FormApiInfo, value);
      },
      getFormValues: () => formApi.current?.getValues(),
      validateParams,
    }),
    [validateParams],
  );

  useEffect(() => {
    onPatPermissionChange?.(patPermission);
  }, [patPermission]);

  return (
    <Modal
      title={isCreate ? I18n.t('add_new_pat_1') : I18n.t('edit_pat_1')}
      visible={true}
      width={480}
      centered
      maskClosable={false}
      onCancel={onCancel}
      onOk={onSubmit}
      okButtonProps={{
        disabled: isFailToValid || !modalReady,
        loading,
      }}
      cancelText={I18n.t('cancel')}
      okText={I18n.t('confirm')}
    >
      <Spin spinning={!modalReady}>
        <div className={styles['permission-form-content']}>
          <Form<FormApiInfo>
            showValidateIcon={false}
            getFormApi={api => (formApi.current = api)}
            onValueChange={(values, changedValue) => {
              if (onCustomFormValueChange) {
                onCustomFormValueChange(values, changedValue);
              } else {
                onFormValueChange(values, changedValue as FormApiInfo);
              }
            }}
          >
            <CommonFormParams
              isCreate={isCreate}
              patPermission={patPermission}
            />
            {children}
          </Form>
        </div>
      </Spin>
    </Modal>
  );
});
