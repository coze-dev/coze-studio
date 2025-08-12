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
   * model configuration update
   *
   * It should be noted that when switching models, onModelChange will be triggered first, and the updated selectedModelId will be passed externally. After that, the new model's config will be calculated internally and onConfigChange will be triggered.
   *
   * The ideal data flow is when the switch model triggers onModelChange, and the new selectedModelId and currentConfig are passed externally. Or onModelChange throws a new modelId and config at the same time.
   * Although the current situation is a bit frustrating, due to historical design reasons, the cost of transforming it into the above method is slightly higher, and the status quo is maintained for the time being.
   */
  onConfigChange: (value: ModelInfo) => void;
  currentConfig: ModelInfo;
  /** Is the current agent single or mulit? */
  agentType: 'single' | 'multi';
  /** Clarify the diff type and pass it through to getSchema. In the case of model-diff, the number of rounds carrying the context is not displayed */
  diffType?: 'prompt-diff' | 'model-diff';
}

interface PopoverModelConfigViewProps {
  /**
   * You need to keep the form instance continuously in order to reuse the extremely complex "initialize detailed configuration when switching models" logic
   *
   * The ideal approach is to reset the config value when onModelChange occurs on the outer business side
   * But firstly, the logic is too complicated to extract the initialization method independently.
   * Second, useHandleModelForm is very expensive to use and is not suitable for being called on the outermost business side
   */
  visible: boolean;
  disabled?: boolean;
  selectedModel?: Model;
  onClose: () => void;
  modelConfigProps: ModelConfigProps;
}

/** Popover's model configuration state corresponds to the list state. Splitting purely to avoid components being too large */
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
  // eslint-disable-next-line @typescript-eslint/naming-convention -- FormProvider is not suitable for other formats
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
    // Execute a callback in a promise executor where an error causes a promise rejection asynchronously instead of a white screen
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
            // The value is migrated from src/components/model-form/index.tsx
            className="text-[#FF2710]"
          />
          <div className="font-semibold leading-[22px]">
            <span>{I18n.t('model_form_fail_text')}</span>
            <span
              // The value is migrated from src/components/model-form/index.tsx
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
