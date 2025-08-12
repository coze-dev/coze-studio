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

import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';

import { isNil, cloneDeep } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import {
  Form,
  FormTextArea,
  Spin,
  Button,
  type FormApi,
  Tooltip,
  Toast,
} from '@coze-arch/coze-design';
import {
  type CaseDataDetail,
  type CaseDataBase,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import { AutoGenButton } from '../auto-gen-button';
import { ResizablePanel, type ResizablePanelRef } from '../../resizable-panel';
import {
  traverseTestsetNodeFormSchemas,
  getTestsetFormSubFieldName,
  transTestsetBoolSelect2Bool,
  transTestsetFormItemSchema2Form,
  getTestsetNameRules,
} from '../../../utils';
import { type NodeFormSchema } from '../../../types';
import {
  FormItemSchemaType,
  type TestsetFormValuesForBoolSelect,
} from '../../../constants';
import { useEditFormSchemas } from './use-edit-form-schemas';
import { TestsetNameInput } from './name-input';
import { EditFormSection } from './edit-form-section';

import styles from './edit-form.module.less';

const TESTSET_NAME_FIELD = '__TESTSET_NAME__';
const TESTSET_DESC_FIELD = '__TESTSET_DESC__';

interface TestsetEditFormProps {
  data?: CaseDataDetail | null;
}

export const TestsetEditForm: React.FC<TestsetEditFormProps> = ({ data }) => {
  const {
    bizComponentSubject,
    bizCtx,
    editMode,
    generating,
    closeEditPanel,
    updateEditPanelCloseState,
  } = useTestsetManageStore(store => ({
    bizCtx: store.bizCtx,
    bizComponentSubject: store.bizComponentSubject,
    editMode: store.editMode,
    closeEditPanel: store.closeEditPanel,
    generating: store.generating,
    updateEditPanelCloseState: store.updateEditPanelCloseState,
  }));

  const { schemas, schemasLoading } = useEditFormSchemas(data);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<FormApi<Record<string, any>>>();
  const resizablePanelRef = useRef<ResizablePanelRef | null>(null);

  const title = useMemo(
    () => (
      <span className={'flex items-center'}>
        <IconCozArrowLeft
          className={'mr-[7px] cursor-pointer'}
          onClick={() => resizablePanelRef.current?.close?.()}
        />
        <span className={'font-medium'}>
          {editMode === 'edit'
            ? I18n.t('workflow_testset_edit_title')
            : I18n.t('workflow_testset_create_title')}
        </span>
      </span>
    ),
    [editMode],
  );

  const handleClose = useCallback(() => {
    closeEditPanel();
  }, [closeEditPanel]);

  const handleUpdateCloseState = useCallback(() => {
    updateEditPanelCloseState(false);
  }, [updateEditPanelCloseState]);

  const handleSubmit = async () => {
    setValidating(true);
    try {
      await formRef.current?.validate();
      const errors = formRef.current?.getFormState().errors;

      if (Object.keys(errors ?? {}).length) {
        return;
      }

      onSubmit();
    } finally {
      setValidating(false);
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const testsetFormValues = formRef.current?.getValues();

      if (!testsetFormValues) {
        return;
      }

      const inputSchemas = cloneDeep(schemas ?? []);
      traverseTestsetNodeFormSchemas(inputSchemas, (schema, ipt) => {
        const val = testsetFormValues[getTestsetFormSubFieldName(schema, ipt)];

        if (!isNil(val)) {
          ipt.value = val;
        }

        // Clears null values of objects/arrays, including empty strings
        if (
          !val &&
          (ipt.type === FormItemSchemaType.LIST ||
            ipt.type === FormItemSchemaType.OBJECT)
        ) {
          ipt.value = undefined;
        }

        // Bool type, you need to convert the enumeration to a boolean
        if (ipt.type === FormItemSchemaType.BOOLEAN) {
          ipt.value = transTestsetBoolSelect2Bool(
            ipt.value as TestsetFormValuesForBoolSelect,
          );
        }
      });

      const caseBase: CaseDataBase = {
        name: testsetFormValues[TESTSET_NAME_FIELD],
        caseID: data?.caseBase?.caseID,
        description: testsetFormValues[TESTSET_DESC_FIELD],
        input: JSON.stringify(inputSchemas),
      };

      await debuggerApi.SaveCaseData({
        bizComponentSubject,
        bizCtx,
        caseBase,
      });

      Toast.success(I18n.t('Save_success'));
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = useCallback(
    (nextSchemas: NodeFormSchema[]) => {
      const formValues = formRef.current?.getValues() || {};
      const validateFields: string[] = [];

      traverseTestsetNodeFormSchemas(nextSchemas, (schema, ipt) => {
        const fieldName = getTestsetFormSubFieldName(schema, ipt);
        const value = transTestsetFormItemSchema2Form(ipt)?.value;
        if (!isNil(value)) {
          formValues[fieldName] = value;
          validateFields.push(fieldName);
        }
      });

      formRef.current?.setValues(formValues);
      // Check again after setting the value
      formRef.current?.validate(validateFields);
    },
    [formRef],
  );

  useEffect(() => {
    formRef.current?.setValues({
      [TESTSET_NAME_FIELD]: data?.caseBase?.name ?? '',
      [TESTSET_DESC_FIELD]: data?.caseBase?.description,
    });
  }, [data]);

  useEffect(() => {
    if (typeof schemas === 'undefined') {
      return;
    }
    const values = formRef.current?.getValues() ?? {};
    traverseTestsetNodeFormSchemas(
      schemas,
      (schema, ipt) =>
        (values[getTestsetFormSubFieldName(schema, ipt)] =
          transTestsetFormItemSchema2Form(ipt)?.value),
    );
    formRef.current?.setValues(values);
  }, [schemas]);

  return (
    <ResizablePanel
      className={styles['edit-form-resizeable-panel']}
      draggable={false}
      animation={'slide'}
      ref={resizablePanelRef}
      header={title}
      onClose={handleClose}
      onCloseWithoutAnimation={handleUpdateCloseState}
      footer={
        <Tooltip
          content={I18n.t('workflow_testset_submit_tooltip_for_expert_mode')}
        >
          <Button
            color="hgltplus"
            style={{ width: '100%' }}
            disabled={generating}
            loading={validating || submitting}
            onClick={handleSubmit}
          >
            {I18n.t('workflow_testset_edit_confirm')}
          </Button>
        </Tooltip>
      }
    >
      <div className={styles['edit-form']}>
        <Form<Record<string, unknown>>
          showValidateIcon={false}
          getFormApi={api => (formRef.current = api)}
        >
          <TestsetNameInput
            field={TESTSET_NAME_FIELD}
            trigger="blur"
            stopValidateWithError={true}
            label={I18n.t('workflow_testset_name')}
            placeholder={I18n.t('workflow_testset_name_placeholder')}
            rules={getTestsetNameRules({
              bizCtx,
              bizComponentSubject,
              originVal: data?.caseBase?.name,
              isOversea: IS_OVERSEA,
            })}
          />

          <div className={styles['edit-form-desc-input']}></div>
          <FormTextArea
            field={TESTSET_DESC_FIELD}
            label={I18n.t('workflow_testset_desc')}
            placeholder={I18n.t('workflow_testset_desc_placeholder')}
            autosize={true}
            maxCount={200}
            maxLength={200}
            rows={2}
          />
          <div className={styles['edit-form-title']}>
            <span className={styles['title-text']}>
              {I18n.t('workflow_testset_node_data')}
            </span>
            {IS_OVERSEA || IS_BOE ? (
              <AutoGenButton onGenerate={handleGenerate} />
            ) : null}
          </div>
          {schemasLoading ? <Spin /> : null}
          {!schemasLoading && schemas?.length
            ? schemas.map(schema => (
                <EditFormSection
                  key={schema.component_id}
                  schema={schema}
                  disabled={generating}
                />
              ))
            : null}
        </Form>
      </div>
    </ResizablePanel>
  );
};
