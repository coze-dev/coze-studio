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
