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

import { type CSSProperties, Fragment } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Form, UIFormSelect, UIFormTextArea } from '@coze-arch/bot-semi';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import {
  type NodeFormSchema,
  type FormItemSchema,
  FormItemSchemaType,
} from '../../types';
import { useTestsetManageStore } from '../../hooks';
import {
  getCustomProps,
  getLabel,
  getPlaceholder,
  getSubFieldName,
  getTypeLabel,
  optionsForBoolSelect,
} from './utils';
import { FormLabel } from './form-label';

import s from './node-form-section.module.less';

interface NodeFormSectionProps {
  schema: NodeFormSchema;
  /** AI is being generated */
  autoGenerating?: boolean;
  className?: string;
  style?: CSSProperties;
}

const { Section, InputNumber } = Form;

/** integer type form precision */
const INTEGER_PRECISION = 0.1;

export function NodeFormSection({
  schema,
  autoGenerating,
  className,
  style,
}: NodeFormSectionProps) {
  const formRenders = useTestsetManageStore(store => store.formRenders);

  const renderSectionTitle = () => {
    let sectionName = schema.component_name;
    // Currently only two nodes are start and variable
    switch (schema.component_type) {
      case ComponentType.CozeStartNode:
        sectionName = I18n.t('workflow_testset_start_node');
        break;
      case ComponentType.CozeVariableBot:
        sectionName = I18n.t('workflow_testset_vardatabase_node');
        break;
      default:
        break;
    }

    return (
      <div className={s.title}>
        {schema.component_icon ? (
          <div className={s.icon}>
            <img src={schema.component_icon} />
          </div>
        ) : null}
        {sectionName}
      </div>
    );
  };

  const renderFormItem = (formItemSchema: FormItemSchema) => {
    const { type, name, required } = formItemSchema;
    const CustomFormItem = formRenders?.[type];
    const fieldName = getSubFieldName(schema, formItemSchema);
    const placeholder = getPlaceholder(formItemSchema);
    const requiredMsg = I18n.t('workflow_testset_required_tip', {
      param_name: formItemSchema.type === FormItemSchemaType.BOT ? '' : name,
    });

    if (typeof CustomFormItem !== 'undefined') {
      return (
        <CustomFormItem
          field={fieldName}
          disabled={autoGenerating}
          rules={[{ required, message: requiredMsg }]}
          noLabel={true}
          placeholder={placeholder}
          {...getCustomProps(formItemSchema)}
        />
      );
    }

    switch (type) {
      case FormItemSchemaType.BOOLEAN:
        return (
          <UIFormSelect
            className={s['select-container']}
            field={fieldName}
            disabled={autoGenerating}
            rules={[{ required, message: requiredMsg }]}
            optionList={optionsForBoolSelect}
            noLabel={true}
            placeholder={placeholder}
            showClear={!required}
          />
        );
      case FormItemSchemaType.INTEGER:
      case FormItemSchemaType.FLOAT:
      case FormItemSchemaType.NUMBER:
        return (
          <InputNumber
            field={fieldName}
            trigger={['change', 'blur']}
            precision={
              type === FormItemSchemaType.INTEGER
                ? INTEGER_PRECISION
                : undefined
            }
            rules={[{ required, message: requiredMsg }]}
            disabled={autoGenerating}
            noLabel={true}
            style={{ width: '100%' }}
            placeholder={placeholder}
          />
        );
      case FormItemSchemaType.OBJECT:
      case FormItemSchemaType.LIST:
        return (
          <UIFormTextArea
            field={fieldName}
            trigger={['change', 'blur']}
            rules={[{ required, message: requiredMsg }]}
            disabled={autoGenerating}
            noLabel={true}
            placeholder={placeholder}
          />
        );
      case FormItemSchemaType.STRING:
      default:
        return (
          <UIFormTextArea
            field={fieldName}
            autosize={{ minRows: 2, maxRows: 5 }}
            trigger={['change', 'blur']}
            rules={[{ required, message: requiredMsg }]}
            disabled={autoGenerating}
            noLabel={true}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <Section
      className={cls(s.section, className)}
      style={style}
      text={renderSectionTitle()}
    >
      {schema.inputs.map((formItemSchema, i) => (
        <Fragment key={i}>
          <FormLabel
            className={s.label}
            label={getLabel(formItemSchema)}
            typeLabel={getTypeLabel(formItemSchema)}
            required={formItemSchema.required}
          />
          {renderFormItem(formItemSchema)}
        </Fragment>
      ))}
    </Section>
  );
}
