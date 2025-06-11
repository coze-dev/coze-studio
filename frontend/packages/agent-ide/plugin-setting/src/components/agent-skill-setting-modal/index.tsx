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
      // 社区版暂不支持该功能
      ready: visible && FLAGS['bot.devops.plugin_mockset'],
    },
  );

  // mock-set 支持设置禁用，端插件类型不支持
  // 没有 response的 也不能 开启 mock-set
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
      />
    </>
  );
};
