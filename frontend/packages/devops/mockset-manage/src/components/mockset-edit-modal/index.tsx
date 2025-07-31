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

/* eslint-disable @coze-arch/max-line-per-function -- migrating code */
import { useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { PluginMockDataGenerateMode } from '@coze-arch/bot-tea';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Form, UIFormTextArea, UIModal, UIToast } from '@coze-arch/bot-semi';
import { type ApiError, isApiError } from '@coze-arch/bot-http';
import { useFlags } from '@coze-arch/bot-flags';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { type MockSet } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import {
  type AutoGenerateConfig,
  AutoGenerateSelect,
} from '../auto-generate-select';
import { getEnvironment, getMockSubjectInfo, getPluginInfo } from '../../utils';
import { type BasicMockSetInfo } from '../../interface';
import { MOCK_SET_ERR_CODE, mockSetInfoRules } from '../../const';

import styles from './index.module.less';

export interface EditMockSetInfo
  extends BasicMockSetInfo,
    Partial<AutoGenerateConfig> {
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
    autoGenerateConfig?: AutoGenerateConfig,
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

  const [FLAGS] = useFlags();

  // Determine whether to create a scene based on whether to pass in the id
  const isCreate = !initialInfo.id;

  // Space information
  const spaceType = useSpaceStore(s => s.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const handleAutoGenerateSelect = (config: AutoGenerateConfig) => {
    formApiRef.current?.setValue?.('generateMode', String(config.generateMode));
    formApiRef.current?.setValue?.(
      'generateCount',
      String(config.generateCount),
    );
  };

  const handleSubmit = async (formValues: EditMockSetInfo) => {
    const {
      id: existingId,
      name,
      desc,
      bindSubjectInfo,
      bizCtx,
      autoGenerate,
      generateMode,
      generateCount,
    } = formValues;
    const { toolID, spaceID } = getPluginInfo(bizCtx, bindSubjectInfo);
    const basicParams: ParamsTypeDefine[EVENT_NAMES.create_mockset_front] = {
      environment: getEnvironment(),
      workspace_id: spaceID || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: toolID || '',
      status: 1,
      mock_set_id: '',
      auto_gen_mode: !autoGenerate
        ? PluginMockDataGenerateMode.MANUAL
        : Number(generateMode) || PluginMockDataGenerateMode.RANDOM,
      mock_counts: 1,
    };
    try {
      const { id } = await debuggerApi.SaveMockSet(
        {
          name,
          description: desc,
          mockSubject: getMockSubjectInfo(bizCtx, bindSubjectInfo),
          bizCtx,
          id: existingId || '0',
        },
        { __disableErrorToast: true },
      );
      onSuccess?.(
        { id, name, description: desc },
        autoGenerate
          ? {
              generateMode: Number(generateMode),
              generateCount: Number(generateCount),
            }
          : undefined,
      );
      sendTeaEvent(EVENT_NAMES.create_mockset_front, {
        ...basicParams,
        status: 0,
        mock_set_id: String(id) || '',
      });
    } catch (e) {
      const { message } = (e as Error | undefined) || {};
      const reportParams: ParamsTypeDefine[EVENT_NAMES.create_mockset_front] = {
        ...basicParams,
        status: 1,
        error: message,
        error_type: 'unknown',
      };

      if (isApiError(e)) {
        const { code } = (e as ApiError) || {};

        if (Number(code) === MOCK_SET_ERR_CODE.REPEAT_NAME) {
          formApiRef.current?.setError('name', I18n.t('name_already_taken'));
          sendTeaEvent(EVENT_NAMES.create_mockset_front, {
            ...reportParams,
            error_type: 'repeat_name',
          });
          return;
        }
      }

      if (message) {
        UIToast.error(message);
      }

      sendTeaEvent(EVENT_NAMES.create_mockset_front, {
        ...reportParams,
        error_type: 'unknown',
      });
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
            {/* Phase II supports autoGenerate*/}
            {/* The community edition does not support this function for the time being */}
            {isCreate && FLAGS['bot.devops.mockset_auto_generate'] ? (
              <>
                <Form.Checkbox
                  field="autoGenerate"
                  noLabel
                  disabled={disabled}
                  className={styles['auto-generate-checkbox']}
                >
                  {I18n.t('auto_generate')}
                </Form.Checkbox>
                {formState.values.autoGenerate ? (
                  <AutoGenerateSelect
                    onInit={handleAutoGenerateSelect}
                    onChange={handleAutoGenerateSelect}
                  />
                ) : null}
              </>
            ) : null}
          </>
        )}
      </Form>
    </UIModal>
  );
};
