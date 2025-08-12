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

import { type MutableRefObject, useMemo, useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classnames from 'classnames';
import { useMemoizedFn, useSize } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import {
  Radio,
  RadioGroup,
  Spin,
  Switch,
  Table,
  Tooltip,
  Typography,
} from '@coze-arch/bot-semi';
import {
  ParameterType,
  type APIParameter,
} from '@coze-arch/bot-api/plugin_develop';
import { MemoryApi } from '@coze-arch/bot-api';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { IconInfo } from '@coze-arch/bot-icons';
import {
  useParametersInSettingModalController,
  type SettingParamsProps,
} from '@coze-agent-ide/bot-plugin-tools/useParametersInSettingModalController';
import {
  ROWKEY,
  childrenRecordName,
} from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { DefaultValueInput } from '@coze-agent-ide/bot-plugin-tools/defaultValueInput';
import { Button, Toast } from '@coze-arch/coze-design';

import s from './index.module.less';

const GAP = 250;

/* eslint-disable @coze-arch/max-line-per-function */
// eslint-disable-next-line max-lines-per-function
const PartParams = (
  props: SettingParamsProps & { contentRef: MutableRefObject<HTMLDivElement> },
) => {
  const {
    doUpdateNodeWithData,
    getColumnClass,
    doUpdateParams,
    loaded,
    doSetActive,
    activeTab,
    responseParams,
    requestParams,
    doSetReqParams,
    isUpdateLoading,
  } = useParametersInSettingModalController(props);

  const size = useSize(props.contentRef);

  // Variable case value list
  const [variableOption, setVariableOption] = useState<OptionProps[]>([]);

  const { variables } = useBotSkillStore(
    useShallow(state => ({
      variables: state.variables,
    })),
  );

  useEffect(() => {
    getReferenceList();
  }, []);

  const getReferenceList = async () => {
    const res = await MemoryApi.GetSysVariableConf();
    const varList = variables?.map(item => {
      const example = res.conf?.find(conf => conf.key === item.key);
      return {
        label: item.key, // variable name
        value: example?.example ?? item.default_value ?? '', // Case value, no default value
      };
    });
    setVariableOption(varList);
  };

  const columns = useMemo(() => {
    const res: ColumnProps[] = [
      {
        title: I18n.t('Create_newtool_s4_name'),
        key: 'name',
        className: 'no-wrap',
        render: (record: APIParameter & { deep?: number }) => (
          <div
            className={classnames(getColumnClass(record), s.nameWrap)}
            style={{
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- ui
              maxWidth: `calc(100% - ${20 * (record.deep || 1) + 9}px)`,
            }}
          >
            <Typography.Text
              className={s.name}
              component="span"
              ellipsis={{
                showTooltip: {
                  opts: { style: { wordBreak: 'break-word' } },
                },
              }}
            >
              {record?.name}
            </Typography.Text>
            <br />
            {!!record?.desc && (
              <Typography.Text
                className={s.desc}
                component="span"
                ellipsis={{
                  showTooltip: {
                    opts: { style: { wordBreak: 'break-word' } },
                  },
                }}
              >
                {record?.desc}
              </Typography.Text>
            )}
          </div>
        ),
      },
      {
        title: I18n.t('Create_newtool_s4_type'),
        key: 'type',
        className: 'no-wrap',
        width: 120,
        render: (record: APIParameter) =>
          record?.type && (
            <span className={getColumnClass(record)}>
              {ParameterType[record?.type]}
            </span>
          ),
      },
      {
        title: I18n.t('bot_edit_page_plugin_tool_param_required'),
        key: 'default',
        className: 'no-wrap',
        width: 104,
        render: (record: APIParameter) => (
          <span className={getColumnClass(record)}>
            {record?.is_required
              ? I18n.t('bot_edit_page_plugin_tool_param_required')
              : I18n.t('bot_edit_page_plugin_tool_param_not_required')}
          </span>
        ),
      },
    ];
    if (activeTab === 0) {
      res.push(
        ...[
          {
            title: I18n.t(
              'plugin_edit_tool_default_value_config_item_default_value',
            ),
            key: 'local_default',
            className: 'no-wrap',
            width: 240,
            render: (record: APIParameter) => {
              if (record.local_default === undefined) {
                return <span className={getColumnClass(record)} />;
              }
              return (
                <span className={getColumnClass(record)}>
                  <DefaultValueInput
                    record={record}
                    data={requestParams}
                    defaultKey="local_default"
                    disableKey="local_disable"
                    canReference={true}
                    referenceOption={variableOption}
                    setData={newData => {
                      doSetReqParams(newData);
                    }}
                  />
                </span>
              );
            },
          },
          {
            title: () => (
              <div>
                {I18n.t('plugin_edit_tool_default_value_config_item_enable')}
                <Tooltip
                  content={I18n.t(
                    'plugin_bot_ide_plugin_setting_modal_item_enable_tip',
                  )}
                >
                  <IconInfo
                    style={{
                      color: '#5f5f5f9e',
                      position: 'relative',
                      top: 3,
                      left: 2,
                    }}
                  />
                </Tooltip>
              </div>
            ),
            key: 'local_disable',
            width: 70,
            className: 'no-wrap',
            render: (record: APIParameter) => {
              if (record.local_default === undefined) {
                return <span className={getColumnClass(record)} />;
              }
              const switchNode = (
                <Switch
                  style={{ position: 'relative', top: 3, left: 12 }}
                  defaultChecked={!record.local_disable}
                  disabled={
                    record.is_required &&
                    !record.local_default &&
                    !record.variable_ref
                  }
                  onChange={e => {
                    doUpdateNodeWithData({
                      record,
                      key: 'local_disable',
                      value: !e,
                    });
                  }}
                />
              );
              return (
                <span className={getColumnClass(record)}>
                  {record.is_required && !record.local_default ? (
                    <Tooltip
                      content={I18n.t(
                        'plugin_edit_tool_default_value_config_item_enable_disable_tip',
                      )}
                    >
                      {switchNode}
                    </Tooltip>
                  ) : (
                    switchNode
                  )}
                </span>
              );
            },
          },
        ],
      );
    }
    if (activeTab === 1) {
      const targetIndex = res.findIndex(c => c.key === 'default');
      res.splice(targetIndex, 1);
      res.push({
        title: () => (
          <div>
            {I18n.t('plugin_edit_tool_default_value_config_item_enable')}
            <Tooltip content={I18n.t('plugin_bot_ide_output_param_enable_tip')}>
              <IconInfo
                style={{
                  color: '#5f5f5f9e',
                  position: 'relative',
                  top: 3,
                  left: 2,
                }}
              />
            </Tooltip>
          </div>
        ),
        key: 'local_disable',
        width: 70,
        className: 'no-wrap',
        render: (record: APIParameter) => {
          if (record.local_default === undefined) {
            return <span className={getColumnClass(record)} />;
          }
          const switchNode = (
            <Switch
              style={{ position: 'relative', top: 3, left: 12 }}
              defaultChecked={!record.local_disable}
              onChange={e => {
                doUpdateNodeWithData({
                  record,
                  key: 'local_disable',
                  value: !e,
                  isForResponse: true,
                });
              }}
            />
          );
          return <span className={getColumnClass(record)}>{switchNode}</span>;
        },
      });
    }
    return res;
  }, [activeTab, requestParams, doUpdateNodeWithData]);

  const scroll = useMemo(() => ({ y: (size?.height ?? 0) - GAP }), [size]);

  const doSave = useMemoizedFn(async () => {
    try {
      await doUpdateParams();

      Toast.success({ zIndex: 1051, content: I18n.t('Save_success') });
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error, eventName: 'update_bot_default_params_error' });

      Toast.error({
        zIndex: 1051,
        content: withSlardarIdButton(
          I18n.t('card_builder_api_http_delete_error'),
        ),
      });
    }
  });

  return (
    <>
      {loaded ? (
        <div className={classnames(s['params-modal'], 'relative h-full')}>
          <div className="flex justify-center">
            <RadioGroup
              className="flex"
              style={{ alignSelf: 'center', width: 420, height: 32 }}
              type="button"
              buttonSize="middle"
              defaultValue={activeTab}
              onChange={e => {
                doSetActive(e.target.value);
              }}
            >
              <Radio value={0} className="flex-[1]">
                {I18n.t(
                  'plugin_bot_ide_plugin_setting_modal_input_param_title',
                )}
              </Radio>
              <Radio value={1} className="flex-[1]">
                {I18n.t(
                  'plugin_bot_ide_plugin_setting_modal_output_param_title',
                )}
              </Radio>
            </RadioGroup>
          </div>
          <Table
            pagination={false}
            columns={columns}
            dataSource={activeTab === 0 ? requestParams : responseParams}
            rowKey={ROWKEY}
            childrenRecordName={childrenRecordName}
            expandAllRows={true}
            scroll={scroll}
            empty={
              <div className={s.empty}>
                {I18n.t('plugin_form_no_result_desc')}
              </div>
            }
          />
          <Button
            loading={isUpdateLoading}
            className="absolute right-[0] bottom-[0] h-[32px] !min-w-[98px]"
            onClick={doSave}
          >
            {I18n.t('Save')}
          </Button>
        </div>
      ) : (
        <Spin spinning style={{ height: '400px', width: '100%' }} />
      )}
    </>
  );
};

export { PartParams };
