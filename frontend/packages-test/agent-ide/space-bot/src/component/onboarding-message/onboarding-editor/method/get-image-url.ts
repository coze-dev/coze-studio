import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import {
  type GetImgURLRequest,
  type GetImgURLResponse,
} from '@coze-arch/bot-api/market_interaction_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

export const getImageUrl: (
  req?: GetImgURLRequest,
) => Promise<GetImgURLResponse> = async req => {
  const { Key: uri } = req;

  const result = await PlaygroundApi.GetImagexShortUrl({
    uris: [uri],
  });

  const { code, msg, data } = result;

  const urlAndAudit = data?.url_info?.[uri];

  const audit = urlAndAudit?.review_status;

  const url = urlAndAudit?.url;
  if (!audit) {
    Toast.error({
      content: I18n.t('inappropriate_contents'),
      showClose: false,
    });
    throw new Error('inappropriate_contents');
  }

  if (!url) {
    throw new Error('inappropriate_contents');
  }

  return {
    code: Number(code),
    message: msg,
    data: {
      url,
    },
  };
};
