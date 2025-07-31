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

/* eslint-disable @coze-arch/max-line-per-function */
import { useRef } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  type ParamsTypeDefine,
  PluginMockDataGenerateMode,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type RuleItem, type FormApi } from '@coze-arch/bot-semi/Form';
import { Form, UIFormTextArea, UIModal, UIToast } from '@coze-arch/bot-semi';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { type MockSet } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import {
  type BasicMockSetInfo,
  MOCK_SET_ERR_CODE,
  getEnvironment,
  getMockSubjectInfo,
  getPluginInfo,
} from '@coze-studio/mockset-shared';

import styles from './index.module.less';

const mockSetInfoRules: {
  name: Array<RuleItem>;
  desc: Array<RuleItem>;
} = {
  name: [
    {
      required: true,
      message: I18n.t('please_enter_mockset_name'),
    },
    IS_OVERSEA
      ? {
          pattern: /^[\w\s]+$/,
          message: I18n.t('create_plugin_modal_nameerror'),
        }
      : {
          pattern: /^[\w\s\u4e00-\u9fa5]+$/u, // Increased domestic support for Chinese
          message: I18n.t('create_plugin_modal_nameerror_cn'),
        },
  ],
  desc: IS_OVERSEA
    ? [
        {
          // eslint-disable-next-line no-control-regex -- regex
          pattern: /^[\x00-\x7F]+$/,
          message: I18n.t('create_plugin_modal_descrip_error'),
        },
      ]
    : [],
};

export interface EditMockSetInfo extends BasicMockSetInfo {
  id?: string;
  name?: string;
  desc?: string;
  autoGenerate?: boolean;
}

export interface MockSetEditModalProps {
  visible?: boolean;
  zIndex?: number;
  disabled?: boolean;
  initialInfo: EditMockSetInfo;
  onSuccess?: (
    mockSetInfo?: MockSet,
    config?: { generateMode: number },
  ) => void;
  onCancel?: () => void;
  needResetPopoverContainer?: boolean;
}

function getRandomName(toolName?: string): string | undefined {
  if (!toolName) {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const num = Math.floor(Math.random() * 90 + 10);
  return `${toolName} mockset${num}`;
}

export const builtinSuccessCallback = (_: unknown) => {
  UIToast.success(I18n.t('created_mockset_please_add_mock_data'));
};

export const MockSetEditModal = ({
  visible,
  zIndex,
  disabled,
  initialInfo,
  onSuccess,
  onCancel,
  needResetPopoverContainer,
}: MockSetEditModalProps) => {
  const formApiRef = useRef<FormApi<EditMockSetInfo>>();

  // Determine whether to create a scene based on whether to pass in the id
  const isCreate = !initialInfo.id;

  // Space information
  const spaceType = useSpaceStore(s => s.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const handleSubmit = async (formValues: EditMockSetInfo) => {
    const { id: existingId, name, desc, bindSubjectInfo, bizCtx } = formValues;
    const { toolID, spaceID } = getPluginInfo(bizCtx, bindSubjectInfo);
    const basicParams: ParamsTypeDefine[EVENT_NAMES.create_mockset_front] = {
      environment: getEnvironment(),
      workspace_id: spaceID || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: toolID || '',
      status: 1,
      mock_set_id: '',
      auto_gen_mode: PluginMockDataGenerateMode.MANUAL,
      mock_counts: 1,
    };
    try {
      const { id } = await debuggerApi.SaveMockSet(
        {
          name,
          description: desc,
          // @ts-expect-error - skip
          mockSubject: getMockSubjectInfo(bizCtx, bindSubjectInfo),
          bizCtx,
          id: existingId || '0',
        },
        { __disableErrorToast: true },
      );
      onSuccess?.({ id, name, description: desc });
      sendTeaEvent(EVENT_NAMES.create_mockset_front, {
        ...basicParams,
        status: 0,
        mock_set_id: String(id) || '',
      });
    } catch (e) {
      // @ts-expect-error -- linter-disable-autofix
      const { msg, code } = e;
      const reportParams: ParamsTypeDefine[EVENT_NAMES.create_mockset_front] = {
        ...basicParams,
        status: 1,
        // @ts-expect-error -- linter-disable-autofix
        error: e?.msg as string,
        error_type: 'unknown',
      };
      if (Number(code) === MOCK_SET_ERR_CODE.REPEAT_NAME) {
        formApiRef.current?.setError('name', I18n.t('name_already_taken'));
        sendTeaEvent(EVENT_NAMES.create_mockset_front, {
          ...reportParams,
          error_type: 'repeat_name',
        });
      } else {
        UIToast.error({
          content: withSlardarIdButton(msg),
        });
        sendTeaEvent(EVENT_NAMES.create_mockset_front, {
          ...reportParams,
          error_type: 'unknown',
        });
      }
    }
  };

  const handleOk = async () => {
    await formApiRef.current?.submitForm();
  };

  return (
    <UIModal
      type="action-small"
      zIndex={zIndex}
      title={`${isCreate ? I18n.t('create_mockset') : I18n.t('edit_mockset')}`}
      visible={visible}
      getPopupContainer={
        needResetPopoverContainer ? () => document.body : undefined
      }
      onCancel={onCancel}
      okButtonProps={{
        onClick: handleOk,
        disabled,
      }}
    >
      <Form<EditMockSetInfo>
        getFormApi={api => (formApiRef.current = api)}
        showValidateIcon={false}
        initValues={
          isCreate
            ? { ...initialInfo, name: getRandomName(initialInfo.name) }
            : initialInfo
        }
        onSubmit={values => handleSubmit(values)}
        className={styles['mockset-create-form']}
      >
        {({ formState }) => (
          <>
            {/* mockSet name */}
            {disabled ? (
              <Form.Slot
                label={{
                  text: I18n.t('mockset_name'),
                  required: true,
                }}
              >
                <div>{initialInfo?.name}</div>
              </Form.Slot>
            ) : (
              <UIFormTextArea
                field="name"
                label={I18n.t('mockset_name')}
                placeholder={I18n.t('good_mockset_name_descriptive_concise')}
                trigger={['blur', 'change']}
                maxCount={50}
                maxLength={50}
                rows={1}
                onBlur={() => {
                  formApiRef.current?.setValue(
                    'name',
                    formApiRef.current?.getValue('name')?.trim(),
                  );
                }}
                rules={mockSetInfoRules.name}
              />
            )}
            {/* mockSet description */}
            {disabled ? (
              <Form.Slot
                label={{
                  text: I18n.t('mockset_description'),
                }}
              >
                <div>{initialInfo?.desc}</div>
              </Form.Slot>
            ) : (
              <UIFormTextArea
                field="desc"
                label={{
                  text: I18n.t('mockset_description'),
                }}
                trigger={['blur', 'change']}
                placeholder={I18n.t('describe_use_scenarios_of_mockset')}
                rows={2}
                maxCount={2000}
                maxLength={2000}
                rules={mockSetInfoRules.desc}
                onBlur={() => {
                  formApiRef.current?.setValue(
                    'desc',
                    formApiRef.current?.getValue('desc')?.trim(),
                  );
                }}
              />
            )}
          </>
        )}
      </Form>
    </UIModal>
  );
};
