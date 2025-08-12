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

import { useCallback, useMemo, type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useEntityFromContext } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { JsonViewer } from '@coze-common/json-viewer';
import {
  GenerationDiversity,
  type ResponseFormat,
  useNodeTestId,
} from '@coze-workflow/base';
import { type OptionItem } from '@coze-arch/bot-semi/Radio';
import { type Model } from '@coze-arch/bot-api/developer_api';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { IconButton, Popover } from '@coze-arch/coze-design';

import { useWorkflowModels } from '@/hooks';
import PopupContainer from '@/components/popup-container';

import { cacheData, generateDefaultValueByMeta } from './utils';
import { ModelSelector } from './components/selector';
import { ModelSetting } from './components/model-setting';

const defaultGenerationDiversity = GenerationDiversity.Balance;

interface IValue {
  modelName?: string;
  modelType?: number;
  generationDiversity?: GenerationDiversity;
  responseFormat?: ResponseFormat;
  [k: string]: unknown;
}

type ModelSelectProps = SetterComponentProps<
  IValue | undefined,
  {
    models: Model[];
  }
>;

export const ModelSelect: FC<ModelSelectProps> = ({
  value: _value,
  onChange,
  readonly,
}) => {
  const { models } = useWorkflowModels();
  const model = useMemo(
    () => models.find(m => (m.model_type as number) === _value?.modelType),
    [models, _value?.modelType],
  );

  /**
   * Generate default values from modelMeta
   */
  const getDefaultValue = useCallback(
    ({ modelType, value }: { modelType?: number; value?: object }) => {
      const _model = models.find(m => m.model_type === modelType);
      return generateDefaultValueByMeta({
        modelParams: _model?.model_params,
        value,
      });
    },
    [models],
  );

  const defaultValue = useMemo(
    () =>
      getDefaultValue({ modelType: model?.model_type as number | undefined }),
    [model],
  );

  const value = useMemo(
    () => ({
      generationDiversity: GenerationDiversity.Customize,
      ...defaultValue[value?.generationDiversity || defaultGenerationDiversity],
      ..._value,
    }),
    [_value, defaultValue],
  );

  const modelOptions = useMemo(() => {
    const _options = models.map<OptionItem>(i => {
      const item = {
        label: i.name,
        value: i.model_type,
      };
      return item;
    });
    return _options;
  }, [models]);

  const node = useEntityFromContext<WorkflowNodeEntity>();
  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const setterTestId = getNodeSetterId('llm-select');

  // [Operation and maintenance platform] Since the model list cannot be pulled, the drop-down box will not be rendered, so the existing model values will be directly displayed here.
  if (IS_BOT_OP && value) {
    return <JsonViewer data={value} />;
  }

  return (
    <PopupContainer>
      <div className="flex gap-1 items-center">
        <ModelSelector
          data-testid={setterTestId}
          readonly={readonly}
          value={value?.modelType}
          onChange={_v => {
            const record = modelOptions.find(j => j.value === _v);
            if (record) {
              const generationDiversity =
                value.generationDiversity ?? defaultGenerationDiversity;
              let _defaultValue;

              // If custom, priority: cached user value > default
              if (generationDiversity === GenerationDiversity.Customize) {
                _defaultValue =
                  getDefaultValue({
                    modelType: record.value as number,
                    value: cacheData[node.id] as object,
                  })?.[generationDiversity] ?? {};
              } else {
                _defaultValue =
                  getDefaultValue({
                    modelType: record.value as number,
                  })?.[generationDiversity] ?? {};
              }

              onChange?.({
                ..._defaultValue,
                modelName: record.label as string,
                modelType: record.value as number,
                generationDiversity,
                // Do not reset the output format when switching models
                responseFormat:
                  value?.responseFormat ?? _defaultValue?.responseFormat,
              });
            }
          }}
          models={models}
        />
        <Popover
          autoAdjustOverflow={false}
          className="rounded-md w-[660px]"
          trigger="click"
          content={
            <ModelSetting
              id={node.id}
              defaultValue={defaultValue}
              value={value}
              onChange={_v => {
                onChange?.({
                  ..._v,
                  modelName: value.modelName,
                  modelType: value.modelType,
                });
              }}
              model={model}
              readonly={readonly}
            />
          }
          spacing={30}
        >
          <IconButton
            data-testid={`e2e-ui-button-action-${concatTestId(
              setterTestId,
              'model-setting-btn',
            )}`}
            wrapperClass="leading-none"
            color="secondary"
            size="small"
            icon={<IconCozSetting />}
          />
        </Popover>
      </div>
    </PopupContainer>
  );
};

export const modelSelect = {
  key: 'ModelSelect',
  component: ModelSelect,
};
