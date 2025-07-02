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
