import { type IOptions, normalizeRequest } from './utils';
import type { IMeta, CustomAPIMeta } from './types';

export interface ApiLike<T, K, O = unknown, B extends boolean = false> {
  (req: T, option?: O extends object ? IOptions & O : IOptions): Promise<K>;
  meta: IMeta;
  /** fork 一份实例，该实例具有可中止请求的能力  */
  withAbort: () => CancelAbleApi<T, K, O, B>;
}

export interface CancelAbleApi<T, K, O = unknown, B extends boolean = false>
  extends ApiLike<T, K, O, B> {
  // 中止请求
  abort: () => void;
  // 是否是取消
  isAborted: () => boolean;
}

/**
 * 自定义构建 api 方法
 * @param meta
 * @param cancelable
 * @param useCustom
 * @returns
 */
// eslint-disable-next-line max-params
export function createAPI<T extends {}, K, O = unknown, B extends boolean = false>(
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

    // 这里可以使用传进来的 req 作为默认映射，减少需要在 customAPI 中，需要手动绑定的情况
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
     * 这里加上 pending 状态的原因是，abortController.signal 的状态值只受控于 abortController.abort() 方法；
     * 不管请求是否完成或者异常，只要调用 abortController.abort(), abortController.signal.aborted 必定为 true，
     * 这样不好判断请求是否真 aborted；
     *
     * 这里改为，只有在请求 pending 的情况下，可执行 abort()，
     * isAborted === true 时，请求异常必定是因为手动 abort 导致的
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
 * 一些非泛化的接口，可以使用改方法构建，方便统一管理接口
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
