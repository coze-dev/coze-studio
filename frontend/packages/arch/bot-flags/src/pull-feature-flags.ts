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
// Set 17 as the time sharding size
const TIME_PIECE = 17;

interface PullFeatureFlagsParams {
  // value timeout
  timeout: number;
  // In strict mode, no fallback logic will be inserted, and an error will be reported directly when the value cannot be obtained
  strict: boolean;
  // Rotation interval, production environment default 60 seconds; development & testing environment default 10 seconds
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
  // The timeout should not be less than 1s.
  const timeout = Math.max(to, ONE_SEC);
  const works: (() => Promise<WorkResult | undefined>)[] = [];
  const waitTimeout = wait.bind(null, timeout + ONE_SEC);

  // Take value from the online environment
  works.push(async () => {
    try {
      const values = await context.fetchFeatureGating();
      if (isObject(values)) {
        saveToCache(values);
        return { values, source: 'remote' };
      }
      await waitTimeout();
    } catch (e) {
      // TODO: Add event tracking here to report interface abnormalities
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg by "fetchFeatureGating" failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // Get value from browser global object
  // It needs to be judged here, only the browser environment will execute it.
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
      // Force and so on to time out, lest the entire works resolve to the wrong value
      await waitTimeout();
    } catch (e) {
      // TODO: Add event tracking here to report interface abnormalities
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg from context failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // fetch value from cache
  works.push(async () => {
    try {
      const values = await readFromCache();
      if (values) {
        // Wait for xx ms before reading persist to ensure that values are retrieved from context first
        await wait(timeout - TIME_PIECE);
        return { values, source: 'persist' };
      }
      await waitTimeout();
    } catch (e) {
      // TODO: Add event tracking here to report interface abnormalities
      logger.persist.error({
        namespace: PACKAGE_NAMESPACE,
        message: 'Fetch fg from persist cache failure',
        error: e as Error,
      });
      await waitTimeout();
    }
  });

  // Bottom line, the value cannot be obtained after timeout, and the default value is returned, that is, all are false.
  works.push(async () => {
    await wait(timeout + TIME_PIECE);
    if (strict) {
      throw new Error('Fetch Feature Flags timeout.');
    }
    return { values: {} as unknown as FEATURE_FLAGS, source: 'bailout' };
  });

  // It is impossible to return undefined here, so do a cast
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
      // Only take things that are not undefined
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
    // When an error occurs, automatically retry
    await wait(pollingInterval);
    await pullFeatureFlags(context);
  };
  try {
    const res = await runPipeline(normalizeContext);

    const { values, source } = res;
    // TODO: The quantity should be reported here, and it should be changed after the subsequent logger provides relevant capabilities.
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
