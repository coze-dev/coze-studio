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

import React, { useMemo } from 'react';

import {
  useNodeTestId,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { Section, FieldArray, Field, AddButton, useWatch } from '@/form';
import { CopyButton } from '@/components/copy-button';

import { BodyType, bodyTypeToField, bodyTypeToLabel } from '../constants';
import { RawTextEditorField } from '../../fields/raw-text-editor';
import {
  JsonExtensionEditorField,
  JsonImportField,
} from '../../fields/json-import-editor';
import { BodyTypeSelectField } from '../../fields/body-type-select';
import { INPUT_VALUE_COLUMNS } from '../../constants';
import { ParametersInputGroupField } from '../../../common/fields';

export const BodySetter = ({ setterName }) => {
  const readonly = useReadonly();

  const { getNodeSetterId } = useNodeTestId();

  const optionList = useMemo(
    () =>
      Object.keys(BodyType).map(item => ({
        label: I18n.t(bodyTypeToLabel[BodyType[item]]),
        value: BodyType[item],
      })),
    [],
  );

  const bodyType: BodyType = useWatch(`${setterName}.bodyType`);

  const bodyFormName = useMemo(
    () => `${setterName}.bodyData.${bodyTypeToField[bodyType]}`,
    [setterName, bodyType],
  );

  const bodyActions = useMemo(() => {
    if (
      bodyType === BodyType.FormData ||
      bodyType === BodyType.FormUrlEncoded
    ) {
      return !readonly
        ? [
            <FieldArray key={bodyFormName} name={bodyFormName}>
              {({ append }) => (
                <AddButton
                  onClick={() =>
                    append({
                      name: '',
                      type: ViewVariableType.String,
                      input: {
                        type: ValueExpressionType.LITERAL,
                        content: '',
                      },
                    })
                  }
                />
              )}
            </FieldArray>,
          ]
        : [];
    } else if (bodyType === BodyType.Json) {
      return !readonly
        ? [<JsonImportField name={bodyFormName} hasFeedback={false} />]
        : [
            <Field<string> name={bodyFormName}>
              {({ value }) => <CopyButton value={value as string} />}
            </Field>,
          ];
    } else if (bodyType === BodyType.RawText) {
      return readonly
        ? [
            <Field<string> name={bodyFormName}>
              {({ value }) => <CopyButton value={value as string} />}
            </Field>,
          ]
        : [];
    }
    return [];
  }, [bodyFormName, bodyType]);

  return (
    <Section
      title={I18n.t('node_http_body')}
      tooltip={I18n.t('node_http_body_desc')}
      actions={bodyActions}
    >
      <div className="flex flex-col">
        <BodyTypeSelectField
          defaultValue={BodyType.Empty}
          name={`${setterName}.bodyType`}
          size="small"
          data-testid={getNodeSetterId('body-type-select')}
          optionList={optionList}
          disabled={readonly}
          style={{
            width: '100%',
            borderColor:
              'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
            marginBottom: '8px',
          }}
        />
        {bodyType === BodyType.Json && (
          <JsonExtensionEditorField name={bodyFormName} />
        )}
        {bodyType === BodyType.FormData && (
          <ParametersInputGroupField
            fieldEditable={!readonly}
            columns={INPUT_VALUE_COLUMNS}
            name={bodyFormName}
            disabledTypes={ViewVariableType.getComplement([
              ViewVariableType.String,
              ViewVariableType.File,
              ViewVariableType.Image,
              ViewVariableType.Video,
              ViewVariableType.Svg,
              ViewVariableType.Txt,
              ViewVariableType.Doc,
              ViewVariableType.Excel,
              ViewVariableType.Ppt,
              ViewVariableType.Zip,
              ViewVariableType.Code,
            ])}
          />
        )}
        {bodyType === BodyType.FormUrlEncoded && (
          <ParametersInputGroupField
            fieldEditable={!readonly}
            hiddenTypes
            columns={INPUT_VALUE_COLUMNS}
            name={bodyFormName}
            inputType={ViewVariableType.String}
          />
        )}
        {bodyType === BodyType.RawText && (
          <RawTextEditorField
            name={bodyFormName}
            minHeight={78}
            placeholder={I18n.t('node_http_raw_text_input')}
          />
        )}
        {bodyType === BodyType.Binary && (
          <ValueExpressionInputField
            inputType={ViewVariableType.File}
            availableFileTypes={[
              ViewVariableType.File,
              ViewVariableType.Image,
              ViewVariableType.Video,
              ViewVariableType.Svg,
              ViewVariableType.Txt,
              ViewVariableType.Doc,
              ViewVariableType.Excel,
              ViewVariableType.Ppt,
              ViewVariableType.Zip,
              ViewVariableType.Code,
            ]}
            disabledTypes={ViewVariableType.getComplement([
              ViewVariableType.File,
              ViewVariableType.Image,
              ViewVariableType.Video,
              ViewVariableType.Svg,
              ViewVariableType.Txt,
              ViewVariableType.Doc,
              ViewVariableType.Excel,
              ViewVariableType.Ppt,
              ViewVariableType.Zip,
              ViewVariableType.Code,
              ViewVariableType.ArrayFile,
            ])}
            name={`${bodyFormName}.fileURL`}
          />
        )}
      </div>
    </Section>
  );
};
