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

// Get plugin charging plugin information
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

// Is there a plugin?
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

        // Get plugin deduction information
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
