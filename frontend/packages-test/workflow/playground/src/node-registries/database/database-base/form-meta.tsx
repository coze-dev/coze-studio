import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type WorkflowNodeRegistry,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { getOutputsDefaultValue } from '@/node-registries/database/common/utils';

import FormRender from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

export const DATABASE_NODE_FORM_META: WorkflowNodeRegistry['formMeta'] = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    'inputParameters.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputParameters') || []).map(item => item.name),
    }),
    'inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
    sql: ({ value }) =>
      !value ? I18n.t('workflow_detail_node_error_empty') : undefined,
    databaseInfoList: ({ value }) => {
      if (!value || value.length === 0) {
        return I18n.t('workflow_detail_node_error_empty');
      }
    },
  },

  // 默认值
  defaultValues: {
    inputParameters: [{ name: 'input' }],
    databaseInfoList: [],
    outputs: getOutputsDefaultValue(),
  },

  // 副作用
  effect: {
    outputs: provideNodeOutputVariablesEffect,
  },

  // 初始化数据转换
  formatOnInit: transformOnInit,

  // 提交数据转换
  formatOnSubmit: transformOnSubmit,
};
