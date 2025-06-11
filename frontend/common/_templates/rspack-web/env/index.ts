const { NODE_ENV } = process.env;

const IS_DEV_MODE = NODE_ENV === 'development'; // 本地环境
const IS_PRODUCT_MODE = NODE_ENV === 'production'; // 生产环境

const IS_CI = process.env.CI === 'true';

const IS_SCM = !!process.env.BUILD_PATH_SCM;

export const envs = {
  IS_DEV_MODE,
  IS_PRODUCT_MODE,
  IS_CI,
  IS_SCM,
};

const emptyVars = Object.entries({
  ...envs,
}).filter(([key, value]) => value === undefined);

if (emptyVars.length) {
  throw Error(`以下环境变量值为空：${emptyVars.join('、')}`);
}
