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

import { useCallback, useRef, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { Toast, UIButton, UIModal } from '@coze-arch/bot-semi';
import { IconEdit } from '@coze-arch/bot-icons';
import {
  ParameterType,
  type APIParameter,
} from '@coze-arch/bot-api/plugin_develop';

import {
  scrollToErrorElement,
  transformArrayToTree,
  transformTreeToObj,
  updateNodeById,
} from '../utils';
import { InputAndVariableItem } from '../input-and-variable';
import ParamsForm from '../debug-components/params-form';
import { ROWKEY } from '../config';
import { InputItem } from './form-components';

import styles from './index.module.less';

interface DefaultValueInputProps {
  record: APIParameter;
  data: Array<APIParameter>;
  defaultKey?: 'global_default' | 'local_default';
  disableKey?: 'global_disable' | 'local_disable';
  setData: (val: Array<APIParameter>) => void;
  canReference?: boolean;
  referenceOption?: OptionProps[];
}

interface DefaultModalProps {
  record: APIParameter;
  defaultKey: 'global_default' | 'local_default';
  disableKey: 'global_disable' | 'local_disable';
  updateNodeAndData: (key: string, value: string) => void;
}

const DefaultValueModal = ({
  record,
  defaultKey,
  disableKey,
  updateNodeAndData,
}: DefaultModalProps) => {
  const [check, setCheck] = useState(0);
  const [visible, setVisible] = useState(false);
  const paramsFormRef = useRef<{ data: Array<APIParameter> }>(null);
  const [defRecord, setDefRecord] = useState<APIParameter>(
    {} satisfies APIParameter,
  );

  const handleOpen = useCallback(() => {
    setVisible(true);
    const r = cloneDeep(record);
    if (r[defaultKey]) {
      const tree = transformArrayToTree(
        JSON.parse(r[defaultKey] || '[]'),
        r.sub_parameters || [],
      );
      r.sub_parameters = tree;
    }
    setDefRecord(r);
  }, [record]);

  const handleClose = () => {
    setVisible(false);
    setDefRecord({} satisfies APIParameter);
  };

  const handleSave = () => {
    // Verification is required
    setCheck(check + 1);
    const errorEle = document.getElementsByClassName('errorDebugClassTag');
    if (errorEle.length > 0) {
      scrollToErrorElement('.errorDebugClassTag');
      Toast.error({
        content: withSlardarIdButton(I18n.t('tool_new_S2_feedback_failed')),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
      return;
    }
    const reqParams = Object.values(
      transformTreeToObj(paramsFormRef.current?.data, false),
    );
    updateNodeAndData(defaultKey, JSON.stringify(reqParams[0]));
    handleClose();
  };

  return (
    <>
      <UIButton
        disabled={record.is_required && record[disableKey]}
        icon={<IconEdit />}
        className={styles['arr-edit-btn']}
        style={{ width: '100%' }}
        onClick={handleOpen}
      >
        {I18n.t('plugin_edit_tool_default_value_array_edit_button')}
      </UIButton>
      {visible ? (
        <UIModal
          title={I18n.t(
            'plugin_edit_tool_default_value_array_edit_modal_title',
          )}
          width={792}
          okText={I18n.t('Save')}
          visible={visible}
          onCancel={handleClose}
          hasCancel={false}
          onOk={handleSave}
          zIndex={1050}
        >
          <ParamsForm
            ref={paramsFormRef}
            requestParams={[defRecord]}
            defaultKey={defaultKey}
            disabled={false}
            check={check}
            needCheck={false}
            height={400}
          />
        </UIModal>
      ) : null}
    </>
  );
};

export const DefaultValueInput = ({
  record,
  data,
  setData,
  canReference = false,
  defaultKey = 'global_default', //Text box key
  disableKey = 'global_disable', //Open button key
  referenceOption,
}: DefaultValueInputProps) => {
  // @ts-expect-error -- linter-disable-autofix
  const updateNodeAndData = (key, value) => {
    updateNodeById({
      data,
      targetKey: record[ROWKEY] as string,
      field: key,
      value,
    });
    const cloneData = cloneDeep(data);
    setData(cloneData);
  };

  if (record[defaultKey] === undefined) {
    return <></>;
  }

  // Complex types do not currently support reference variables
  if (record.type === ParameterType.Array) {
    return (
      <div className={styles['modal-wrapper']}>
        <DefaultValueModal
          record={record}
          defaultKey={defaultKey}
          disableKey={disableKey}
          updateNodeAndData={updateNodeAndData}
        />
      </div>
    );
  }
  return (
    <>
      {canReference ? (
        <InputAndVariableItem
          record={record}
          disabled={!!record[disableKey]}
          referenceOption={referenceOption}
          onSourceChange={val => {
            updateNodeAndData('default_param_source', val);
          }}
          onReferenceChange={val => {
            updateNodeAndData('variable_ref', val);
          }}
          onValueChange={val => {
            updateNodeAndData(defaultKey, val);
          }}
        />
      ) : (
        <InputItem
          width="100%"
          placeholder={I18n.t(
            'plugin_edit_tool_default_value_input_placeholder',
          )}
          max={2000}
          val={record[defaultKey]}
          useCheck={false}
          filterSpace={false}
          disabled={!!record[disableKey]}
          callback={(e: string) => {
            updateNodeAndData(defaultKey, e);
          }}
        />
      )}
    </>
  );
};
