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

/* eslint-disable complexity -- ignore */
import ReactMarkdown from 'react-markdown';
import {
  forwardRef,
  type Ref,
  useRef,
  useImperativeHandle,
  useEffect,
} from 'react';

import { useUpdate } from 'ahooks';
import type { FormApi } from '@coze-arch/bot-semi/Form';
import { Space, Form } from '@coze-arch/bot-semi';
import { type ApiError } from '@coze-arch/bot-http';
import { type SchemaAreaInfo } from '@coze-arch/bot-api/developer_api';

import { type FormActions, type TFormData } from '../types';
import { ConnectorField } from '../connector-field';

import styles from './index.module.less';

export interface ConnectorFormProps {
  schemaAreaInfo?: SchemaAreaInfo;
  initValue?: TFormData;
  getFormDisable: (disable: boolean) => void;
  isReadOnly: boolean;
  setErrorMessage: (error?: ApiError) => void;
}

const DEFAULT_FORM_STEP = 2;

// Multiple Select The value in the Form is string [], but it needs to be converted to a JSON string when submitted to the backend.
type FormValues = Record<string, string | string[]>;

export const ConnectorForm = forwardRef(
  (props: ConnectorFormProps, ref: Ref<FormActions>) => {
    const {
      schemaAreaInfo,
      initValue,
      getFormDisable,
      isReadOnly,
      setErrorMessage,
    } = props;

    const formApiRef = useRef<FormApi<FormValues>>();
    const update = useUpdate();

    useImperativeHandle<FormActions, FormActions>(ref, () => ({
      submit: async () => {
        const values = await formApiRef.current?.validate();
        return Object.fromEntries(
          Object.entries(values ?? {}).map(([key, value]) => [
            key,
            Array.isArray(value) ? JSON.stringify(value) : value,
          ]),
        );
      },
      reset: () => formApiRef.current?.reset(),
    }));

    useEffect(() => {
      // Solve the problem that the value of formApiRef.current is not real-time
      update();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ignore
    }, [schemaAreaInfo]);

    const formDisabled =
      schemaAreaInfo?.schema_list
        ?.filter(item => item.required)
        .some(field => {
          const value = formApiRef.current?.getValue(field.name);
          if (Array.isArray(value)) {
            return !value.length || (value.length === 1 && !value[0]);
          }
          return !value;
        }) || !schemaAreaInfo?.schema_list?.length;

    useEffect(() => {
      getFormDisable(formDisabled);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ignore
    }, [formDisabled]);

    return (
      <div>
        {schemaAreaInfo?.title_text ? (
          <Space spacing={12} align="start">
            <span className={styles['step-order']}>
              {schemaAreaInfo.step_order || DEFAULT_FORM_STEP}
            </span>

            <div className={styles['step-content']}>
              <div className={styles['step-title']}>
                {schemaAreaInfo.title_text}
              </div>
            </div>
          </Space>
        ) : null}
        {schemaAreaInfo?.description ? (
          <ReactMarkdown skipHtml={true} className={styles.markdown}>
            {schemaAreaInfo?.description}
          </ReactMarkdown>
        ) : null}

        {schemaAreaInfo?.schema_list?.length ? (
          <Form<FormValues>
            initValues={initValue}
            className={styles['config-form']}
            onValueChange={() => {
              update();
              setErrorMessage(undefined);
            }}
            getFormApi={formApi => (formApiRef.current = formApi)}
            autoScrollToError
            allowEmpty
          >
            {schemaAreaInfo?.schema_list?.map(item => (
              <ConnectorField
                initValue={initValue}
                formItemSchema={item}
                isReadOnly={isReadOnly}
                key={item.name}
              />
            ))}
          </Form>
        ) : null}
      </div>
    );
  },
);
