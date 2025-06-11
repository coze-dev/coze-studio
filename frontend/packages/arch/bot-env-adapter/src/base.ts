import { getCurrentBranch } from './utils/current-branch';

const processEnvs = {
  BUILD_TYPE: (process.env.BUILD_TYPE || 'local') as
    | 'online'
    | 'offline'
    | 'test'
    | 'local',
  CUSTOM_VERSION: (process.env.CUSTOM_VERSION || 'inhouse') as
    | 'release'
    | 'inhouse',
  BUILD_BRANCH: (process.env.BUILD_BRANCH || getCurrentBranch()) as string,
  REGION: (process.env.REGION || 'cn') as 'cn' | 'sg' | 'va',
  NODE_ENV: process.env.NODE_ENV as 'production' | 'development' | 'test',
  CDN_PATH_PREFIX: (process.env.CDN_PATH_PREFIX ?? '/') as string,
  // vmok 生产者使用，用来将生产者的 sourcemap 文件上传至对应的消费者版本下面
  CONSUMER_BUILD_VERSION: (process.env.CONSUMER_BUILD_VERSION ?? '') as string,
};

const IS_OVERSEA = Boolean(process.env.REGION) && process.env.REGION !== 'cn';
const IS_CN_REGION = process.env.REGION === 'cn';
const IS_VA_REGION = process.env.REGION === 'va';
const IS_RELEASE_VERSION = processEnvs.CUSTOM_VERSION === 'release'; // 为 ture 表示对外版本
const IS_OVERSEA_RELEASE = IS_OVERSEA && IS_RELEASE_VERSION;
const IS_PROD =
  processEnvs.BUILD_TYPE === 'online' ||
  process.env.CUSTOM_BUILD_TYPE === 'online'; // 是否是线上
const IS_BOE = processEnvs.BUILD_TYPE === 'offline';
const IS_DEV_MODE = processEnvs.NODE_ENV === 'development'; // 本地开发
const IS_BOT_OP = false; // 是否是 bot 运营平台，默认都是 false，从运营平台构建会设置成 true
const IS_OPEN_SOURCE = (process.env.IS_OPEN_SOURCE ?? 'false') === 'true';

const judgements = {
  IS_OVERSEA,
  IS_CN_REGION,
  IS_VA_REGION,
  IS_BOE,
  IS_RELEASE_VERSION,
  IS_OVERSEA_RELEASE,
  IS_DEV_MODE,
  IS_PROD,
  IS_BOT_OP,
  IS_OPEN_SOURCE,
};

const getInnerCDN = () =>
  process.env[`CDN_INNER_${processEnvs.REGION.toUpperCase()}`];

const getOuterCDN = () =>
  process.env[`CDN_OUTER_${processEnvs.REGION.toUpperCase()}`];

const getCDN = () => {
  if (IS_DEV_MODE) {
    if (IS_RELEASE_VERSION) {
      return '';
    } else {
      return '';
    }
  }
  if (IS_RELEASE_VERSION && processEnvs.BUILD_TYPE === 'online') {
    // 海外正式版使用独立业务线
    return getOuterCDN();
  } else {
    return getInnerCDN();
  }
};

/** 对应CDN资源上传平台上的CDN地址 */
const getUploadCDN = () => {
  const uploadCDNPrefixes = {
    UPLOAD_CDN_CN: '',
    UPLOAD_CDN_SG: '',
    UPLOAD_CDN_VA: '',
  };

  const currentKey = `UPLOAD_CDN_${processEnvs.REGION.toUpperCase() as string}`;

  return {
    UPLOAD_CDN: uploadCDNPrefixes[currentKey as keyof typeof uploadCDNPrefixes],
    ...(IS_DEV_MODE ? uploadCDNPrefixes : {}),
  };
};

export const base = {
  ...processEnvs,
  ...judgements,
  CDN: getCDN(),
  // release 环境下外部静态域名
  OUTER_CDN: getOuterCDN(),
  ...getUploadCDN(),
};
