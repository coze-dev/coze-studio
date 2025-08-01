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

import { useMemo, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  type BindSubjectInfo,
  type BizCtxInfo,
} from '@coze-studio/mockset-shared';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type PluginInfoForPlayground,
  type PluginApi,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { ToolItemActionSetting } from '@coze-agent-ide/tool';

import { PartMain, type SettingSlot } from './part-main';

export interface IAgentSkillPluginSettingModalProps {
  botId?: string;
  apiInfo?: PluginApi;
  devId?: string;
  plugin?: PluginInfoForPlayground;
  bindSubjectInfo?: BindSubjectInfo;
  bizCtx?: BizCtxInfo;
  disabled?: boolean;
  slotList?: SettingSlot[];
}

const useAgentSkillPluginSettingModalController = (
  config: IAgentSkillPluginSettingModalProps,
) => {
  const [FLAGS] = useFlags();

  const [visible, setVisible] = useState(!!0);

  const commonParams = useMemo(
    () => ({
      bot_id: config?.botId || '',
      dev_id: config?.devId || '',
      plugin_id: config?.apiInfo?.plugin_id || '',
      api_name: config?.apiInfo?.name || '',
      space_id: useSpaceStore.getState().getSpaceId(),
    }),
    [config],
  );

  const { data: responseData, loading: isCheckingResponse } = useRequest(
    async () => {
      const resp = await PluginDevelopApi.GetBotDefaultParams(commonParams);

      return resp.response_params;
    },
    {
      refreshDeps: [commonParams],
      // Support soon, so stay tuned.
      ready: visible && FLAGS['bot.devops.plugin_mockset'],
    },
  );

  // mock-set support setting is disabled, end plug-in type is not supported
  // If there is no response, you can't open mock-set.
  const isDisabledMockSet = useMemo(
    () => !responseData?.length || isCheckingResponse,
    [responseData, isCheckingResponse],
  );

  return {
    isDisabledMockSet,
    pluginInfo: config.plugin,
    doVisible: setVisible,
    visible,
  };
};

export const PluginSettingEnter = (
  props: IAgentSkillPluginSettingModalProps,
) => {
  const { doVisible, visible, pluginInfo, isDisabledMockSet } =
    useAgentSkillPluginSettingModalController(props);

  return (
    <>
      <PartMain
        devId={props.devId}
        botId={props.botId}
        isDisabledMockSet={isDisabledMockSet}
        pluginInfo={pluginInfo}
        // @ts-expect-error -- linter-disable-autofix
        apiInfo={props.apiInfo}
        // @ts-expect-error -- linter-disable-autofix
        bindSubjectInfo={props.bindSubjectInfo}
        // @ts-expect-error -- linter-disable-autofix
        bizCtx={props.bizCtx}
        doVisible={doVisible}
        visible={visible}
        slotList={props.slotList}
      />
      <ToolItemActionSetting
        tooltips={I18n.t('plugin_bot_ide_plugin_setting_icon_tip')}
        onClick={() => doVisible(!0)}
        disabled={props.disabled}
        data-testid="bot.editor.tool.added-tool-plugin-action-setting"
      />
    </>
  );
};
