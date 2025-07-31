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

/* eslint-disable max-lines -- to be split */

import { extractEnvValue } from './utils/config-helper';
import { volcanoConfigs } from './configs/volcano';

const domainMap = {
  DOMAIN_RELEASE_CN: 'www.coze.cn',
  DOMAIN_RELEASE_OVERSEA: 'www.coze.com',
};

const APP_ID = extractEnvValue<number>({
  cn: {
    boe: 0,
    inhouse: 0,
    release: 0,
  },
  sg: {
    inhouse: 0,
    release: 0,
  },
  va: {
    release: 0,
  },
});

const APP_KEY = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const FLOW_BRAND_NAME = extractEnvValue<string>({
  cn: {
    boe: '豆包',
    inhouse: '豆包',
    release: '豆包',
  },
  sg: {
    inhouse: 'Cici',
    release: 'Cici',
  },
  va: {
    release: 'Cici',
  },
});

const BOT_BRAND_NAME = extractEnvValue<string>({
  cn: {
    boe: '扣子',
    inhouse: '扣子',
    release: '扣子',
  },
  sg: {
    inhouse: 'Coze',
    release: 'Coze',
  },
  va: {
    release: 'Coze',
  },
});

const appMeta = {
  APP_ID,
  APP_KEY,
  FLOW_BRAND_NAME,
  BOT_BRAND_NAME,
} as const;

const SEC_SDK_ASSERT_URL = extractEnvValue<string | null>({
  cn: {
    boe: null,
    inhouse: null,
    release: null,
  },
  sg: {
    // The non-release environment uses the default intranet public SCM, tos has no upload permission and no desensitization need. Directly use the tos address provided by risk control
    inhouse: '',
    // Release and upload to the independent SCM CDN
    release: '',
  },
  va: {
    release: '',
  },
});

const FLOW_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '489823',
    release: '489823',
  },
  va: {
    release: '489823',
  },
});

const FEISHU_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const LARK_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const REDDIT_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const JUEJIN_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const OBRIC_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const MYAI_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const DISCORD_PUBLISH_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const BYTE_UPLOADER_REGION = extractEnvValue<
  | 'cn-north-1'
  | 'us-east-1'
  | 'ap-singapore-1'
  | 'us-east-red'
  | 'boe'
  | 'boei18n'
  | 'US-TTP'
  | 'gcp'
>({
  cn: {
    // TODO confirm here.
    boe: 'boe',
    inhouse: 'cn-north-1',
    release: 'cn-north-1',
  },
  sg: {
    inhouse: 'ap-singapore-1',
    release: 'ap-singapore-1',
  },
  va: {
    release: 'us-east-1',
  },
});

const IMAGE_FALLBACK_HOST = extractEnvValue<string>({
  cn: {
    // TODO confirm here.
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const GOOGLE_CLIENT_ID = extractEnvValue<null | string>({
  cn: {
    boe: null,
    inhouse: null,
    release: null,
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const GOOGLE_PLATFORM_ID = extractEnvValue<null | number>({
  cn: {
    boe: null,
    inhouse: null,
    release: null,
  },
  sg: {
    inhouse: 0,
    release: 0,
  },
  va: {
    release: 0,
  },
});

// I used to plan to log in to Facebook, but after the requirements changed, it was gone.
const FACEBOOK_APP_ID = extractEnvValue<null | string>({
  cn: {
    boe: null,
    inhouse: null,
    release: null,
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const AWEME_PLATFORM_ID = extractEnvValue<number>({
  cn: {
    boe: 0,
    inhouse: 0,
    release: 0,
  },
  sg: {
    inhouse: 0,
    release: 0,
  },
  va: {
    release: 0,
  },
});

const AWEME_PLATFORM_APP_KEY = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const AWEME_ORIGIN = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const SAMI_APP_KEY = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const SAMI_WS_ORIGIN = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const COZE_API_TTS_BASE_URL = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const SAMI_CHAT_WS_URL = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const COZE_FEISHU_APP = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

export const COZE_LARK_APP = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const legalEnvs = {
  TERMS_OF_SERVICE:
    'https://www.coze.com/docs/guides/terms_of_service?_lang=en',
  PRIVATE_POLICY: 'https://www.coze.com/docs/guides/policy?_lang=en',
  CN_TERMS_OF_SERVICE: 'https://www.coze.cn/docs/guides/terms-of-service',
  CN_PRIVATE_POLICY: 'https://www.coze.cn/docs/guides/privacy',
  VOLC_TERMS_OF_SERVICE: 'https://www.volcengine.com/docs/6256/64903',
  VOLC_PRIVATE_POLICY: 'https://www.volcengine.com/docs/6256/64902',
};

const MONACO_EDITOR_PUBLIC_PATH = '/';

const FEEL_GOOD_HOST = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: 'survey.coze.com',
    release: 'survey.coze.com',
  },
  va: {
    release: 'survey.coze.com',
  },
});
const feelGoodEnvs = {
  FEEL_GOOD_PID: '',
  FEEL_GOOD_HOST,
} as const;

const CARD_BUILDER_ENV_STR = extractEnvValue<string>({
  cn: {
    boe: 'boe',
    inhouse: 'cn-inhouse',
    release: 'cn-release',
  },
  sg: {
    inhouse: 'sg-inhouse',
    release: 'sg-release',
  },
  va: {
    release: 'va-release',
  },
});

const OPEN_WEB_SDK_BOT_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const OPEN_DOCS_APP_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const CUSTOM_PLAT_APPLY_PUBLIC_PLAT_FORM_LINK = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const OPEN_DOCS_LIB_ID = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const PLUGIN_IDE_EDITION = extractEnvValue<string>({
  cn: {
    boe: 'cn-internal-boe',
    inhouse: 'cn-internal-prod',
    release: 'cn-public-prod',
  },
  sg: {
    inhouse: 'sg-internal-prod',
    release: 'sg-public-prod',
  },
  va: {
    release: 'va-public-prod',
  },
});
const EMBEDDED_PAGE_URL = extractEnvValue<string>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: '',
    release: '',
  },
  va: {
    release: '',
  },
});

const SOCIAL_SCENE_FRONTIER_SERVICE_KEY = extractEnvValue<number>({
  cn: {
    boe: 0,
    inhouse: 0,
    release: 0,
  },
  sg: {
    inhouse: 0,
    release: 0,
  },
  va: {
    release: 0,
  },
});

const FORNAX_DOMAIN = extractEnvValue<string | null>({
  cn: {
    boe: '',
    inhouse: null,
    release: '',
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

const COZE_DOMAIN = extractEnvValue<string | null>({
  cn: {
    boe: '',
    inhouse: '',
    release: 'www.coze.cn',
  },
  sg: {
    inhouse: '',
    release: 'www.coze.com',
  },
  va: {
    release: 'www.coze.com',
  },
});

export const configs = {
  ...appMeta,
  ...feelGoodEnvs,
  ...legalEnvs,
  ...domainMap,
  ...volcanoConfigs,
  FLOW_PUBLISH_ID,
  FEISHU_PUBLISH_ID,
  LARK_PUBLISH_ID,
  REDDIT_PUBLISH_ID,
  JUEJIN_PUBLISH_ID,
  OBRIC_PUBLISH_ID,
  MYAI_PUBLISH_ID,
  DISCORD_PUBLISH_ID,
  SEC_SDK_ASSERT_URL,
  BYTE_UPLOADER_REGION,
  IMAGE_FALLBACK_HOST,
  GOOGLE_CLIENT_ID,
  GOOGLE_PLATFORM_ID,
  FACEBOOK_APP_ID,
  AWEME_ORIGIN,
  AWEME_PLATFORM_APP_KEY,
  AWEME_PLATFORM_ID,
  SAMI_APP_KEY,
  SAMI_WS_ORIGIN,
  SAMI_CHAT_WS_URL,
  CARD_BUILDER_ENV_STR,
  MONACO_EDITOR_PUBLIC_PATH,
  OPEN_WEB_SDK_BOT_ID,
  OPEN_DOCS_APP_ID,
  OPEN_DOCS_LIB_ID,
  COZE_FEISHU_APP,
  COZE_LARK_APP,
  PLUGIN_IDE_EDITION,
  EMBEDDED_PAGE_URL,
  SOCIAL_SCENE_FRONTIER_SERVICE_KEY,
  CUSTOM_PLAT_APPLY_PUBLIC_PLAT_FORM_LINK,
  COZE_API_TTS_BASE_URL,
  FORNAX_DOMAIN,
  COZE_DOMAIN,
};
