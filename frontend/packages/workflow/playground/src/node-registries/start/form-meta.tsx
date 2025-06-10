/* eslint-disable @typescript-eslint/naming-convention */

import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { TriggerForm } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { TriggerService } from '@/services';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createOutputsValidator } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
export const START_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    // 必填
    outputs: createOutputsValidator({
      uniqueName: true,
    }),

    'trigger.dynamicInputs.*': ({ value, formValues, context, name }) => {
      console.log('gjy dynamicInputs', value, name);
      if (formValues?.trigger?.isOpen) {
        const triggerService =
          context.node.getService<TriggerService>(TriggerService);

        const { startNodeFormMeta } =
          triggerService.getTriggerDynamicFormMeta();
        const required = startNodeFormMeta.find(
          d => d.name === name?.replace('trigger.dynamicInputs.', ''),
        )?.required;

        if (required) {
          let isEmpty = false;
          // （特化）crontab 结构特殊
          if (name === 'trigger.dynamicInputs.crontab') {
            isEmpty = !value?.content?.content;
          } else {
            isEmpty = !value?.content;
          }
          return isEmpty
            ? I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空')
            : undefined;
        }
      }
      return undefined;
    },
    'trigger.parameters.*': ({ value, formValues, name }) => {
      if (formValues?.trigger?.isOpen) {
        const inUseKeys = formValues.outputs.map(d =>
          TriggerForm.getVariableName(d),
        );
        if (inUseKeys.includes(name.replace('trigger.parameters.', ''))) {
          return !value?.content
            ? I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空')
            : undefined;
        }
      }
      return undefined;
    },
  },

  // defaultValues: {
  //   [TriggerForm.TabName]: TriggerForm.Tab.Basic,
  // } as any,

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
