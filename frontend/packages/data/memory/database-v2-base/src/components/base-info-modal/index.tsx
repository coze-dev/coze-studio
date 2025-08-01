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
import { useState, type FC, useRef, useEffect, useCallback } from 'react';

import { CozeFormTextArea, CozeInputWithCountField } from '@coze-data/utils';
import {
  PictureUpload,
  type RenderAutoGenerateParams,
} from '@coze-common/biz-components/picture-upload';
import { I18n } from '@coze-arch/i18n';
import { Form, type FormApi, Modal } from '@coze-arch/coze-design';
import { FormatType } from '@coze-arch/bot-api/memory';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { KnowledgeApi } from '@coze-arch/bot-api';

import styles from './index.module.less';

export enum ModalMode {
  CREATE = 'create',
  EDIT = 'edit',
}

export interface UseDatabaseBaseInfoModalProps {
  onSubmit: (formData: FormData) => void;
  onClose?: () => void;
  initValues: FormData | undefined;
  mode: ModalMode;
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
}

export interface DatabaseBaseInfoModalProps
  extends UseDatabaseBaseInfoModalProps {
  visible: boolean;
}

export const useDatabaseInfoModal = ({
  onSubmit,
  onClose,
  initValues,
  mode = ModalMode.CREATE,
  renderAutoGenerate,
}: UseDatabaseBaseInfoModalProps) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    onClose?.();
  };

  return {
    visible,
    open,
    close,
    modal: (
      <DatabaseBaseInfoModal
        visible={visible}
        onClose={close}
        onSubmit={onSubmit}
        initValues={initValues}
        mode={mode}
        renderAutoGenerate={renderAutoGenerate}
      />
    ),
  };
};

export interface FormData {
  name: string;
  description: string;
  icon_uri?: Array<{
    url: string;
    uri: string;
    uid?: string;
    isDefault?: boolean;
  }>;
}

export const DatabaseBaseInfoModal: FC<DatabaseBaseInfoModalProps> = ({
  visible,
  initValues,
  onClose,
  onSubmit,
  mode,
  renderAutoGenerate,
}) => {
  const formRef = useRef<FormApi<FormData> | null>(null);

  const handleSubmit = async () => {
    if (!formRef.current) {
      return;
    }
    const formData = await formRef.current.validate();

    onSubmit({
      ...formData,
      icon_uri: [
        {
          url: formData?.icon_uri?.[0]?.url ?? '',
          uri: formData?.icon_uri?.[0]?.uid ?? '',
        },
      ],
    });
  };

  const [coverIcon, setCoverIcon] = useState<{
    uri: string;
    url: string;
  }>({
    uri: initValues?.icon_uri?.[0]?.uri ?? '',
    url: initValues?.icon_uri?.[0]?.url ?? '',
  });

  const [iconInfoGenerate, setIconInfoGenerate] = useState<{
    name: string;
    desc: string;
  }>({
    name: initValues?.name ?? '',
    desc: initValues?.description ?? '',
  });

  const setDefaultIcon = async () => {
    const { icon } = await KnowledgeApi.GetIcon({
      format_type: FormatType.Database,
    });
    setCoverIcon({
      uri: icon?.uri ?? '',
      url: icon?.url ?? '',
    });
    formRef.current?.setValue('icon_uri', [
      {
        url: icon?.url ?? '',
        uri: icon?.uri ?? '',
        uid: icon?.uri ?? '',
        isDefault: true,
      },
    ]);
  };
  const initForm = useCallback(
    ({ name, description, icon_uri }: FormData) => {
      if (!formRef.current) {
        return;
      }
      formRef.current.setValue('name', name);
      formRef.current.setValue('description', description);
      setIconInfoGenerate({
        name: name ?? '',
        desc: description ?? '',
      });
      if (!icon_uri || !icon_uri[0].url) {
        setDefaultIcon();
        return;
      }
      formRef.current.setValue('icon_uri', [
        {
          url: icon_uri[0].url,
          uri: icon_uri[0].uri,
          uid: icon_uri[0].uri,
          isDefault: true,
        },
      ]);
    },
    [formRef],
  );
  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!initValues) {
      return;
    }
    initForm(initValues);
  }, [visible, initValues, initForm]);

  const handleClose = () => {
    if (formRef.current) {
      formRef.current?.reset(['name', 'description', 'icon_uri']);
    }
    onClose?.();
  };

  return (
    <Modal
      title={
        mode === ModalMode.CREATE
          ? I18n.t('db_add_table_title')
          : I18n.t('db_edit_title')
      }
      closable
      visible={visible}
      onCancel={handleClose}
      className="w-[480px]"
      okText={I18n.t('db2_004')}
      okButtonProps={{
        // @ts-expect-error -- for e2e
        'data-testid': 'database.info_modal.button.confirm',
      }}
      cancelText={I18n.t('db_del_field_confirm_no')}
      onOk={handleSubmit}
      maskClosable={false}
    >
      <Form<FormData>
        className={styles['database-model-content']}
        getFormApi={formApi => {
          formRef.current = formApi;
        }}
        initValues={initValues}
      >
        {({ formState }) => (
          <>
            <CozeInputWithCountField
              data-testid="database.info_modal.input.name"
              field="name"
              label={I18n.t('db_add_table_name')}
              placeholder={I18n.t('db_add_table_name_tips')}
              required
              maxLength={50}
              disabled={mode === ModalMode.EDIT}
              onChange={(value: string) => {
                setIconInfoGenerate(prev => ({
                  ...prev,
                  name: value?.trim() || '',
                }));
              }}
              rules={[
                {
                  required: true,
                  message: I18n.t('db2_005'),
                },
                {
                  pattern: /^[a-z][a-z0-9_]{0,63}$/,
                  message: I18n.t('db_new_0004'),
                },
              ]}
            />
            <CozeFormTextArea
              data-testid="database.info_modal.input.description"
              field="description"
              label={I18n.t('db_add_table_desc')}
              placeholder={I18n.t('db_add_table_desc_tips')}
              maxCount={100}
              maxlength={100}
              onChange={(value: string) => {
                setIconInfoGenerate(prev => ({
                  ...prev,
                  desc: value?.trim() || '',
                }));
              }}
            />
            <PictureUpload
              label={I18n.t('datasets_model_create_avatar')}
              field="icon_uri"
              fileBizType={FileBizType.BIZ_DATASET_ICON}
              iconType={IconType.Dataset}
              uploadClassName="w-auto"
              generateInfo={iconInfoGenerate}
              withAutoGenerate={!!renderAutoGenerate}
              renderAutoGenerate={renderAutoGenerate}
              initValue={[
                {
                  url: coverIcon?.url,
                  uid: coverIcon?.uri,
                  isDefault: true,
                },
              ]}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};
