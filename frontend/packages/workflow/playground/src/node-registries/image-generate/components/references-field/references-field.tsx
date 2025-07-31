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

import { useMemo } from 'react';

import { ViewVariableType } from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { ImageModelSelectField } from '@/node-registries/common/components';
import {
  withFieldArray,
  Section,
  FieldArrayList,
  FieldArrayItem,
  ColumnTitles,
  useFieldArray,
  InputNumberField,
  AddButton,
} from '@/form';

import { type Reference } from '../../types';
import { DEFAULT_REFERENCE } from '../../constants';
import { createPreprocessorOptions } from './create-preprocessor-options';

export const ReferencesField = withFieldArray(() => {
  const { name, value, append, remove } = useFieldArray<Reference>();

  const preprocessors = useMemo(
    () =>
      value
        ?.map(item => item.preprocessor)
        .filter(item => item !== undefined) || [],
    [value],
  );

  return (
    <Section
      title={I18n.t('Imageflow_reference_image')}
      actions={[
        <AddButton
          key="add"
          onClick={() => append(DEFAULT_REFERENCE)}
          disabled={value && value?.length >= 5}
        />,
      ]}
    >
      <ColumnTitles
        columns={[
          {
            label: I18n.t('Imageflow_reference_info1'),
            style: {
              width: 120,
            },
          },
          {
            label: I18n.t('Imageflow_reference_info2'),
            style: {
              width: 150,
            },
          },
          {
            label: I18n.t('Imageflow_reference_info3'),
          },
        ]}
      />
      <FieldArrayList>
        {value?.map((item, index) => {
          const preprocessorName = `${name}.${index}.preprocessor`;
          const urlName = `${name}.${index}.url`;
          const weightName = `${name}.${index}.weight`;

          const options = createPreprocessorOptions({
            currentPreprocessor: item.preprocessor,
            allSelectedPreprocessor: preprocessors,
          });

          return (
            <FieldArrayItem onRemove={() => remove(index)}>
              <div className="flex-[2_1_0%] min-w-[0px] max-w-[120px]">
                <ImageModelSelectField
                  name={preprocessorName}
                  options={options}
                  showClear={true}
                  placeholder={I18n.t('Imageflow_mode_choose')}
                />
              </div>

              <div className="w-[150px]">
                <ValueExpressionInputField
                  name={urlName}
                  inputType={ViewVariableType.Image}
                  selectStyle={{
                    width: 80,
                  }}
                />
              </div>

              <div className="w-full">
                <InputNumberField
                  name={weightName}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </FieldArrayItem>
          );
        })}
      </FieldArrayList>
    </Section>
  );
});
