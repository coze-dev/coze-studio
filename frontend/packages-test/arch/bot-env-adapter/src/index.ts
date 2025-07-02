import { features } from './features';
import { configs } from './configs';
import { base } from './base';

const envs = {
  ...base,
  ...configs,
  ...features,
};

const COMMON_NULLABLE_VARS = ['CUSTOM_ENV_NAME', 'OUTER_CDN'];
const NULLABLE_VARS =
  envs.BUILD_TYPE === 'local'
    ? ['CDN', ...COMMON_NULLABLE_VARS]
    : [...COMMON_NULLABLE_VARS];

if (process.env.VERBOSE === 'true') {
  console.info(JSON.stringify(envs, null, 2));
}
const emptyVars = Object.entries({
  ...base,
  ...features,
}).filter(
  ([key, value]) => value === undefined && !NULLABLE_VARS.includes(key),
);

if (emptyVars.length) {
  throw Error(`以下环境变量值为空：${emptyVars.join('、')}`);
}

export { envs as GLOBAL_ENVS };
