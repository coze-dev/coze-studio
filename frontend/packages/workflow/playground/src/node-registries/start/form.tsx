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

import { TriggerForm } from '@coze-workflow/nodes';
import { FILE_TYPES, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Switch } from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useGlobalState } from '@/hooks';
import { Section, useWatch } from '@/form';
import { TriggerTestRunButton } from '@/components/test-run/test-run-button';

import { FixedInputParameter } from '../trigger-upsert/components/fixed-input-parameter-field';
import { OutputsField, RadioSetterField, SwitchField } from '../common/fields';
import {
  CronJobSelect,
  DynamicForm,
  Notify,
  Timezone,
} from '../common/components';
import { useTrigger } from './hooks/use-trigger';

export const FormRender = withNodeConfigForm(() => {
  const { isBindDouyin, isChatflow, projectId } = useGlobalState();
  const [FLAGS] = useFlags();

  let hiddenTypes = isBindDouyin ? FILE_TYPES : [];

  if (IS_OPEN_SOURCE) {
    hiddenTypes = [ViewVariableType.Voice, ViewVariableType.ArrayVoice];
  }

  const tabName = useWatch<string>('trigger.tab');

  const {
    triggerIsOpen,
    setTriggerIsOpen,
    triggerId,
    dynamicFormMeta,
    outputs,
    onDynamicFormChange,
  } = useTrigger();

  return (
    <>
      {tabName === TriggerForm.Tab.Trigger && triggerIsOpen ? (
        <Notify
          isBreakLine
          className="!border-b-0 !m-0 !mt-2.5 rounded-lg"
          text={I18n.t(
            'workflow_user_trigger_banner',
            {},
            '设置以后需要发布到对应渠道才能定时生效',
          )}
        />
      ) : null}

      {/* will support soon */}
      {(projectId || IS_BOT_OP) && !IS_OPEN_SOURCE ? (
        <RadioSetterField
          name={'trigger.tab'}
          defaultValue={TriggerForm.Tab.Basic}
          options={{
            key: TriggerForm.TabName,
            mode: 'button',
            direction: 'horizontal',
            options: [
              {
                label: I18n.t('worklfow_start_basic_setting', {}, '基础设置'),
                value: TriggerForm.Tab.Basic,
              },
              {
                label: I18n.t(
                  'workflow_start_trigger_setting',
                  {},
                  '触发器设置',
                ),
                value: TriggerForm.Tab.Trigger,
              },
            ],
            ignoreReadonly: true,
          }}
        />
      ) : null}
      {(tabName ?? TriggerForm.Tab.Basic) === TriggerForm.Tab.Basic ? (
        <>
          <OutputsField
            id="start-node-output"
            name="outputs"
            title={I18n.t('workflow_detail_node_parameter_input')}
            tooltip={I18n.t('workflow_detail_start_input_tooltip')}
            addItemTitle={I18n.t('workflow_add_input')}
            withDescription
            withRequired
            allowDeleteLast
            emptyPlaceholder={I18n.t('workflow_start_no_parameter')}
            hiddenTypes={hiddenTypes}
            defaultCollapse={false}
            needAppendChildWhenNodeIsPreset={undefined}
            withDefaultValue
            columnsRatio="4:3"
            hasFeedback={false}
          />

          {/* Support soon, so stay tuned. */}
          {isChatflow && FLAGS['bot.automation.message_auto_write'] ? (
            <Section title={I18n.t('basic_setting')} tooltip="">
              <SwitchField
                customLabel={I18n.t('workflow_250407_001', {}, '消息自动写入')}
                customTooltip={I18n.t('workflow_250407_002')}
                name="inputs.auto_save_history"
                customStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto 1fr',
                }}
                labelStyles={{
                  fontSize: '12px',
                  fontWeight: 'normal',
                }}
                switchCustomStyles={{
                  justifySelf: 'end',
                }}
              />
            </Section>
          ) : null}
        </>
      ) : null}
      {tabName === TriggerForm.Tab.Trigger ? (
        <>
          <>
            <Section
              title={I18n.t('workflow_start_trigger_setting', {}, '触发器设置')}
              tooltip={I18n.t(
                'workflow_start_trigger_setting_tooltips',
                {},
                '选择工作流的启动方式，可以通过预设时间或自定义时间来触发工作流的启动',
              )}
              actions={[
                triggerIsOpen ? (
                  <TriggerTestRunButton triggerId={triggerId} />
                ) : (
                  false
                ),
                <Switch
                  checked={triggerIsOpen}
                  onChange={setTriggerIsOpen}
                  size="mini"
                />,
              ].filter(Boolean)}
            >
              {triggerIsOpen ? (
                <div className="flex flex-col gap-[8px]">
                  <DynamicForm
                    name={'trigger.dynamicInputs'}
                    formMeta={dynamicFormMeta}
                    components={{
                      Timezone,
                      CronJobSelect,
                    }}
                    onChange={onDynamicFormChange}
                  />
                </div>
              ) : null}
            </Section>
            {triggerIsOpen ? (
              <Section title={I18n.t('parameters', {}, '输入')} actions={[]}>
                <div className="flex flex-col gap-[8px]">
                  <FixedInputParameter
                    name={'trigger.parameters'}
                    layout="horizontal"
                    refDisabled
                    fieldConfig={outputs
                      ?.filter(d => d.type)
                      ?.map(d => ({
                        label: d?.name,
                        description: d?.description ?? '',
                        name: TriggerForm.getVariableName(d),
                        required: !!d?.required,
                        type: d.type,
                      }))}
                    onChange={onDynamicFormChange}
                    inputPlaceholder={I18n.t(
                      'workflow_trigger_creat_name_placeholder',
                    )}
                  />
                </div>
              </Section>
            ) : null}
          </>
        </>
      ) : null}
    </>
  );
});
