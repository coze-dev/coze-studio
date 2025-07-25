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
 
/**
 * 依赖 treeShaking 去除无关配置(Argus)
 */
const sdkRegion = 'cn';
export const iframeAppHost = '';

export const cozeOfficialHost = '';

export const openApiCdnUrlByRegion = IS_OVERSEA
  ? // cp-disable-next-line
    'https://sf16-sg.tiktokcdn.com/obj/eden-sg/rkzild_lgvj/ljhwZthlaukjlkulzlp/'
  : // cp-disable-next-line
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/rkzild_lgvj/ljhwZthlaukjlkulzlp/';

// 用户需要修改此处baseurl，用于开放平台接口的域名配置
export const openApiHostByRegion =
  typeof location !== 'undefined' ? location.origin : 'https://api.xxx.com';
export const openApiHostByRegionWithToken = openApiHostByRegion;

export const openSdkPrefix = '';
export const getOpenSDKUrl = (_version: string) => '';

export const getOpenSDKPath = (_version: string) => '';

export const eventMeta = {
  region: sdkRegion,
  is_release: false,
  dev: false,
};
