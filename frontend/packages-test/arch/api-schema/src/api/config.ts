import { createAPI as apiFactory } from '@coze-arch/idl2ts-runtime';
import { type IMeta } from '@coze-arch/idl2ts-runtime';
import { axiosInstance } from '@coze-arch/bot-http';

export function createAPI<
  T extends {},
  K,
  O = unknown,
  B extends boolean = false,
>(meta: IMeta, cancelable?: B) {
  return apiFactory<T, K, O, B>(meta, cancelable, false, {
    config: {
      clientFactory: _meta => async (uri, init, options) =>
        axiosInstance.request({
          url: uri,
          method: init.method ?? 'GET',
          data: ['POST', 'PUT', 'PATCH'].includes(
            (init.method as string | undefined)?.toUpperCase() ?? '',
          )
            ? init.body && meta.serializer !== 'form'
              ? JSON.stringify(init.body)
              : init.body
            : undefined,
          params: ['GET', 'DELETE'].includes(
            (init.method as string | undefined)?.toUpperCase() ?? '',
          )
            ? init.body
            : undefined,
          headers: {
            ...init.headers,
            ...(options?.headers ?? {}),
            'x-requested-with': 'XMLHttpRequest',
          },
          // @ts-expect-error -- custom params
          __disableErrorToast: options?.__disableErrorToast,
        }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}
