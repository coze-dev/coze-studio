import { logger } from '@coze-arch/logger';

import { wait, ONE_SEC } from './utils/wait';
import { isObject } from './utils/tools';
import { featureFlagStorage } from './utils/storage';
import { reporter } from './utils/repoter';
import {
  readFgValuesFromContext,
  readFgPromiseFromContext,
} from './utils/read-from-context';
import { readFromCache, saveToCache } from './utils/persist-cache';
import { type FEATURE_FLAGS, type FetchFeatureGatingFunction } from './types';
import { PACKAGE_NAMESPACE } from './constant';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const DEFAULT_POLLING_INTERVAL = 5 * ONE_SEC;
// 设置 17 作为时间分片大小
const TIME_PIECE = 17;

interface PullFeatureFlagsParams {
  // 取值超时时间
  timeout: number;
  // 严格模式下，不会插入兜底逻辑，且取不到数值时直接报错
  strict: boolean;
  // 轮训间隔，生产环境默认 60 秒；开发 & 测试环境默认 10 秒
  pollingInterval: number;
  fetchFeatureGating: FetchFeatureGatingFunction;
}

interface WorkResult {
  values: FEATURE_FLAGS;
  source: 'context' | 'remote' | 'bailout' | 'persist' | 'static_context';
}

const runPipeline = async (
  context: PullFeatureFlagsParams,
): Promise<WorkResult> => {
  try {
    const fgValues = readFgValuesFromContext();
    if (fgValues) {
      saveToCache(fgValues);
      return { values: fgValues, source: 'static_context' };
    }
  } catch (e) {
    logger.persist.error({
      namespace: PACKAGE_NAMESPACE,
      message: (e as Error).message,
      error: e as Error,
    });
  }

  const { timeout: to, strict } = context;
  // 超时时间不应该小于 1s
  const timeout = Math.max(to, ONE_SEC);
  const works: (() => Promise<WorkResult | undefined>)[] = [];
  const waitTimeout = wait.bind(null, timeout + ONE_SEC);

  // 从线上环境取值
  works.push(async () => {
    try {
      const values = await context.fetchFeatureGating();
      if (isObject(values)) {
        saveToCache(values);
        return { values, source: 'remote' };
      }
      await waitTimeout();
    } catch (e) {
      // TODO: 这里加埋点，上报接口异常
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg by "fetchFeatureGating" failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // 从浏览器全局对象取值
  // 这里需要判断一下，只有浏览器环境才执行
  works.push(async () => {
    try {
      const values = await readFgPromiseFromContext();
      if (values && isObject(values)) {
        saveToCache(values);
        return { values: values as FEATURE_FLAGS, source: 'context' };
      }
      logger.persist.info({
        namespace: PACKAGE_NAMESPACE,
        message: "Can't not read fg from global context",
      });
      // 强制等等超时，以免整个 works resolve 到错误的值
      await waitTimeout();
    } catch (e) {
      // TODO: 这里加埋点，上报接口异常
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg from context failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // 从缓存中取值
  works.push(async () => {
    try {
      const values = await readFromCache();
      if (values) {
        // 等待 xx ms 后再读 persist，以确保优先从 context 取值
        await wait(timeout - TIME_PIECE);
        return { values, source: 'persist' };
      }
      await waitTimeout();
    } catch (e) {
      // TODO: 这里加埋点，上报接口异常
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg from persist cache failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // 兜底，超时取不到值返回默认值，也就是全部都是 false
  works.push(async () => {
    await wait(timeout + TIME_PIECE);
    if (strict) {
      throw new Error('Fetch Feature Flags timeout.');
    }
    return { values: {} as unknown as FEATURE_FLAGS, source: 'bailout' };
  });

  // 这里不可能返回 undefined，所以做一次强制转换
  const res = (await Promise.race(
    works.map(work => work()),
  )) as unknown as WorkResult;
  return res;
};

const normalize = (
  context?: Partial<PullFeatureFlagsParams>,
): PullFeatureFlagsParams => {
  const ctx = context || {};
  if (!ctx.fetchFeatureGating) {
    throw new Error('fetchFeatureGating is required');
  }
  const DEFAULT_CONTEXT: Partial<PullFeatureFlagsParams> = {
    timeout: 2000,
    strict: false,
    pollingInterval: DEFAULT_POLLING_INTERVAL,
  };
  const normalizeContext = Object.assign(
    DEFAULT_CONTEXT,
    Object.keys(ctx)
      // 只取不为 undefined 的东西
      .filter(k => typeof ctx[k] !== 'undefined')
      .reduce((acc, k) => ({ ...acc, [k]: ctx[k] }), {}),
  );
  return normalizeContext as PullFeatureFlagsParams;
};

const pullFeatureFlags = async (context?: Partial<PullFeatureFlagsParams>) => {
  const tracer = reporter.tracer({
    eventName: 'load-fg',
  });
  const normalizeContext = normalize(context);
  const { strict, pollingInterval } = normalizeContext;

  tracer.trace('start');
  const start = performance.now();
  const retry = async () => {
    // 出现错误时，自动重试
    await wait(pollingInterval);
    await pullFeatureFlags(context);
  };
  try {
    const res = await runPipeline(normalizeContext);

    const { values, source } = res;
    // TODO: 这里应该上报数量，后续 logger 提供相关能力后要改一下
    logger.persist.success({
      namespace: PACKAGE_NAMESPACE,
      message: `Load FG from ${source} start at ${start}ms and spend ${
        performance.now() - start
      }ms`,
    });
    tracer.trace('finish');

    featureFlagStorage.setFlags(values);
    if (['bailout', 'persist'].includes(source)) {
      await retry();
    }
  } catch (e) {
    logger.persist.error({
      namespace: PACKAGE_NAMESPACE,
      message: 'Failure to load FG',
      error: e as Error,
    });
    if (!strict) {
      featureFlagStorage.setFlags({} as unknown as FEATURE_FLAGS);
      await retry();
    } else {
      throw e;
    }
  }
};

export { pullFeatureFlags };
