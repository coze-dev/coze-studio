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

import { useEffect, useRef, useState } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';
import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import {
  PLATFORM_FIELD,
  SYSTEM_FIELD_ROW_INDEX,
} from '@coze-data/database-v2-base/constants';
import { DatabaseFieldTitle } from '@coze-data/database-v2-base/components/database-field-title';
import { I18n } from '@coze-arch/i18n';
import {
  CozInputNumber,
  type DatePickerProps,
  DatePicker,
  Form,
  TextArea,
  Modal,
  Select,
  withField,
  type CommonFieldProps,
} from '@coze-arch/coze-design';
import { FieldItemType, TableType } from '@coze-arch/bot-api/memory';

import {
  type TableRow,
  type TableFieldData,
} from '../database-table-data/type';
import { isInInt64Range } from '../../utils/is-in-int64-range';
import { useConnectorOptions } from '../../hooks/use-connector-options';

const FormTextArea = withField(TextArea);
const FormInputNumber = withField(CozInputNumber);
const FormDatePicker = withField(
  (
    props: Omit<DatePickerProps, 'onChange'> & {
      onChange?: (dateString: string) => void;
    },
  ) => (
    <DatePicker
      {...props}
      type="dateTime"
      // Semi DatePicker uses date-fns format
      format="yyyy-MM-dd HH:mm:ss"
      onChange={date =>
        props.onChange?.(dayjs(date as Date).format('YYYY-MM-DD HH:mm:ss'))
      }
    />
  ),
);
const FormSelect = withField(Select);

function tableRowToFormValues(row: TableRow): Record<string, string> {
  return Object.fromEntries(
    Object.values(row).map(field => [
      field.fieldName,
      field.value?.toString() ?? '',
    ]),
  );
}

function stringifyFormValues(
  values: Record<string, string | number | boolean>,
) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value?.toString() ?? '',
    ]),
  );
}

export interface RowEditModalProps {
  visible: boolean;
  fields: TableFieldData[];
  tableType?: TableType;
  initialValues?: TableRow;
  onSubmit: (
    values: Record<string, string>,
    originalConnectorId?: string,
  ) => Promise<void>;
  onCancel: () => void;
}

export function RowEditModal({
  visible,
  fields,
  tableType,
  initialValues,
  onSubmit,
  onCancel,
}: RowEditModalProps) {
  const isAdd = typeof initialValues !== 'object';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<Form>(null);

  useEffect(() => {
    if (visible && initialValues) {
      formRef.current?.formApi?.setValues(tableRowToFormValues(initialValues));
    }
  }, [visible, initialValues]);

  const connectorOptions = useConnectorOptions();

  return (
    <Modal
      visible={visible}
      title={I18n.t(isAdd ? 'db_optimize_022' : 'db_optimize_023')}
      okText={I18n.t(isAdd ? 'db_optimize_025' : 'db_edit_save')}
      okButtonProps={{ loading: isSubmitting }}
      onOk={async () => {
        setIsSubmitting(true);
        try {
          const values = await formRef.current?.formApi?.validate();
          if (values) {
            await onSubmit(
              Object.assign(
                initialValues ? tableRowToFormValues(initialValues) : {},
                stringifyFormValues(values),
              ),
              initialValues?.bstudio_connector_id?.value as string | undefined,
            );
          }
        } finally {
          setIsSubmitting(false);
        }
      }}
      cancelText={I18n.t('db_optimize_024')}
      onCancel={() => {
        onCancel();
        formRef.current?.formApi?.reset();
      }}
    >
      <Form<Record<string, unknown>> allowEmpty ref={formRef}>
        {tableType === TableType.OnlineTable ? (
          // Only "Online Data" supports modifying the "Channel" field
          <FormSelect
            {...getSystemFieldCommonProps(PLATFORM_FIELD)}
            optionList={connectorOptions}
            className="w-full"
          />
        ) : null}
        {fields.map(field => {
          const commonProps = getUserFieldCommonProps(field);
          switch (field.type) {
            case FieldItemType.Text: {
              return (
                <FormTextArea
                  {...commonProps}
                  autosize={{ minRows: 1, maxRows: 5 }}
                />
              );
            }
            case FieldItemType.Number: {
              return (
                <Form.Input
                  {...commonProps}
                  className={classNames(
                    'w-full',
                    '[&_.semi-input-wrapper]:coz-stroke-plus',
                    'focus-within:[&_.semi-input-wrapper]:coz-stroke-hglt',
                    '[&_.semi-input-wrapper.semi-input-wrapper-error]:coz-stroke-hglt-red',
                  )}
                  validate={value => {
                    if (!isInInt64Range(value?.toString() ?? '')) {
                      return 'invalid Integer';
                    }
                    return '';
                  }}
                />
              );
            }
            case FieldItemType.Date: {
              return (
                <FormDatePicker
                  {...commonProps}
                  className={classNames(
                    'w-full',
                    '[&_.semi-datepicker-input]:w-full',
                    '[&_.coz-date-picker-select]:w-full',
                    '[&[aria-invalid]_.coz-date-picker-select]:coz-stroke-hglt-red',
                  )}
                />
              );
            }
            case FieldItemType.Float: {
              return (
                <FormInputNumber
                  {...commonProps}
                  className={classNames(
                    'w-full',
                    '[&_.semi-input-wrapper]:coz-stroke-plus',
                    'focus-within:[&_.semi-input-wrapper]:coz-stroke-hglt',
                    '[&_.semi-input-wrapper.semi-input-wrapper-error]:coz-stroke-hglt-red',
                  )}
                  validate={value => {
                    if (Number.isNaN(value) || Math.abs(value) === Infinity) {
                      return 'invalid Float';
                    }
                    return '';
                  }}
                />
              );
            }
            case FieldItemType.Boolean: {
              return (
                <FormSelect
                  {...commonProps}
                  optionList={[
                    { value: 'true', label: 'true' },
                    { value: 'false', label: 'false' },
                  ]}
                  className="w-full"
                />
              );
            }
            default: {
              return null;
            }
          }
        })}
      </Form>
    </Modal>
  );
}

type FieldCommonProps = React.Attributes & CommonFieldProps;

function getSystemFieldCommonProps(field: TableMemoryItem): FieldCommonProps {
  return {
    key: field.name,
    field: SYSTEM_FIELD_ROW_INDEX[field.name ?? ''] ?? '',
    label: (
      <DatabaseFieldTitle
        field={field.name}
        textType="primary"
        // @ts-expect-error fix me late
        type={field.type}
        tip={field.desc}
        required
      />
    ),
  };
}

function getUserFieldCommonProps(field: TableFieldData): FieldCommonProps {
  return {
    key: field.fieldName,
    field: field.fieldName,
    rules: [{ required: field.required }],
    label: {
      text: (
        <DatabaseFieldTitle
          field={field.fieldName}
          textType="primary"
          type={field.type}
          tip={field.fieldDescription}
          required={field.required}
        />
      ),
      // The required * symbol is already displayed in DatabaseFieldTitle
      required: false,
    },
  };
}
