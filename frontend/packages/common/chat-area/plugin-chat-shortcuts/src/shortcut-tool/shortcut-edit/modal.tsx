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
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { Form, UIModal, type UIModalProps } from '@coze-arch/bot-semi';
import { PluginStatus } from '@coze-arch/bot-api/plugin_develop';
import { ToolType, BotMode } from '@coze-arch/bot-api/playground_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { type ShortcutEditFormValues, type SkillsModalProps } from '../types';
import {
  validateCmdString,
  validateCommandNameRepeat,
} from '../../utils/tool-params';
import { ShortcutTemplate } from '../../shortcut-template';
import { SwitchAgent } from './switch-agent';
import { getInitialValues, getSubmitValue } from './method';
import { FieldLabel } from './components/field-label';
import { FormInputWithMaxCount } from './components';
import { ButtonName } from './button-name';
import {
  ActionSwitchArea,
  type IActionSwitchAreaRef,
} from './action-switch-area';

import style from './index.module.less';

export interface ShortcutEditModalProps
  extends Omit<UIModalProps, 'onOk' | 'onCancel'> {
  errorMessage: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  shortcut?: ShortCutCommand;
  skillModal: FC<SkillsModalProps>;
  onAdd?: (shortcuts: ShortCutCommand, onFail: () => void) => void;
  onEdit?: (shortcuts: ShortCutCommand, onFail: () => void) => void;
  botMode: BotMode;
  onClose: () => void;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const ShortcutEditModal: FC<ShortcutEditModalProps> = props => {
  const {
    errorMessage,
    setErrorMessage,
    shortcut,
    onAdd,
    onEdit,
    skillModal: SkillModal,
    onClose,
    botMode,
  } = props;
  const { botId, spaceId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      spaceId: state.space_id,
    })),
  );
  const { agents } = useMultiAgentStore(
    useShallow(state => ({
      agents: state.agents,
    })),
  );
  const { existedShortcuts } = useBotSkillStore(
    useShallow(state => ({
      existedShortcuts: state.shortcut.shortcut_list,
    })),
  );

  const formRef = useRef<Form>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const actionSwitchAreaRef = useRef<IActionSwitchAreaRef>(null);
  const { TextArea } = Form;
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [editedShortcut, setEditedShortcut] = useState<ShortcutEditFormValues>(
    getInitialValues(shortcut),
  );

  // Use Skills & Unselected Tools = > Forbid Submissions
  const disableSubmit =
    editedShortcut?.use_tool && !editedShortcut?.tool_info?.tool_name;

  const showPanel = !!editedShortcut?.components_list?.filter(
    comp => !comp.hide,
  ).length;

  const mode = shortcut ? 'edit' : 'create';

  const onConfirm = async () => {
    setConfirmLoading(true);
    if (!(await checkFormValid())) {
      setConfirmLoading(false);
      return;
    }
    const values = formRef.current?.formApi.getValues();
    const formattedValues = getSubmitValue(values);
    console.log('onConfirm', formattedValues);

    if (mode === 'create') {
      // TODO: hzf add type should have no command_id
      onAdd?.(formattedValues, () => {
        setConfirmLoading(false);
      });
      return;
    }

    if (mode === 'edit') {
      onEdit?.(formattedValues, () => {
        setConfirmLoading(false);
      });
    }
  };

  const checkFormValid = async () => {
    try {
      await formRef.current?.formApi.validate();

      return actionSwitchAreaRef.current?.validate();
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- normal form validation does not require processing e
    } catch (e) {
      return false;
    }
  };

  const onFormValueChange = (values?: ShortcutEditFormValues) => {
    setErrorMessage('');
    if (!values) {
      return;
    }
    setEditedShortcut({ ...values });
  };

  useEffect(() => {
    formRef.current?.formApi.setValue('object_id', botId);
  }, []);

  const { data: pluginData } = useRequest(
    async () => {
      // convenient type inference
      if (shortcut?.plugin_id && spaceId) {
        const res = await PluginDevelopApi.GetPlaygroundPluginList({
          page: 1,
          size: 1,
          plugin_ids: [shortcut.plugin_id],
          space_id: spaceId,
          is_get_offline: true,
        });
        return res.data?.plugin_list?.[0];
      }
    },
    {
      ready: !!(shortcut?.plugin_id && spaceId),
    },
  );

  const isBanned =
    shortcut?.tool_type === ToolType.ToolTypePlugin &&
    shortcut?.plugin_id === pluginData?.id &&
    pluginData?.status === PluginStatus.BANNED;

  return (
    <>
      <UIModal
        {...props}
        visible
        footer={null}
        onCancel={onClose}
        className={style['shortcut-edit-modal']}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 0,
        }}
        width={showPanel ? 1120 : 670}
        title={
          mode === 'create'
            ? I18n.t('shortcut_modal_title')
            : I18n.t('shortcut_modal_title_edit_shortcut')
        }
      >
        <div
          className={cls(
            style['edit-modal-wrapper'],
            showPanel && style.wrapperBorder,
          )}
          ref={modalRef}
          contentEditable={false}
        >
          <Form<ShortcutEditFormValues>
            ref={formRef}
            trigger="blur"
            initValues={editedShortcut}
            autoComplete={'off'}
            autoScrollToError
            className={cls(style['edit-form-wrapper'], {
              'pr-6': showPanel,
            })}
            onValueChange={values => onFormValueChange(values)}
          >
            <div className={style['form-item']}>
              <FieldLabel required>
                {I18n.t('shortcut_modal_button_name')}
              </FieldLabel>
              <ButtonName editedShortcut={editedShortcut} />
            </div>
            <div className={style['form-item']}>
              <FieldLabel
                tip={I18n.t('shortcut_modal_shortcut_name_input_placeholder')}
                required
              >
                {I18n.t('shortcut_modal_shortcut_name')}
              </FieldLabel>
              <FormInputWithMaxCount
                required
                noLabel
                prefix="/"
                maxCount={20}
                maxLength={20}
                field="shortcut_command"
                placeholder={I18n.t(
                  'shortcut_modal_shortcut_name_input_placeholder',
                )}
                rules={[
                  {
                    required: true,
                    message: I18n.t('shortcut_modal_shortcut_name_is_required'),
                  },
                  {
                    validator: (rule, value) => validateCmdString(value),
                    message: I18n.t(
                      'shortcut_modal_use_at_least_one_letter_error',
                    ),
                  },
                  {
                    validator: (rule, value) =>
                      validateCommandNameRepeat(
                        {
                          ...editedShortcut,
                          shortcut_command: `/${value}`,
                        },
                        existedShortcuts ?? [],
                      ),
                    message: I18n.t(
                      'shortcut_modal_shortcut_name_conflict_error',
                    ),
                  },
                ]}
              />
            </div>
            <div className={style['form-item']}>
              <FieldLabel>
                {I18n.t('shortcut_modal_shortcut_description')}
              </FieldLabel>
              <TextArea
                maxCount={100}
                maxLength={100}
                rows={3}
                placeholder={I18n.t(
                  'shortcut_modal_shortcut_description_input_placeholder',
                )}
                field="description"
                noLabel
              />
            </div>
            <ActionSwitchArea
              ref={actionSwitchAreaRef}
              editedShortcut={editedShortcut}
              skillModal={SkillModal}
              formRef={formRef}
              modalRef={modalRef}
              isBanned={isBanned}
            />
            {botMode === BotMode.MultiMode && (
              <SwitchAgent
                editedShortcut={editedShortcut}
                showPanel={showPanel}
                agents={agents}
                formRef={formRef}
              />
            )}
          </Form>
          {showPanel && editedShortcut ? (
            <div className={style['preview-component']}>
              <div className={style['shortcut-panel']}>
                <ShortcutTemplate
                  visible={true}
                  shortcut={editedShortcut}
                  readonly
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex gap-2 justify-end">
          <Form.ErrorMessage
            className="flex-1 text-left mt-0"
            error={errorMessage || ''}
          />
          <Button
            onClick={onClose}
            color="highlight"
            className="!coz-mg-hglt !coz-fg-hglt"
          >
            {I18n.t('Cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={disableSubmit}
          >
            {I18n.t('Confirm')}
          </Button>
        </div>
      </UIModal>
    </>
  );
};
