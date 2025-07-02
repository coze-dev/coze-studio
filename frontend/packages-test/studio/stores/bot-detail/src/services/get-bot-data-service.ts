import {
  type GetBotVersionInfoData,
  GetBotVersionScene,
  type GetDraftBotInfoAgwData,
} from '@coze-arch/idl/playground_api';
import {
  MonetizationEntityType,
  type BotMonetizationConfigData,
} from '@coze-arch/bot-api/benefit';
import { benefitApi, PlaygroundApi } from '@coze-arch/bot-api';

export const getBotDataService = async (params: {
  scene: 'bot' | 'market';
  botId: string;
  customVersion?: string;
  botInfoVersion: string;
}): Promise<{
  botData: GetDraftBotInfoAgwData;
  monetizeConfig: BotMonetizationConfigData | undefined;
}> => {
  const { scene, botId, customVersion, botInfoVersion } = params;
  if (scene === 'bot') {
    const [botInfoResp, monetizeConfigResp] = await getBotSceneData({
      botId,
      version: customVersion ?? '',
    });
    return {
      botData: getCommonBotData(botInfoResp?.data ?? {}),
      monetizeConfig: monetizeConfigResp?.data,
    };
  }
  const botInfoResp = await getMarketSceneData({
    botId,
    version: botInfoVersion,
  });
  return {
    botData: getCommonBotData(botInfoResp?.data ?? {}),
    monetizeConfig: undefined,
  };
};

const getBotSceneData = async (params: { botId: string; version: string }) => {
  const { botId, version } = params;
  return await Promise.all([
    PlaygroundApi.GetDraftBotInfoAgw({
      bot_id: botId,
      version,
    }),
    IS_OVERSEA
      ? benefitApi.PublicGetBotMonetizationConfig({
          entity_id: botId,
          entity_type: MonetizationEntityType.Bot,
        })
      : Promise.resolve(undefined),
  ]);
};

const getMarketSceneData = async (params: {
  botId: string;
  version: string;
}) => {
  const { botId, version } = params;
  return await PlaygroundApi.GetBotVersionInfo({
    bot_id: botId,
    version: version ?? '',
    scene: GetBotVersionScene.BotStore,
  });
};

export const getCommonBotData = (
  botData: GetDraftBotInfoAgwData | GetBotVersionInfoData,
): GetDraftBotInfoAgwData => {
  let commonBotData: GetDraftBotInfoAgwData = {
    bot_info: {},
  };
  if ('bot_info' in botData) {
    commonBotData = botData;
  }
  if ('bot_version_info' in botData) {
    commonBotData = {
      bot_info: botData.bot_version_info?.common_bot_info ?? {},
    };
  }
  return commonBotData;
};
