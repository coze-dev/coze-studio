import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useCallback } from 'react';

import { useSafeState, useUnmountedRef } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { type PluginAPIDetal } from '@coze-arch/idl/playground_api';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { getFlags } from '@coze-arch/bot-flags';
import { type PluginPricingRule } from '@coze-arch/bot-api/plugin_develop';
import {
  MonetizationEntityType,
  type BotMonetizationConfigData,
} from '@coze-arch/bot-api/benefit';
import {
  PlaygroundApi,
  PluginDevelopApi,
  benefitApi,
} from '@coze-arch/bot-api';
import { useBotModeStore } from '@coze-agent-ide/space-bot/store';
import { type PublisherBotInfo } from '@coze-agent-ide/space-bot';

const DEFAULT_BOT_INFO: PublisherBotInfo = {
  name: '',
  description: '',
  prompt: '',
};

// 获取plugin收费插件信息
const getPricingRules: (
  pluginApiDetailMap?: Record<string | number, PluginAPIDetal>,
) => Promise<PluginPricingRule[] | undefined> = async pluginApiDetailMap => {
  if (!pluginApiDetailMap) {
    return undefined;
  }
  const { pricing_rules } = await PluginDevelopApi.BatchGetPluginPricingRules({
    plugin_apis: Object.keys(pluginApiDetailMap)?.map(item => ({
      name: pluginApiDetailMap[item].name,
      plugin_id: pluginApiDetailMap[item].plugin_id,
      api_id: item,
    })),
  });
  return pricing_rules;
};

// 是否有plugin
const hasPluginApi: (
  pluginApiDetailMap?: Record<string | number, PluginAPIDetal>,
) => boolean = pluginApiDetailMap =>
  !!(pluginApiDetailMap && Array.isArray(Object.keys(pluginApiDetailMap)));

export const useGetPublisherInitInfo: () => {
  botInfo: PublisherBotInfo;
  monetizeConfig: BotMonetizationConfigData | undefined;
} = () => {
  const params = useParams<DynamicParams>();
  const navigate = useNavigate();
  const { bot_id, commit_version } = params;
  const unmountedRef = useUnmountedRef();
  const setIsCollaboration = useBotModeStore(s => s.setIsCollaboration);

  const setSafeIsCollaboration = useCallback((currentState: boolean) => {
    /** if component is unmounted, stop update */
    if (unmountedRef.current) {
      return;
    }
    setIsCollaboration(currentState);
  }, []);
  const [botInfo, setBotInfo] =
    useSafeState<PublisherBotInfo>(DEFAULT_BOT_INFO);
  const [monetizeConfig, setMonetizeConfig] = useSafeState<
    BotMonetizationConfigData | undefined
  >();
  useEffect(() => {
    if (!bot_id) {
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      try {
        const FLAGS = getFlags();
        const [botInfoResp, monetizeResp] = await Promise.all([
          PlaygroundApi.GetDraftBotInfoAgw({ bot_id, commit_version }),
          FLAGS['bot.studio.monetize_config']
            ? benefitApi.PublicGetBotMonetizationConfig({
                entity_id: bot_id,
                entity_type: MonetizationEntityType.Bot,
              })
            : Promise.resolve(undefined),
        ]);
        setMonetizeConfig(monetizeResp?.data);
        const {
          bot_info,
          in_collaboration,
          branch,
          has_publish,
          bot_option_data,
        } = botInfoResp?.data ?? {};

        // 获取plugin扣费信息
        let pluginPricingRules: Array<PluginPricingRule> = [];
        if (
          hasPluginApi(bot_option_data?.plugin_api_detail_map) &&
          !IS_OPEN_SOURCE
        ) {
          pluginPricingRules =
            (await getPricingRules(bot_option_data?.plugin_api_detail_map)) ??
            [];
        }

        const {
          name = '',
          prompt_info,
          description = '',
          bot_mode,
          business_type,
        } = bot_info;
        setBotInfo({
          name,
          prompt: prompt_info?.prompt ?? '',
          description,
          branch,
          botMode: bot_mode,
          hasPublished: has_publish,
          pluginPricingRules,
          businessType: business_type,
        });

        setSafeIsCollaboration(!!in_collaboration);
      } catch (error) {
        logger.error({ error: error as Error });
      }
    })();
  }, []);

  return {
    botInfo,
    monetizeConfig,
  };
};
