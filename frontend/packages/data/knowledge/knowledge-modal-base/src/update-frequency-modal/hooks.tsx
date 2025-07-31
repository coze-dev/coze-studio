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

import { useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  getUpdateIntervalOptions,
  DocumentUpdateInterval,
  useDataModalWithCoze,
} from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type FormState } from '@coze-arch/bot-semi/Form';
import { CustomError } from '@coze-arch/bot-error';
import { DocumentUpdateType } from '@coze-arch/bot-api/memory';
import {
  type FormatType,
  type DocumentSource,
  UpdateType,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Form, FormSelect } from '@coze-arch/coze-design';

import { DATA_REFACTOR_CLASS_NAME } from '../constant';

export interface DataType {
  updateType?: number;
  updateInterval?: number;
}
export interface UseUpdateFrequencyModalProps {
  docId?: string;
  onFinish?: (formData: DataType) => void;
  type?: FormatType;
  documentSource?: DocumentSource;
}

export const useUpdateFrequencyModal = (
  props: UseUpdateFrequencyModalProps,
) => {
  const formRef = useRef<Form>(null);

  const { docId, documentSource } = props;
  const [content, setContent] = useState<DataType>({
    updateType: DocumentUpdateType.NoUpdate,
    updateInterval: DocumentUpdateInterval.EveryDay,
  });
  const [, setDisabled] = useState<boolean>(false);
  const { run, loading } = useRequest(
    async () => {
      if (!docId) {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeUpdateDocumentFrequency,
          `${REPORT_EVENTS.KnowledgeUpdateDocumentFrequency}: missing doc_id`,
        );
      }
      const formData = formRef.current?.formApi.getValues();
      await KnowledgeApi.UpdateDocument({
        document_id: docId,
        update_rule: {
          update_type: formData.updateInterval ? UpdateType.Cover : 0,
          update_interval: formData.updateInterval,
        },
      });
      return {
        updateType: formData.updateInterval ? UpdateType.Cover : 0,
        updateInterval: formData.updateInterval,
      };
    },
    {
      manual: true,
      onSuccess: () => {
        close();
        props?.onFinish?.(content);
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateDocumentFrequency,
          error,
        });
      },
    },
  );

  const { modal, open, close } = useDataModalWithCoze({
    title: I18n.t('datasets_segment_Update'),
    centered: true,
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('Confirm'),
    okButtonProps: {
      loading,
    },
    onOk: () => {
      run();
    },
    onCancel: () => close(),
  });
  const onChange = (object: FormState<DataType>) => {
    if (object.values) {
      setContent(object.values);
      setDisabled(object.values?.updateInterval === 0);
    }
  };
  return {
    node: modal(
      <Form<DataType>
        className={DATA_REFACTOR_CLASS_NAME}
        showValidateIcon={false}
        labelPosition="top"
        ref={formRef}
        initValues={content}
        onChange={onChange}
      >
        <FormSelect
          field="updateInterval"
          label={I18n.t('datasets_frequencyModal_frequency')}
          placeholder={I18n.t('datasets_frequencyModal_frequency')}
          style={{ width: '100%' }}
          optionList={getUpdateIntervalOptions({ documentSource })}
        ></FormSelect>
        {/* <FormSelect
          field="updateType"
          label={I18n.t('datasets_frequencyModal_whenUpdate')}
          placeholder={I18n.t('datasets_update_type')}
          style={{ width: '100%', marginBottom: 20 }}
          optionList={getUpdateTypeOptions(type)}
          disabled={disabled}
        ></FormSelect> */}
      </Form>,
    ),
    edit: (editContent: DataType) => {
      setContent(editContent);
      setDisabled(editContent.updateInterval === 0);
      open();
    },
    close,
  };
};
