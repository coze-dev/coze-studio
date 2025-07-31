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

import { type IOptions, normalizeRequest } from './utils';
import type { IMeta, CustomAPIMeta } from './types';

export interface ApiLike<T, K, O = unknown, B extends boolean = false> {
  (req: T, option?: O extends object ? IOptions & O : IOptions): Promise<K>;
  meta: IMeta;
  /** Fork an instance that has the ability to abort requests  */
  withAbort: () => CancelAbleApi<T, K, O, B>;
}

export interface CancelAbleApi<T, K, O = unknown, B extends boolean = false>
  extends ApiLike<T, K, O, B> {
  // abort request
  abort: () => void;
  // Is it cancelled?
  isAborted: () => boolean;
}

/**
 * Custom build API method
 * @param meta
 * @param cancelable
 * @param useCustom
 * @returns
 */
// eslint-disable-next-line max-params
export function createAPI<
  T extends {},
  K,
  O = unknown,
  B extends boolean = false,
>(
  meta: IMeta,
  cancelable?: B,
  useCustom = false,
  customOption?: O extends object ? IOptions & O : IOptions,
): B extends false ? ApiLike<T, K, O, B> : CancelAbleApi<T, K, O, B> {
  let abortController: AbortController | undefined;
  let pending: undefined | boolean;
  async function api(
    req: T,
    option: O extends object ? IOptions & O : IOptions,
  ): Promise<K> {
    pending = true;

    option = { ...(option || {}), ...customOption };

    // Here, you can use the incoming req as the default mapping to reduce the need for manual binding in the customAPI
    if (useCustom) {
      const mappingKeys: string[] = Object.keys(meta.reqMapping)
        .map(key => meta.reqMapping[key])
        .reduce((a, b) => [...a, ...b], []);
      const defaultFiled = Object.keys(req).filter(
        field => !mappingKeys.includes(field),
      );

      if (['POST', 'PUT', 'PATCH'].includes(meta.method)) {
        meta.reqMapping.body = [
          ...defaultFiled,
          ...(meta.reqMapping.body || []),
        ];
      }
      if (['GET', 'DELETE'].includes(meta.method)) {
        meta.reqMapping.query = [
          ...defaultFiled,
          ...(meta.reqMapping.query || []),
        ];
      }
    }

    const { client, uri, requestOption } = normalizeRequest(req, meta, option);

    if (!abortController && cancelable) {
      abortController = new AbortController();
    }
    if (abortController) {
      requestOption.signal = abortController.signal;
    }

    try {
      const res = await client(uri, requestOption, option);
      return res;
    } finally {
      pending = false;
    }
  }

  function abort() {
    /**
     * The reason for adding the pending state here is that the state value of abortController.signal is only controlled by the abortController.abort () method;
     * No matter whether the request is completed or abnormal, as long as abortController.abort () is called, abortController.signal.aborted must be true.
     * This makes it difficult to determine whether the request is really aborted.
     *
     * This is changed to abort () only if the request is pending.
     * When isAborted === true, the request exception must be caused by manual abort
     */
    if (pending === true && cancelable && abortController) {
      abortController.abort();
    }
  }

  function isAborted() {
    return !!abortController?.signal.aborted;
  }

  function withAbort() {
    return createAPI<T, K, O, true>(meta, true, useCustom, customOption);
  }

  api.meta = meta;
  api.withAbort = withAbort;
  if (cancelable) {
    api.abort = abort;
    api.isAborted = isAborted;
  }
  return api as any;
}

/**
 * Some non-generalized interfaces can be built using modified methods to facilitate unified management of interfaces
 * @param customAPIMeta
 * @param cancelable
 * @returns
 * @example
 *
 */
export function createCustomAPI<
  T extends {},
  K,
  O = unknown,
  B extends boolean = false,
>(customAPIMeta: CustomAPIMeta, cancelable?: B) {
  const name = `${customAPIMeta.method}_${customAPIMeta.url}`;
  const meta: IMeta = {
    ...customAPIMeta,
    reqMapping: customAPIMeta.reqMapping || {},
    name,
    service: 'CustomAPI',
    schemaRoot: '',
    reqType: `${name}_req`,
    resType: `${name}_res`,
  };
  return createAPI<T, K, O, B>(meta, cancelable, true);
}
