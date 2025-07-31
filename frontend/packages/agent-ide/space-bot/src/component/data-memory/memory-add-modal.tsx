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
/* eslint-disable max-lines-per-function */
import { type ComponentProps, useState, useRef, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';
import { uniqBy } from 'lodash-es';
import classNames from 'classnames';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  useBotDetailIsReadonly,
  type VariableItem,
  uniqMemoryList,
  VariableKeyErrType,
} from '@coze-studio/bot-detail-store';
import { useBotInfoAuditor } from '@coze-studio/bot-audit-adapter';
import { BotE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan, IconCozPlus } from '@coze-arch/coze-design/icons';
import {
  IconButton,
  Modal,
  Input,
  Typography,
  Tooltip,
  Space,
  Form,
  Checkbox,
  Switch,
  Button,
} from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { AddButton } from '../add-button';
import { MemoryTemplateModal } from './memory-template-modal';
import { useSystemVariables } from './hooks';
import { SysParamHeader, UserParamHeader } from './components/parma-header';
import { VariableGroupWrapper } from './components/group-wrapper';
import { GroupTable } from './components/group-table';

import s from './index.module.less';

const DEFAULT_VARIABLE_LENGTH = 10;
const ACTIVE_ID_TIMER_INTERVAL = 1000;
const INPUT_TIMER_INTERVAL = 100;

export type MemoryAddModalProps = ComponentProps<typeof Modal> & {
  activeId?: string;
  onOk?: () => void;
  onCancel?: () => void;
};

export const MemoryAddModal: React.FC<MemoryAddModalProps> = props => {
  const isReadonly = useBotDetailIsReadonly();
  const botInfoAuditor = useBotInfoAuditor();
  const { variables: variablesInStore, setBotSkillByImmer } = useBotSkillStore(
    useShallow(state => ({
      variables: state.variables,
      setBotSkillByImmer: state.setBotSkillByImmer,
    })),
  );
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );

  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [highLight, setHighLight] = useState(false);

  const [timer, setTimer] = useState<undefined | NodeJS.Timeout>();

  const inputingRef = useRef<HTMLInputElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [addButtonFix, setAddButtonFix] = useState(false);

  const { sysConfigList, sysVariables, enableVariables, loading } =
    useSystemVariables(variables, !!props.visible);

  const onBlur = () => {
    setVariables(uniqMemoryList(variables, sysVariables));
  };

  useEffect(() => {
    if (props.visible) {
      setVariables(
        uniqMemoryList(
          variablesInStore?.filter(varItem => !varItem.is_system),
          sysVariables,
        ),
      );
      if (!variablesInStore.length) {
        handleInputedClick('init');
      }
      if (props.activeId) {
        clearTimeout(timer);
        setHighLight(true);
        setTimer(
          setTimeout(() => {
            setHighLight(false);
          }, ACTIVE_ID_TIMER_INTERVAL),
        );
      }
    }
  }, [props.activeId, props.visible]);

  useEffect(() => {
    // Controls the highlighted elements to roll into the viewport
    if (highLight) {
      document.getElementsByClassName('active-row')?.[0]?.scrollIntoView();
    }
  }, [highLight]);

  useEffect(() => {
    if (tbodyRef.current) {
      const tbodyScrollHeight = tbodyRef.current.scrollHeight;
      const tbodyClientHeight = tbodyRef.current.clientHeight;
      setAddButtonFix(tbodyScrollHeight > tbodyClientHeight);
    }
  }, [tbodyRef.current, variables.length]);

  const handleInputedClick = (type?: 'init') => {
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      bot_id: botId,
      resource_type: 'variable',
      action: 'add',
      source: 'bot_detail_page',
      source_detail: 'memory_manage',
    });

    setVariables([
      ...(type === 'init' ? [] : variables),
      {
        id: nanoid(),
        key: '',
        description: '',
        default_value: '',
        prompt_disabled: false,
      },
    ]);
    setTimeout(() => {
      inputingRef?.current?.focus();
    }, INPUT_TIMER_INTERVAL);
  };

  const mutateItemByKey = (
    key: string,
    value: string | boolean | undefined,
    index: number,
  ) => {
    const tempArr = [...variables];
    tempArr[index] = { ...tempArr[index], [key]: value };
    setVariables(uniqMemoryList([...tempArr], sysVariables));
    botInfoAuditor.reset();
  };

  const onCancel = () => {
    botInfoAuditor.reset();
    props?.onCancel?.();
  };

  const configList = variables.map((item: VariableItem, index: number) => {
    const sendTeaEventEdit = () => {
      sendTeaEvent(EVENT_NAMES.memory_click_front, {
        bot_id: botId,
        resource_id: item.id,
        resource_name: item.key,
        resource_type: 'variable',
        action: 'edit',
        source: 'bot_detail_page',
        source_detail: 'memory_manage',
      });
    };

    return {
      id: item.key,
      key: !isReadonly ? (
        <div
          className={classNames(s['memory-key'], {
            [s['memory-key-err']]: item.errType,
          })}
        >
          <Input
            data-testid={`${BotE2e.BotVariableAddModalNameInput}.${item.key}`}
            data-dtestid={`${BotE2e.BotVariableAddModalNameInput}.${item.key}`}
            disabled={isReadonly}
            placeholder={I18n.t('variable_name_placeholder')}
            className="flex-1"
            value={item.key}
            ref={inputingRef}
            onChange={v => {
              mutateItemByKey('key', v, index);
            }}
            autoFocus={!item.key}
            maxLength={50}
            onBlur={() => {
              sendTeaEventEdit();
              onBlur();
            }}
          />
          {item.errType === VariableKeyErrType.KEY_NAME_USED && (
            <span className={s['key-error-tip']}>
              {I18n.t('bot_edit_variable_field_occupied_error')}
            </span>
          )}
          {item.errType === VariableKeyErrType.KEY_IS_NULL && (
            <span className={s['key-error-tip']}>
              {I18n.t('bot_edit_variable_field_required_error')}
            </span>
          )}
        </div>
      ) : (
        <Typography.Text
          data-testid={`${BotE2e.BotVariableAddModalNameInput}.${item.key}`}
          className={classNames(
            s['memory-key-readonly'],
            !item.key && s['readonly-none'],
            'flex-1',
          )}
          ellipsis={{ showTooltip: true }}
        >
          {item.key || I18n.t('bot_element_unset')}
        </Typography.Text>
      ),
      description: !isReadonly ? (
        <Input
          data-testid={`${BotE2e.BotVariableAddModalDescInput}.${item.key}`}
          disabled={isReadonly}
          className={classNames(s['memory-description'], 'flex-1')}
          placeholder={I18n.t('bot_edit_variable_description_placeholder')}
          value={item.description}
          onChange={v => {
            mutateItemByKey('description', v, index);
          }}
          maxLength={200}
          onBlur={() => {
            sendTeaEventEdit();
            onBlur();
          }}
        />
      ) : (
        <Typography.Text
          data-testid={`${BotE2e.BotVariableAddModalDescInput}.${item.key}`}
          className={classNames(
            s['memory-description-readonly'],
            !item.description && s['readonly-none'],
            'flex-1',
          )}
          ellipsis={{ showTooltip: true }}
        >
          {item.description || I18n.t('bot_element_unset')}
        </Typography.Text>
      ),
      default_value: !isReadonly ? (
        <Input
          data-testid={`${BotE2e.BotVariableAddModalDefaultValueInput}.${item.key}`}
          disabled={isReadonly}
          className={classNames(
            s['memory-description'],
            'w-[164px] basis-[164px] flex-none',
          )}
          placeholder={I18n.t('bot_edit_variable_default_value_placeholder')}
          value={item.default_value}
          onChange={v => {
            mutateItemByKey('default_value', v, index);
          }}
          maxLength={1000}
          onBlur={() => {
            sendTeaEventEdit();
            onBlur();
          }}
        />
      ) : (
        <Typography.Text
          data-testid={`${BotE2e.BotVariableAddModalDefaultValueInput}.${item.key}`}
          className={classNames(
            s['memory-description-readonly'],
            !item.default_value && s['readonly-none'],
            'w-[164px] basis-[164px] flex-none',
          )}
          ellipsis={{ showTooltip: true }}
        >
          {item.default_value || I18n.t('bot_element_unset')}
        </Typography.Text>
      ),
      method: (
        <Space className={s['memory-method']} spacing={14}>
          <Tooltip content={I18n.t('variable_240520_03')} theme="dark">
            <div className={s['memory-method-checkbox']}>
              <Checkbox
                checked={item?.prompt_disabled ? false : true}
                onChange={v => {
                  mutateItemByKey('prompt_disabled', !v.target.checked, index);
                }}
              ></Checkbox>
            </div>
          </Tooltip>
          <Switch
            data-testid={`${BotE2e.BotVariableAddModalSwitch}.${item.key}`}
            size="small"
            checked={!item?.is_disabled}
            onChange={checked => {
              mutateItemByKey('is_disabled', !checked, index);
            }}
          />
          <Tooltip content={I18n.t('bot_datamemory_remove_field')} theme="dark">
            <IconButton
              data-dtestid={`${BotE2e.BotVariableAddModalDelBtn}.${item.key}`}
              icon={<IconCozTrashCan />}
              color="secondary"
              onClick={() => {
                if (isReadonly) {
                  return;
                }
                sendTeaEvent(EVENT_NAMES.memory_click_front, {
                  bot_id: botId,
                  resource_id: item.id,
                  resource_name: item.key,
                  resource_type: 'variable',
                  action: 'delete',
                  source: 'bot_detail_page',
                  source_detail: 'memory_manage',
                });
                variables.splice(index, 1);
                onBlur();
              }}
            />
          </Tooltip>
        </Space>
      ),
    };
  });

  return (
    <Modal
      {...props}
      centered
      onCancel={onCancel}
      footer={
        <>
          {enableVariables.length < DEFAULT_VARIABLE_LENGTH && addButtonFix ? (
            <div className={s['add-button-row-fix']}>
              <AddButton
                className={s['add-button']}
                type="tertiary"
                onClick={() => handleInputedClick()}
                icon={<IconCozPlus />}
              >
                {I18n.t('bot_userProfile_add')}
              </AddButton>
            </div>
          ) : null}
          <div className={s['template-footer']}>
            <Button
              data-testid={BotE2e.BotVariableAddModalCancelBtn}
              color="primary"
              onClick={onCancel}
            >
              {I18n.t('edit_variables_modal_cancel_text')}
            </Button>
            <Button
              data-testid={BotE2e.BotVariableAddModalSaveBtn}
              disabled={variables.some(
                item =>
                  item.errType === VariableKeyErrType.KEY_NAME_USED ||
                  item.errType === VariableKeyErrType.KEY_IS_NULL,
              )}
              onClick={async () => {
                const checkPass = await botInfoAuditor.check({
                  variable_list: variables.map(i => ({
                    key: i.key,
                    description: i.description,
                    default_value: i.default_value,
                  })),
                });
                if (checkPass.check_not_pass) {
                  return;
                }
                setBotSkillByImmer(botSkill => {
                  botSkill.variables = [...enableVariables];
                });
                props?.onOk?.();
              }}
            >
              {I18n.t('edit_variables_modal_ok_text')}
            </Button>
          </div>
        </>
      }
      width={800}
      title={I18n.t('edit_variables_modal_title')}
      className={classNames(s['memory-add-modal'], props.className)}
    >
      <div
        className={classNames(
          s['modal-add-container'],
          !variables.length && s.center,
          'gap-y-2',
        )}
      >
        {/* user variable */}
        <VariableGroupWrapper
          variableGroup={{
            key: I18n.t('variable_user_name'),
            description: I18n.t('variable_user_description'),
          }}
        >
          <GroupTable
            isReadonly={isReadonly}
            loading={loading}
            highLight={highLight}
            activeId={props.activeId}
            variablesConfig={configList}
            handleInputedClick={handleInputedClick}
            header={<UserParamHeader isReadonly={isReadonly} />}
          />
        </VariableGroupWrapper>
        {/* system variable */}
        <VariableGroupWrapper
          variableGroup={{
            key: I18n.t('variable_system_name'),
            description: I18n.t('variable_system_describtion'),
          }}
        >
          <GroupTable
            isReadonly={isReadonly}
            loading={loading}
            highLight={highLight}
            activeId={props.activeId}
            subGroupConfig={sysConfigList.filter(item => item.var_info_list)}
            variablesConfig={sysConfigList.filter(item => !item.var_info_list)}
            handleInputedClick={handleInputedClick}
            header={<SysParamHeader isReadonly={isReadonly} />}
            hideAddButton={true}
          />
        </VariableGroupWrapper>
        {!botInfoAuditor.pass && (
          <Form.ErrorMessage
            error={I18n.t('variable_edit_not_pass')}
          ></Form.ErrorMessage>
        )}
        <MemoryTemplateModal
          visible={visible}
          needSecondConfirm={!!variables.length}
          showType="variableList"
          addTemplate={(arr: VariableItem[]) => {
            const result = [
              // Override history variables when using templates
              // ...variables,
              ...arr.map(q => ({
                id: nanoid(),
                ...q,
                key: q.key,
                description: q.description,
                default_value: q.default_value,
              })),
            ];
            setVariables(uniqBy(result, 'key').filter(i => i.key));
            setVisible(false);
          }}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={() => {
            setVisible(false);
          }}
        />
      </div>
    </Modal>
  );
};
