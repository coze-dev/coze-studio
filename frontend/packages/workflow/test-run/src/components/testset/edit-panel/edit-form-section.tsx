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
 
import { Fragment, useMemo } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  Form,
  FormSelect,
  FormTextArea,
  Avatar,
  useFieldState,
} from '@coze-arch/coze-design';
import { IntelligenceType } from '@coze-arch/bot-api/intelligence_api';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import {
  getTestsetFormSubFieldType,
  getTestsetFormSubFieldName,
  getTestsetFormItemPlaceholder,
  getTestsetFormItemCustomProps,
} from '../../../utils';
import {
  type NodeFormSchema,
  type FormItemSchema,
  type ArrayFieldSchema,
} from '../../../types';
import {
  FormItemSchemaType,
  TESTSET_FORM_BOOLEAN_SELECT_OPTIONS,
  TESTSET_BOT_NAME,
} from '../../../constants';

import styles from './edit-form-section.module.less';

/** 整数类型表单精度 */
const INTEGER_PRECISION = 0.1;

/** bot field name 固定值 */
const BOT_FIELD_NAME = `${TESTSET_BOT_NAME}_${ComponentType.CozeVariableBot}`;

interface EditFormSectionTitleProps {
  schema: NodeFormSchema;
}

const EditFormSectionTitle: React.FC<EditFormSectionTitleProps> = ({
  schema,
}) => {
  const title = useMemo(() => {
    // 目前只有start和variable两种节点
    switch (schema.component_type) {
      case ComponentType.CozeStartNode:
        return I18n.t('workflow_testset_start_node');
      case ComponentType.CozeVariableBot:
        return I18n.t('workflow_testset_vardatabase_node');
      case ComponentType.CozeVariableChat:
        return I18n.t('wf_chatflow_72');
      default:
        return schema.component_name;
    }
  }, [schema]);

  return (
    <div className={styles['form-section-title']}>
      {schema.component_icon ? (
        <Avatar src={schema.component_icon} shape="square" size="extra-small" />
      ) : null}
      {title}
    </div>
  );
};

interface FormLabelProps {
  schema: FormItemSchema;
}

const FormLabel: React.FC<FormLabelProps> = ({ schema }) => {
  const label = useMemo(() => {
    if (schema.type === FormItemSchemaType.BOT) {
      return I18n.t('workflow_testset_vardatabase_tip');
    } else if (schema.type === FormItemSchemaType.CHAT) {
      return I18n.t('wf_chatflow_74');
    }
    return schema.name;
  }, [schema]);
  const typeLabel = useMemo(() => {
    switch (schema.type) {
      case FormItemSchemaType.STRING:
      case FormItemSchemaType.FLOAT:
      case FormItemSchemaType.NUMBER:
      case FormItemSchemaType.OBJECT:
      case FormItemSchemaType.BOOLEAN:
      case FormItemSchemaType.INTEGER:
      case FormItemSchemaType.TIME:
        return getTestsetFormSubFieldType(schema.type);
      case FormItemSchemaType.LIST: {
        const subType = (schema.schema as ArrayFieldSchema).type;
        return subType
          ? `Array<${getTestsetFormSubFieldType(subType)}>`
          : 'Array';
      }
      case FormItemSchemaType.BOT:
        return '';
      case FormItemSchemaType.CHAT:
        return '';
      default:
        return schema.type;
    }
  }, [schema]);

  return (
    <div className={styles['form-item-label']}>
      <div
        className={cls(styles['label-text'], {
          [styles.required]: schema.required,
        })}
      >
        {label}
      </div>
      {typeLabel ? (
        <div className={styles['label-type']}>{typeLabel}</div>
      ) : null}
    </div>
  );
};

interface FormItemProps {
  schema: FormItemSchema;
  formSchema: NodeFormSchema;
  disabled?: boolean;
  projectId?: string;
}
const FormItem: React.FC<FormItemProps> = ({
  schema,
  formSchema,
  disabled,
  projectId,
}) => {
  const { type, name, required } = schema;
  const { formRenders } = useTestsetManageStore(store => ({
    formRenders: store.formRenders,
  }));
  const CustomFormItem = formRenders?.[type];
  const fieldName = getTestsetFormSubFieldName(formSchema, schema);
  const placeholder = getTestsetFormItemPlaceholder(schema);
  const requiredMsg = I18n.t('workflow_testset_required_tip', {
    param_name:
      schema.type === FormItemSchemaType.BOT ||
      schema.type === FormItemSchemaType.CHAT
        ? ''
        : name,
  });

  if (typeof CustomFormItem !== 'undefined') {
    return (
      <CustomFormItem
        field={fieldName}
        disabled={disabled}
        rules={[{ required, message: requiredMsg }]}
        noLabel={true}
        placeholder={placeholder}
        {...getTestsetFormItemCustomProps(schema, projectId)}
      />
    );
  }

  switch (type) {
    case FormItemSchemaType.BOOLEAN:
      return (
        <FormSelect
          className={styles['form-item-select']}
          field={fieldName}
          disabled={disabled}
          rules={[{ required, message: requiredMsg }]}
          optionList={TESTSET_FORM_BOOLEAN_SELECT_OPTIONS}
          noLabel={true}
          placeholder={placeholder}
          showClear={!required}
        />
      );
    case FormItemSchemaType.INTEGER:
    case FormItemSchemaType.FLOAT:
    case FormItemSchemaType.NUMBER:
      return (
        <Form.InputNumber
          field={fieldName}
          trigger={['change', 'blur']}
          precision={
            type === FormItemSchemaType.INTEGER ? INTEGER_PRECISION : undefined
          }
          rules={[{ required, message: requiredMsg }]}
          disabled={disabled}
          noLabel={true}
          style={{ width: '100%' }}
          placeholder={placeholder}
        />
      );
    case FormItemSchemaType.OBJECT:
    case FormItemSchemaType.LIST:
      return (
        <FormTextArea
          field={fieldName}
          trigger={['change', 'blur']}
          rules={[{ required, message: requiredMsg }]}
          disabled={disabled}
          noLabel={true}
          placeholder={placeholder}
        />
      );
    case FormItemSchemaType.TIME:
      return <Form.DatePicker type="dateTime" field={fieldName} />;
    case FormItemSchemaType.STRING:
    default:
      return (
        <FormTextArea
          field={fieldName}
          autosize={{ minRows: 2, maxRows: 5 }}
          trigger={['change', 'blur']}
          rules={[{ required, message: requiredMsg }]}
          disabled={disabled}
          noLabel={true}
          placeholder={placeholder}
        />
      );
  }
};

interface EditFormSectionProps {
  schema: NodeFormSchema;
  disabled?: boolean;
}

export const EditFormSection: React.FC<EditFormSectionProps> = ({
  schema,
  disabled,
}) => {
  const { projectId } = useTestsetManageStore(store => ({
    projectId: store.projectId,
  }));

  const botFieldValue = useFieldState(BOT_FIELD_NAME);

  // 判断是否选择到了应用，只有选中应用才会回显对话组件。
  // 应用内直接默认选中应用，可以回显对话组件。
  const isBotSelectProject =
    (botFieldValue?.value?.id &&
      botFieldValue?.value?.type === IntelligenceType.Project) ||
    projectId;

  return (
    <Form.Section
      text={<EditFormSectionTitle schema={schema} />}
      className={styles['edit-form-section']}
    >
      {schema.inputs
        .filter(i => {
          if (projectId && i.type === FormItemSchemaType.BOT) {
            return false;
          }
          // 对话组件只会在应用内存在
          if (!isBotSelectProject && i.type === FormItemSchemaType.CHAT) {
            return false;
          }
          return true;
        })
        .map((s, idx) => (
          <Fragment key={idx}>
            <FormLabel schema={s} />
            <FormItem
              schema={s}
              formSchema={schema}
              disabled={disabled}
              projectId={botFieldValue?.value}
            />
          </Fragment>
        ))}
    </Form.Section>
  );
};
