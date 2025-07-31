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
import React, { useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { type VariableItem } from '@coze-studio/bot-detail-store';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  Checkbox,
  Space,
  Switch,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';
import { type GetSysVariableConfResponse } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { BotE2e } from '@coze-data/e2e';
const { Text } = Typography;

import s from './index.module.less';

export type TVariable = VariableItem & {
  enable?: boolean;
  must_not_use_in_prompt?: string; // The server level type is online and cannot be changed to boolean. "," false "," true "
  ext_desc?: string;
  prompt_disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  EffectiveChannelList?: string[];
};

export interface ISysConfigItem {
  id: string;
  key: React.ReactNode;
  default_value: React.ReactNode;
  description: React.ReactNode;
  channel?: React.ReactNode;
  method?: React.ReactNode;
}
export interface ISysConfigItemGroup {
  id: string;
  key: React.ReactNode;
  default_value: React.ReactNode;
  description: React.ReactNode;
  method?: React.ReactNode;
  channel?: React.ReactNode;
  var_info_list?: ISysConfigItem[];
}
export interface SystemConfig {
  sysConfigList: ISysConfigItemGroup[];
  sysVariables: TVariable[];
  enableVariables: VariableItem[];
  loading: boolean;
}
export interface SysConfigData {
  conf: TVariable[];
  groupConf: GetSysVariableConfResponse['group_conf'];
}

export const useSystemVariables = (
  variables: VariableItem[],
  visible: boolean,
): SystemConfig => {
  const { run, loading } = useRequest(async () => {
    const res = await MemoryApi.GetSysVariableConf();
    const resData = res?.group_conf?.reduce(
      (prev, cur) => {
        cur.group_name
          ? prev.group_conf.push(cur)
          : (prev.conf = prev.conf?.concat(cur.var_info_list || []));
        return prev;
      },
      {
        conf: [],
        group_conf: [],
      },
    );
    // group new logic
    const configInfo = initSysVarStatus(resData);
    setConfig(configInfo);
  });

  const { variables: values } = useBotSkillStore(
    useShallow(state => ({
      variables: state.variables,
    })),
  );
  const [sysConfig, setConfig] = useState<SysConfigData>({
    conf: [],
    groupConf: [],
  });
  // Here you need to set sysVariables according to the config.
  const sysVariables = useMemo(() => {
    const group = sysConfig.groupConf?.reduce(
      (prev, cur) => prev.concat(cur?.var_info_list),
      [],
    );
    return [...sysConfig.conf, ...group];
  }, [sysConfig]);

  // Splice enabled system variables and custom variables
  const enableVariables = useMemo(() => {
    const enableSysVariables =
      sysVariables
        .filter(v => v.enable)
        ?.map(sys => ({ ...sys, is_system: true })) || [];
    const customVariables =
      variables.filter(variable => !variable.is_system) || [];
    return [...enableSysVariables, ...customVariables];
  }, [variables, sysVariables]);

  const initSysVarStatus = data => {
    const { conf = [], group_conf = [] } = data || {};
    const setItem = varItem => {
      const enableItem: TVariable | undefined = values?.find(
        item => item.key === varItem.key && item.is_system,
      );
      return {
        ...varItem,
        is_system: enableItem?.is_system,
        enable: !!enableItem,
        prompt_disabled: enableItem?.prompt_disabled ?? true,
      };
    };
    const confLIst = conf?.map(setItem);
    const groupConfList = group_conf?.map(group => ({
      ...group,
      var_info_list: group.var_info_list?.map(groupItem => ({
        ...setItem(groupItem),
        prompt_disabled: true,
        channel: groupItem?.EffectiveChannelList?.join(','),
      })),
    }));
    return {
      conf: confLIst || [],
      groupConf: groupConfList || [],
    };
  };

  useEffect(() => {
    if (visible) {
      run();
    }
  }, [visible]);

  const setSysConfigStatus = (key, prop, checked) => {
    const { conf = [], groupConf = [] } = sysConfig;
    const configIndex = conf.findIndex(confItem => confItem.key === key);
    if (configIndex !== -1) {
      conf[configIndex][prop] = checked;
      if (prop === 'enable') {
        conf[configIndex].prompt_disabled = !checked;
      }
    }
    groupConf.forEach(groupItem => {
      const index = groupItem?.var_info_list.findIndex(
        item => item.key === key,
      );
      if (index !== -1) {
        groupItem.var_info_list[index][prop] = checked;
      }
      setConfig({ conf, groupConf });
    });
  };

  const changeEnable = (checked: boolean, key: string) => {
    setSysConfigStatus(key, 'enable', checked);
  };

  const changeCheckbox = (checked: boolean, key: string) => {
    setSysConfigStatus(key, 'prompt_disabled', checked);
  };

  const SysVarConfigRender = ({
    value,
    enable,
    e2e,
    extDesc,
    className,
  }: {
    value: string;
    enable: boolean | undefined;
    e2e?: string;
    extDesc?: string;
    className?: string;
  }): JSX.Element => (
    <div
      className={classNames(
        [s.sys_item_box, !enable && s.disabled, className],
        'flex items-center',
      )}
      data-dtestid={e2e}
    >
      <Text ellipsis={{ showTooltip: true }}>{value}</Text>
      {!!extDesc && (
        <Tooltip content={I18n.t(extDesc as I18nKeysNoOptionsType)}>
          <IconInfo
            style={{
              color: '#C6CACD',
              marginLeft: 4,
            }}
          />
        </Tooltip>
      )}
    </div>
  );
  const SysVarGroupConfigRender = ({
    value,
    e2e,
    enable = true,
    extDesc,
    className,
  }: {
    value: string;
    e2e?: string;
    enable?: boolean;
    extDesc?: string;
    className?: string;
  }): JSX.Element => (
    <div
      className={classNames([
        s.sys_item_group,
        !enable && s.disabled,
        className,
      ])}
      data-dtestid={e2e}
    >
      <div>{value}</div>
      {!!extDesc && (
        <Tooltip content={I18n.t(extDesc as I18nKeysNoOptionsType)}>
          <IconInfo
            style={{
              color: '#C6CACD',
              marginLeft: 4,
            }}
          />
        </Tooltip>
      )}
    </div>
  );
  const configItem = (
    item: TVariable,
    promptDisabled = false,
  ): ISysConfigItem => ({
    id: item.key,
    key: SysVarConfigRender({
      value: item.key ?? '',
      enable: item.enable,
      e2e: `${BotE2e.BotVariableAddModalNameText}.${item.key}`,
      extDesc: item.ext_desc,
      className: 'w-[140px] flex-none basis-[140px]',
    }),
    description: SysVarConfigRender({
      value: item.description ?? '',
      enable: item.enable,
      e2e: `${BotE2e.BotVariableAddModalDescText}.${item.key}`,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    default_value: SysVarConfigRender({
      value: item.default_value || '--',
      enable: item.enable,
      e2e: `${BotE2e.BotVariableAddModalDefaultValueText}.${item.key}`,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    channel: SysVarConfigRender({
      value: item.channel || '--',
      enable: item.enable,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    method: (
      <Space className={s['memory-method']} spacing={24}>
        <Tooltip content={I18n.t('variable_240520_03')} theme="dark">
          <div className={s['memory-method-checkbox']}>
            <Checkbox
              disabled={
                promptDisabled ||
                !item.enable ||
                item.must_not_use_in_prompt === 'true'
              }
              checked={item?.prompt_disabled ? false : true}
              onChange={v => {
                changeCheckbox(!v.target.checked, item.key);
              }}
            ></Checkbox>
          </div>
        </Tooltip>
        <Tooltip
          showArrow
          position="top"
          theme="dark"
          zIndex={1031}
          style={{
            backgroundColor: '#41464c',
            color: '#fff',
            maxWidth: '276px',
          }}
          content={I18n.t('variable_240407_01')}
        >
          <Switch
            data-dtestid={`${BotE2e.BotVariableAddModalSwitch}.${item.key}`}
            size="small"
            checked={item?.enable ?? false}
            onChange={checked => changeEnable(checked, item.key)}
          />
        </Tooltip>
      </Space>
    ),
  });

  const groupList: ISysConfigItemGroup[] = sysConfig?.groupConf?.map(item => ({
    id: nanoid(),
    key: SysVarGroupConfigRender({
      value: item.group_name ?? '--',
      e2e: `${BotE2e.BotVariableAddModalNameText}.${item.group_name}`,
      extDesc: item?.group_ext_desc,
      className: 'w-[140px] flex-none basis-[140px]',
    }),
    description: SysVarConfigRender({
      value: item.group_desc || '--',
      enable: true,
      e2e: `${BotE2e.BotVariableAddModalDescText}.${item.group_name}`,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    default_value: SysVarConfigRender({
      value: '--',
      enable: true,
      e2e: `${BotE2e.BotVariableAddModalDefaultValueText}.${item.group_name}`,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    channel: SysVarConfigRender({
      value: '--',
      enable: true,
      className: 'w-[128px] flex-none basis-[128px]',
    }),
    var_info_list: item?.var_info_list?.length
      ? item?.var_info_list.map(childItem => configItem(childItem, true))
      : undefined,
  }));

  // system variable
  const sysConfigList: ISysConfigItem[] = sysConfig?.conf?.map(item =>
    configItem(item),
  );
  return {
    sysConfigList: [...sysConfigList, ...groupList],
    sysVariables,
    enableVariables,
    loading,
  };
};
