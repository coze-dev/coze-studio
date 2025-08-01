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

import { useCallback, useRef, useState } from 'react';

import {
  CozeFormTextArea,
  CozeInputWithCountField,
  useDataModalWithCoze,
} from '@coze-data/utils';
import { KnowledgeE2e } from '@coze-data/e2e';
import {
  PictureUpload,
  type RenderAutoGenerateParams,
} from '@coze-common/biz-components/picture-upload';
import { I18n } from '@coze-arch/i18n';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { Form } from '@coze-arch/coze-design';

import { DATA_REFACTOR_CLASS_NAME } from '../constant';

import styles from './index.module.less';

export interface EditModalData {
  id?: string;
  icon_uri?: { uid?: string; url?: string }[];
  name?: string;
  description?: string;
}

export interface UseEditKnowledgeModalProps {
  onOk: (formValue: EditModalData) => void;
  renderAutoGenerateKnowledgeIcon?: (
    props: RenderAutoGenerateParams,
  ) => React.ReactNode;
}

export function useEditKnowledgeModal(props: UseEditKnowledgeModalProps) {
  const formRef = useRef<Form<EditModalData>>(null);
  const initVal = useRef<EditModalData>({});
  const id = useRef<string | undefined>('');
  const [contentCheckErrorMsg, setContentCheckErrorMsg] = useState('');
  const [iconInfoGenerate, setIconInfoGenerate] = useState<{
    name: string;
    desc: string;
  }>({
    name: '',
    desc: '',
  });
  const getFormValues = () => {
    const values = formRef.current?.formApi.getValues();
    if (values) {
      return { ...values, icon_uri: values.icon_uri };
    }
  };

  const { open, close, modal, disableOk, enableOk, canOk } =
    useDataModalWithCoze({
      title: I18n.t('datasets_editProfile_title'),
      cancelText: I18n.t('Cancel'),
      centered: true,
      okText: I18n.t('Confirm'),
      onOk: () => {
        props.onOk({
          ...getFormValues(),
          id: id.current,
        });
        close();
      },
      onCancel: () => {
        close();
      },
    });

  const validateNL2SqlName = useCallback(() => {
    const currentUnitName = formRef.current?.formApi.getValue('name');
    const notationReg = /["'`\\]+/g;

    if (!currentUnitName) {
      return I18n.t('dataset-name-empty-tooltip');
    }
    if (notationReg.test(currentUnitName)) {
      return I18n.t('dataset-name-has-wrong-word-tooltip');
    }
    return '';
  }, []);

  return {
    node: modal(
      <div
        className={`${DATA_REFACTOR_CLASS_NAME} ${styles['create-dataset-modal']}`}
      >
        <Form<EditModalData>
          ref={formRef}
          showValidateIcon={false}
          initValues={initVal.current}
          onValueChange={({ name, description }) => {
            setIconInfoGenerate({
              name: name?.trim() || '',
              desc: description?.trim() || '',
            });
            setContentCheckErrorMsg('');

            if (!name || validateNL2SqlName()) {
              disableOk();
            } else if (!canOk) {
              enableOk();
            }
          }}
        >
          <CozeInputWithCountField
            data-testid={KnowledgeE2e.KnowledgeEditModalNameInput}
            field="name"
            label={I18n.t('datasets_model_create_name')}
            maxLength={100}
            rules={[
              {
                required: true,
                message: I18n.t('datasets_model_create_name_placeholder'),
              },
            ]}
            placeholder={I18n.t('datasets_model_create_name_placeholder')}
            validate={validateNL2SqlName}
          />
          <CozeFormTextArea
            data-testid={KnowledgeE2e.KnowledgeEditModalDescInput}
            field="description"
            label={I18n.t('datasets_model_create_description')}
            rows={2}
            maxCount={2000}
            maxLength={2000}
            placeholder={I18n.t(
              'datasets_model_create_description_placeholder',
            )}
          />
          {contentCheckErrorMsg ? (
            <Form.ErrorMessage error={contentCheckErrorMsg} />
          ) : null}

          <PictureUpload
            label={I18n.t('datasets_model_create_avatar')}
            withAutoGenerate
            renderAutoGenerate={props.renderAutoGenerateKnowledgeIcon}
            field="icon_uri"
            generateInfo={iconInfoGenerate}
            generateTooltip={{
              generateBtnText: I18n.t(
                'dataset_create_knowledge_generate_avatar_tips',
              ),
              contentNotLegalText: I18n.t(
                'dataset_create_knowledge_generate_content_tips',
              ),
            }}
            initValue={initVal.current.icon_uri}
            iconType={IconType.Dataset}
            fileBizType={FileBizType.BIZ_DATASET_ICON}
          />
        </Form>
      </div>,
    ),
    open,
    edit: (info: EditModalData) => {
      initVal.current = info;
      id.current = info.id;
      setIconInfoGenerate({
        name: info.name || '',
        desc: info.description || '',
      });
      open();
    },
    close: () => {
      close();
    },
  };
}
