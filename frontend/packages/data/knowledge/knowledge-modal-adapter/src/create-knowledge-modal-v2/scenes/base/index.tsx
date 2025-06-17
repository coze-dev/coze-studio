import { useRef, useState } from 'react';

import { useDataModalWithCoze } from '@coze-data/utils';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { useDataNavigate } from '@coze-data/knowledge-stores';
import {
  CozeKnowledgeAddTypeContent,
  type CozeKnowledgeAddTypeContentFormData,
} from '@coze-data/knowledge-modal-base/create-knowledge-modal-v2';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { FormatType } from '@coze-arch/bot-api/memory';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Button, Form, LoadingButton } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface UseCreateKnowledgeModalParams {
  projectID?: string;
  onFinish?: (datasetId: string, type: UnitType, shouldUpload: boolean) => void;
  beforeCreate?: (shouldUpload: boolean) => void;
}
export const useCreateKnowledgeModalV2 = (
  params: UseCreateKnowledgeModalParams = {},
) => {
  const { onFinish, beforeCreate, projectID } = params;
  const formRef = useRef<Form<CozeKnowledgeAddTypeContentFormData>>(null);
  // 使用 useState 保证能重新渲染
  // TODO: hzf 重命名
  const [currentFormatType, setCurrentFormatType] = useState(FormatType.Text);
  const spaceId = useSpaceStore(store => store.getSpaceId());

  const resourceNavigate = useDataNavigate();

  // TODO: hzf 重命名
  const [unitType, setUnitType] = useState<UnitType>(UnitType.TEXT_DOC);

  const createDataset = async () => {
    await formRef.current?.formApi.validate();
    const { dataset_id: datasetId } = await KnowledgeApi.CreateDataset({
      project_id: projectID || undefined,
      name: formRef.current?.formApi.getValue('name'),
      format_type: currentFormatType,
      description: formRef.current?.formApi.getValue('description'),
      icon_uri: formRef.current?.formApi.getValue('icon_uri')?.[0].uid,
      space_id: spaceId || undefined,
    });
    return datasetId;
  };

  const { open, close, modal } = useDataModalWithCoze({
    title: (
      <div data-testid={KnowledgeE2e.CreateKnowledgeModalTitle}>
        {I18n.t('datasets_model_create_title')}
      </div>
    ),
    centered: true,
    className: styles['create-knowledge-modal'],
    onCancel: () => {
      close();
    },
    footer: (
      <div className="flex w-full justify-end">
        <Button
          color="primary"
          onClick={() => {
            close();
          }}
        >
          {I18n.t('cancel')}
        </Button>
        <LoadingButton
          color="primary"
          onClick={async () => {
            beforeCreate?.(false);
            const datasetId = await createDataset();
            if (onFinish) {
              onFinish(datasetId || '', unitType, false);
            } else {
              resourceNavigate.toResource?.('knowledge', datasetId);
            }
          }}
        >
          {I18n.t('kl_write_108')}
        </LoadingButton>
        <LoadingButton
          onClick={async () => {
            beforeCreate?.(true);
            const datasetId = await createDataset();
            if (onFinish) {
              onFinish(datasetId || '', unitType, true);
            } else {
              resourceNavigate.upload?.({ type: unitType });
            }
          }}
        >
          {I18n.t('kl_write_109')}
        </LoadingButton>
      </div>
    ),
  });

  return {
    modal: modal(
      <Form<CozeKnowledgeAddTypeContentFormData>
        ref={formRef}
        showValidateIcon={false}
        className={styles['create-form']}
      >
        <CozeKnowledgeAddTypeContent
          onImportKnowledgeTypeChange={setUnitType}
          onSelectFormatTypeChange={setCurrentFormatType}
        />
      </Form>,
    ),
    open: () => {
      setCurrentFormatType(FormatType.Text);
      open();
    },
    close,
  };
};
