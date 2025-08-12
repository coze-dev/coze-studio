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

import { type FC, useCallback, useMemo } from 'react';

import classNames from 'classnames';
import {
  useService,
  useEntityFromContext,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { GenerationDiversity, useNodeTestId } from '@coze-workflow/base';
import { JsonViewer } from '@coze-common/json-viewer';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { IconButton, type PopoverProps } from '@coze-arch/coze-design';
import { type OptionItem } from '@coze-arch/bot-semi/Radio';
import { Popover } from '@coze-arch/bot-semi';

import type { IModelValue, ComponentProps } from '@/typing';
import { WorkflowModelsService } from '@/services';
import { type ModelSelectV2Props } from '@/form-extensions/setters/model-select/components/selector/model-select-v2';

import PopupContainer from '../popup-container';
import { cacheData, generateDefaultValueByMeta } from './utils';
import { ModelSelector } from './components/selector';
import { ModelSetting } from './components/model-setting';

const defaultGenerationDiversity = GenerationDiversity.Balance;

interface ModelSelectProps extends ComponentProps<IModelValue | undefined> {
  readonly?: boolean;
  popoverPosition?: PopoverProps['position'];
  popoverAutoAdjustOverflow?: boolean;
  testName?: string;
  triggerRender?: ModelSelectV2Props['triggerRender'];
  className?: string;
}

export const ModelSelect: FC<ModelSelectProps> = ({
  value: _value,
  onChange,
  readonly,
  popoverPosition,
  popoverAutoAdjustOverflow,
  testName,
  triggerRender,
  className,
}) => {
  const models =
    useService<WorkflowModelsService>(WorkflowModelsService)?.getModels() ?? [];

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
    [getDefaultValue, model?.model_type],
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
  const setterTestId = getNodeSetterId(testName || 'llm-select');

  // [Operation and maintenance platform] Since the model list cannot be pulled, the drop-down box will not be rendered, so the existing model values will be directly displayed here.
  if (IS_BOT_OP && value) {
    return <JsonViewer data={value} />;
  }

  return (
    <PopupContainer>
      <div
        className={classNames(
          'flex gap-[4px] items-center relative',
          className,
        )}
        data-testid={setterTestId}
      >
        <ModelSelector
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
          popoverPosition={popoverPosition}
          triggerRender={triggerRender}
        />
        <Popover
          autoAdjustOverflow={popoverAutoAdjustOverflow || false}
          className="rounded-md w-[660px]"
          trigger="click"
          position={popoverPosition || 'bottomRight'}
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
              readonly={!!readonly}
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
