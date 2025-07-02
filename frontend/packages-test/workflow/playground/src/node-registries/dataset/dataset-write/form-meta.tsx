import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import { fireNodeTitleChange } from '@/node-registries/common/effects';

import FormRender from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

const datasetParamFieldName = 'inputs.datasetParameters.datasetParam';
const separatorFieldName =
  'inputs.datasetWriteParameters.chunkStrategy.separator';

export const DATASET_WRITE_FORM_META: FormMetaV2<FormData> = {
  render: () => <FormRender />,

  validateTrigger: ValidateTrigger.onBlur,

  validate: {
    nodeMeta: nodeMetaValidate,
    'inputs.inputParameters.knowledge': createValueExpressionInputValidate({
      required: true,
    }),
    [datasetParamFieldName]: ({ value }) => {
      if (!value || value.length === 0) {
        return I18n.t('workflow_detail_knowledge_error_empty');
      }
      return undefined;
    },
    [separatorFieldName]: ({ value, formValues }) => {
      const separatorType = get(
        formValues,
        'inputs.datasetWriteParameters.chunkStrategy.separatorType',
      );

      if (separatorType === 'custom' && !value) {
        return I18n.t('datasets_custom_segmentID_error');
      }

      return undefined;
    },
  },

  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
