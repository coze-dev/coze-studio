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
 
import { type ReactNode, useEffect, useMemo } from 'react';

import { omit } from 'lodash-es';
import cls from 'classnames';
import { useCreation } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowLeft,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { IconButton, Loading } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import { type Model, type ModelInfo } from '@coze-arch/bot-api/developer_api';

import { modelFormComponentMap } from '../../model-form/type';
import { primitiveExhaustiveCheck } from '../../../utils/exhaustive-check';
import {
  useHandleModelForm,
  type UseHandleModelFormProps,
} from '../../../hooks/model-form/use-handle-model-form';
import { type ModelFormContextProps } from '../../../context/model-form-context/type';
import { ModelFormProvider } from '../../../context/model-form-context/context';
import {
  type FormilyCoreType,
  type FormilyReactType,
} from '../../../context/formily-context/type';
import { useFormily } from '../../../context/formily-context';

export interface ModelConfigProps
  extends Pick<ModelFormContextProps, 'hideDiversityCollapseButton'> {
  modelStore: UseHandleModelFormProps['modelStore'];
  /**
   * 模型配置更新
   *
   * 需要注意切换模型时，会先触发 onModelChange，由外部传入更新后的 selectedModelId，此后内部会计算新模型的 config 并触发 onConfigChange
   *
   * 理想数据流是切换模型触发 onModelChange 后，外部一并传入新的 selectedModelId 和 currentConfig。或者由 onModelChange 同时抛出新的 modelId 和 config。
   * 目前这样虽然有点挫，但由于历史设计原因，改造成上述方式成本略高，暂保持现状。
   */
  onConfigChange: (value: ModelInfo) => void;
  currentConfig: ModelInfo;
  /** 当前 agent 是 single 还是 mulit */
  agentType: 'single' | 'multi';
  /** 明确diff类型, 透传给getSchema。model-diff情况下不展示携带上下文轮数影响 */
  diffType?: 'prompt-diff' | 'model-diff';
}

interface PopoverModelConfigViewProps {
  /**
   * 需要持续保留表单实例，以便复用无比复杂的「切换模型时初始化详细配置」的逻辑
   *
   * 理想做法是在外层业务侧 onModelChange 时重置 config 值
   * 但一是该逻辑过于复杂，难以独立抽出初始化方法；
   * 二是 useHandleModelForm 使用成本又极高，不适合放到最外层业务侧去调用
   */
  visible: boolean;
  disabled?: boolean;
  selectedModel?: Model;
  onClose: () => void;
  modelConfigProps: ModelConfigProps;
}

/** Popover 的 模型配置状态，对应列表状态。单纯为了避免组件过大而做的拆分 */
export function PopoverModelConfigView({
  visible,
  disabled,
  selectedModel,
  onClose,
  modelConfigProps,
}: PopoverModelConfigViewProps) {
  const formilyInitState = useInitFormily();
  return (
    <div
      className={cls('h-full p-[16px] flex flex-col gap-[12px] overflow-auto', {
        hidden: !visible,
      })}
    >
      <div className="flex items-center gap-[6px]">
        <IconButton
          icon={<IconCozArrowLeft />}
          color="secondary"
          //   size="small"
          onClick={e => {
            onClose();
          }}
        />
        <span className="text-[16px] leading-[22px] font-medium coz-fg-plus">
          {I18n.t('model_list_model_setting', { model: selectedModel?.name })}
        </span>
      </div>
      {formilyInitState.success ? (
        <ModelForm
          disabled={disabled}
          currentModelId={
            selectedModel?.model_type ? String(selectedModel?.model_type) : ''
          }
          modelConfigProps={modelConfigProps}
          {...formilyInitState.formilyPkg}
        />
      ) : (
        formilyInitState.node
      )}
    </div>
  );
}

interface ModelFormProps {
  disabled?: boolean;
  currentModelId: string;
  formilyCore: FormilyCoreType;
  formilyReact: FormilyReactType;
  modelConfigProps: ModelConfigProps;
}
function ModelForm({
  disabled,
  currentModelId,
  formilyCore,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- FormProvider 不适合用别的格式
  formilyReact: { createSchemaField, FormProvider },
  modelConfigProps: {
    currentConfig,
    onConfigChange,
    modelStore,
    agentType,
    hideDiversityCollapseButton,
    diffType,
  },
}: ModelFormProps) {
  const { createForm } = formilyCore;
  const form = useCreation(() => createForm(), [currentModelId]);
  const SchemaField = useCreation(
    () => createSchemaField({ components: modelFormComponentMap }),
    [],
  );

  const { getSchema, handleFormInit, handleFormUnmount } = useHandleModelForm({
    currentModelId,
    editable: !disabled,
    getModelRecord: () => currentConfig,
    onValuesChange: ({ values }) => {
      onConfigChange(values);
    },
    modelStore,
  });

  const schema = useMemo(
    () =>
      getSchema({
        currentModelId,
        isSingleAgent: agentType === 'single',
        diffType,
      }),
    [currentModelId, agentType, diffType],
  );

  useEffect(() => {
    // 在 promise executor 中执行回调，其中的错误会异步产生 promise rejection ，而不是导致页面白屏
    new Promise(() => handleFormInit(form, formilyCore));

    return handleFormUnmount;
  }, [form]);

  return (
    <ModelFormProvider
      hideDiversityCollapseButton={hideDiversityCollapseButton}
    >
      <FormProvider form={form}>
        <SchemaField schema={schema} />
      </FormProvider>
    </ModelFormProvider>
  );
}

function useInitFormily():
  | {
      success: true;
      formilyPkg: {
        formilyCore: FormilyCoreType;
        formilyReact: FormilyReactType;
      };
    }
  | {
      success: false;
      node: ReactNode;
    } {
  const { formilyModule, retryImportFormily } = useFormily();

  if (formilyModule.status === 'loading' || formilyModule.status === 'unInit') {
    return { success: false, node: <Loading loading /> };
  }

  if (formilyModule.status === 'error') {
    return {
      success: false,
      node: (
        <div className="h-full flex items-center gap-y-[8px] text-[14px]">
          <IconCozWarningCircleFill
            // 该值迁移自 src/components/model-form/index.tsx
            className="text-[#FF2710]"
          />
          <div className="font-semibold leading-[22px]">
            <span>{I18n.t('model_form_fail_text')}</span>
            <span
              // 该值迁移自 src/components/model-form/index.tsx
              className="cursor-pointer text-[#4D53E8]"
              onClick={retryImportFormily}
            >
              {I18n.t('model_form_fail_retry')}
            </span>
          </div>
        </div>
      ),
    };
  }

  if (formilyModule.status === 'ready') {
    return {
      success: true,
      formilyPkg: omit(formilyModule, ['status']),
    };
  }

  primitiveExhaustiveCheck(formilyModule.status);
  throw new CustomError('normal_error', 'unrecognized formilyModule.status');
}
