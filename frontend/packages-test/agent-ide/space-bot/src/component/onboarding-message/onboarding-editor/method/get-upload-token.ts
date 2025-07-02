import { type GetUploadTokenResponse } from '@coze-arch/bot-api/market_interaction_api';
import { DeveloperApi } from '@coze-arch/bot-api';

const TIMEOUT = 60000;

export const getUploadToken: () => Promise<GetUploadTokenResponse> =
  async () => {
    const dataAuth = await DeveloperApi.GetUploadAuthToken(
      {
        scene: 'bot_task',
      },
      { timeout: TIMEOUT },
    );

    const { code, msg, data } = dataAuth;

    return {
      code: Number(code),
      message: msg,
      data: {
        ...data,
        ...data.auth,
      },
    };
  };
