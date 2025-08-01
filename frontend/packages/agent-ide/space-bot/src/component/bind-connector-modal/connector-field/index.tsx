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

import { logger } from '@coze-arch/logger';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozTrashCan, IconCozPlus } from '@coze-arch/coze-design/icons';
import { TagGroup, ArrayField, Button } from '@coze-arch/coze-design';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { type RuleItem } from '@coze-arch/bot-semi/Form';
import { UIFormInput, Form, Typography } from '@coze-arch/bot-semi';
import {
  type Options,
  type FormSchemaItem,
} from '@coze-arch/bot-api/developer_api';

import { type TFormData } from '../types';

import styles from './index.module.less';

function formatMultiSelectValue(rawValue: string, enums?: Options[]) {
  const arrayValue = typeSafeJSONParse(rawValue) as string[] | undefined;
  if (!arrayValue) {
    return [];
  }
  return arrayValue.map(value => ({
    children: enums?.find(option => option.value === value)?.label ?? value,
  }));
}

export interface ConnectorFieldProps {
  formItemSchema: FormSchemaItem;
  isReadOnly: boolean;
  initValue?: TFormData;
}

export const ConnectorField = (props: ConnectorFieldProps) => {
  const { formItemSchema, isReadOnly, initValue } = props;
  const rawInitValue = initValue?.[formItemSchema.name];

  if (isReadOnly) {
    return (
      <div className={styles['disable-field']}>
        <div className={styles.title}>{formItemSchema.title}</div>
        {formItemSchema.type === 'array' ? (
          <TagGroup
            tagList={formatMultiSelectValue(rawInitValue, formItemSchema.enums)}
          />
        ) : (
          <Typography.Text
            style={{ width: '100%' }}
            ellipsis={{
              showTooltip: {
                opts: {
                  content: rawInitValue,
                  style: { wordBreak: 'break-word' },
                },
              },
            }}
          >
            {rawInitValue}
          </Typography.Text>
        )}
      </div>
    );
  }

  function createRules(fieldSchema: FormSchemaItem): RuleItem[] {
    // Make sure formItemSchema.rules is an array
    const itemRules = fieldSchema.rules ?? [];

    const rules = itemRules.map(rule => {
      const ruleMessage = rule.message
        ? I18n.t(rule.message as I18nKeysNoOptionsType, {
            field: fieldSchema.name,
          })
        : undefined;

      return { ...rule, ...(ruleMessage && { message: ruleMessage }) };
    });

    // Add'required 'rule
    rules.push({
      required: fieldSchema.required,
      message: I18n.t('bot_publish_field_placeholder', {
        field: fieldSchema.title ?? '',
      }),
    });

    return rules as RuleItem[];
  }

  if (!formItemSchema.name) {
    return null;
  }

  switch (formItemSchema.component) {
    case 'Input':
      if (formItemSchema.type === 'array') {
        let values: string[] = [];
        try {
          values = JSON.parse(rawInitValue);
        } catch (e) {
          logger.error({ error: e as Error });
          values = [];
        }
        // Add a default null value
        if (!values.length) {
          values.push('');
        }

        return (
          <ArrayField field={formItemSchema.name} initValue={values}>
            {({ arrayFields, add }) => (
              <>
                {arrayFields.map(({ key, field, remove }, i) => (
                  <UIFormInput
                    key={key}
                    placeholder={I18n.t('bot_publish_field_placeholder', {
                      field: formItemSchema.title ?? '',
                    })}
                    field={field}
                    label={formItemSchema.title}
                    noLabel={i > 0}
                    required={formItemSchema.required}
                    rules={createRules(formItemSchema)}
                    fieldClassName={styles.input}
                    suffix={
                      arrayFields.length <= 1 ? null : (
                        <IconCozTrashCan onClick={remove} />
                      )
                    }
                  />
                ))}
                <Button
                  className={styles['link-button']}
                  color="highlight"
                  size="small"
                  icon={<IconCozPlus />}
                  onClick={add}
                >
                  {I18n.t('binding_add_card')}
                </Button>
              </>
            )}
          </ArrayField>
        );
      }
      return (
        <UIFormInput
          key={formItemSchema.name}
          placeholder={I18n.t('bot_publish_field_placeholder', {
            field: formItemSchema.title ?? '',
          })}
          field={formItemSchema.name}
          label={formItemSchema.title}
          required={formItemSchema.required}
          showClear
          rules={createRules(formItemSchema)}
          initValue={rawInitValue}
        />
      );

    case 'Select': {
      const isMultiple = formItemSchema.type === 'array';
      const selectInitValue = isMultiple
        ? (typeSafeJSONParse(rawInitValue) as string[] | undefined)
        : rawInitValue;
      return (
        <Form.Select
          key={formItemSchema.name}
          placeholder={`Enter ${formItemSchema.title}`}
          field={formItemSchema.name}
          label={formItemSchema.title}
          optionList={formItemSchema.enums}
          multiple={isMultiple}
          rules={createRules(formItemSchema)}
          initValue={selectInitValue}
        />
      );
    }

    default:
      return null;
  }
};
