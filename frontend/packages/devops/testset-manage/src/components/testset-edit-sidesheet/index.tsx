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

import { cloneDeep } from 'lodash-es';
import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import {
  UIButton,
  Form,
  UIFormTextArea,
  SideSheet,
  Spin,
  Tooltip,
} from '@coze-arch/bot-semi';
import { debuggerApi } from '@coze-arch/bot-api';

import { SideSheetTitle } from '../sidesheet-title';
import {
  type FormItemSchema,
  type TestsetData,
  type TestsetDatabase,
  FormItemSchemaType,
  type NodeFormSchema,
} from '../../types';
import { useInnerStore } from '../../store';
import { useTestsetManageStore } from '../../hooks';
import { TestsetManageEventName } from '../../events';
import {
  toNodeFormSchemas,
  isNil,
  traverseNodeFormSchemas,
  getTestsetNameRules,
  getSubFieldName,
  isSameType,
  transBoolSelect2Bool,
  type ValuesForBoolSelect,
  transFormItemSchema2Form,
} from './utils';
import { TestsetNameInput } from './testset-name-input';
import { NodeFormSection } from './node-form-section';
import { ReactComponent as IconBack } from './icon-back.svg';
import { AutoFillButton } from './auto-fill';

import s from './index.module.less';

export interface TestsetEditState {
  visible?: boolean;
  mode?: 'edit' | 'create';
  testset?: TestsetData;
}

interface TestsetEditSideSheetProps extends TestsetEditState {
  mask?: boolean;
  onClose?: () => void;
  onSuccess?: (testset?: TestsetData) => void;
  onCancel?: () => void;
  /** 是否为多人协作模式 */
  isExpertMode?: boolean;
}

const TESTSET_NAME_FIELD = '__TESTSET_NAME__';
const TESTSET_DESC_FIELD = '__TESTSET_DESC__';

/**
 * 特化逻辑：表单项赋默认值
 * - Boolean类型：`false` 因为undefined的表现上和false一样，容易引发用户误解
 * - Object类型：`{}`
 * - Array类型： `[]`
 */
function assignDefaultValue(ipt: FormItemSchema) {
  if (!isNil(ipt.value)) {
    return;
  }

  switch (ipt.type) {
    case FormItemSchemaType.BOOLEAN:
      // ipt.value = true;
      break;
    case FormItemSchemaType.OBJECT:
      ipt.value = '{}';
      break;
    case FormItemSchemaType.LIST:
      ipt.value = '[]';
      break;
    default:
      break;
  }
}

interface TestsetFormValue {
  [key: string]: any;
}

// eslint-disable-next-line @coze-arch/max-line-per-function -- form function component
export function TestsetEditSideSheet({
  visible,
  mode,
  testset,
  mask,
  onClose,
  onSuccess,
  isExpertMode,
}: TestsetEditSideSheetProps) {
  const { generating: autoGenerating } = useInnerStore();
  const { bizComponentSubject, bizCtx, reportEvent } = useTestsetManageStore(
    store => store,
  );

  const testsetFormApi = useRef<FormApi<TestsetFormValue>>();
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: nodeSchemas, loading: loadingSchema } = useRequest(
    async () => {
      if (!visible) {
        return [];
      }

      const localSchemas = toNodeFormSchemas(testset?.caseBase?.input);
      const res = await debuggerApi.GetSchemaByID({
        bizComponentSubject,
        bizCtx,
      });
      const remoteSchemas = toNodeFormSchemas(res.schemaJson);

      if (localSchemas.length) {
        // 编辑模式：比对本地和远程schema并尝试赋值
        const localSchemaMap: Record<string, FormItemSchema | undefined> = {};
        traverseNodeFormSchemas(
          localSchemas,
          (schema, ipt) => (localSchemaMap[getSubFieldName(schema, ipt)] = ipt),
        );

        traverseNodeFormSchemas(remoteSchemas, (schema, ipt) => {
          const subName = getSubFieldName(schema, ipt);
          const field = localSchemaMap[subName];

          if (isSameType(ipt.type, field?.type) && !isNil(field?.value)) {
            ipt.value = field?.value;
          }
        });
      } else {
        // 创建模式：赋默认值
        traverseNodeFormSchemas(remoteSchemas, (schema, ipt) => {
          assignDefaultValue(ipt);
        });
      }

      return remoteSchemas;
    },
    { refreshDeps: [testset, visible] },
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    testsetFormApi.current?.setValues({
      [TESTSET_NAME_FIELD]: testset?.caseBase?.name ?? '',
      [TESTSET_DESC_FIELD]: testset?.caseBase?.description,
    });
  }, [visible, testset]);

  // 给节点表单设置值
  useEffect(() => {
    if (typeof nodeSchemas === 'undefined') {
      return;
    }

    const values = testsetFormApi.current?.getValues() ?? {};
    traverseNodeFormSchemas(
      nodeSchemas,
      (schema, ipt) =>
        (values[getSubFieldName(schema, ipt)] =
          transFormItemSchema2Form(ipt)?.value),
    );
    testsetFormApi.current?.setValues(values);
  }, [nodeSchemas]);

  const renderTitle = () => (
    <SideSheetTitle
      icon={<IconBack />}
      title={
        mode
          ? mode === 'create'
            ? I18n.t('workflow_testset_create_title')
            : I18n.t('workflow_testset_edit_title')
          : ''
      }
      onClose={onClose}
    />
  );

  const renderFooter = () => (
    <div className="text-right">
      <Tooltip
        trigger={isExpertMode ? 'hover' : 'custom'}
        content={I18n.t('workflow_testset_submit_tooltip_for_expert_mode')}
      >
        <UIButton
          theme="solid"
          disabled={autoGenerating}
          loading={validating || submitting}
          onClick={onConfirm}
        >
          {I18n.t('workflow_testset_edit_confirm')}
        </UIButton>
      </Tooltip>
    </div>
  );

  const renderNodeForm = () => {
    if (loadingSchema) {
      return <Spin />;
    }

    if (!nodeSchemas?.length) {
      return null;
    }

    return nodeSchemas.map(schema => (
      <NodeFormSection
        key={schema.component_id}
        schema={schema}
        autoGenerating={autoGenerating}
      />
    ));
  };

  const onConfirm = async () => {
    setValidating(true);
    try {
      await testsetFormApi.current?.validate();
      const errors = testsetFormApi.current?.getFormState().errors;

      if (Object.keys(errors ?? {}).length) {
        return;
      }

      onSubmit();
    } finally {
      setValidating(false);
    }
  };

  // 提交表单
  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const testsetFormValues = testsetFormApi.current?.getValues();

      if (!testsetFormValues) {
        return;
      }

      const inputSchemas = cloneDeep(nodeSchemas ?? []);
      traverseNodeFormSchemas(inputSchemas, (schema, ipt) => {
        const val = testsetFormValues[getSubFieldName(schema, ipt)];

        if (!isNil(val)) {
          ipt.value = val;
        }

        // 清除 object/array的空值，包括空字符串
        if (
          !val &&
          (ipt.type === FormItemSchemaType.LIST ||
            ipt.type === FormItemSchemaType.OBJECT)
        ) {
          ipt.value = undefined;
        }

        // bool 类型 需要将枚举转为布尔值
        if (ipt.type === FormItemSchemaType.BOOLEAN) {
          ipt.value = transBoolSelect2Bool(ipt.value as ValuesForBoolSelect);
        }
      });

      const caseBase: TestsetDatabase = {
        name: testsetFormValues[TESTSET_NAME_FIELD],
        caseID: testset?.caseBase?.caseID,
        description: testsetFormValues[TESTSET_DESC_FIELD],
        input: JSON.stringify(inputSchemas),
      };

      const saveResp = await debuggerApi.SaveCaseData({
        bizComponentSubject,
        bizCtx,
        caseBase,
      });

      if (mode === 'create') {
        reportEvent?.(TestsetManageEventName.CREATE_TESTSET_SUCCESS);
      }
      onSuccess?.(saveResp.caseDetail);
    } finally {
      setSubmitting(false);
    }
  };

  /** auto fill form values */
  const onAutoFill = (autoSchemas: NodeFormSchema[]) => {
    const formValues = testsetFormApi.current?.getValues() || {};
    const validateFields: string[] = [];

    traverseNodeFormSchemas(autoSchemas, (schema, ipt) => {
      const fieldName = getSubFieldName(schema, ipt);
      const value = transFormItemSchema2Form(ipt)?.value;
      if (!isNil(value)) {
        formValues[fieldName] = value;
        validateFields.push(fieldName);
      }
    });

    testsetFormApi.current?.setValues(formValues);
    // 设置值之后再校验一次
    testsetFormApi.current?.validate(validateFields);
  };

  return (
    <SideSheet
      title={renderTitle()}
      footer={renderFooter()}
      visible={visible}
      mask={mask}
      className={s.sidesheet}
      width={600}
      closable={false}
      onCancel={onClose}
    >
      <Form<TestsetFormValue>
        getFormApi={api => (testsetFormApi.current = api)}
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
            originVal: testset?.caseBase?.name,
            isOversea: IS_OVERSEA,
          })}
        />
        <UIFormTextArea
          field={TESTSET_DESC_FIELD}
          className={s['testset-desc']}
          label={I18n.t('workflow_testset_desc')}
          placeholder={I18n.t('workflow_testset_desc_placeholder')}
          autosize={true}
          maxCount={200}
          maxLength={200}
          rows={2}
        />
        <div className={s['node-data-title']}>
          <span>{I18n.t('workflow_testset_node_data')}</span>
          <AutoFillButton className={s['auto-btn']} onAutoFill={onAutoFill} />
        </div>
        {renderNodeForm()}
      </Form>
    </SideSheet>
  );
}
