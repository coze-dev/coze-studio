import { useState, useCallback, type MouseEvent } from 'react';

type BtnHandle = (e: MouseEvent) => void;

type Destroy = () => void;

export const useHandlePromise = (
  onOk: BtnHandle,
  onCancel: BtnHandle,
  destroy: Destroy,
) => {
  // `autoOkLoading` 用于在 `confirm` 上的加载状态
  const [autoOkLoading, setAutoOkLoading] = useState<boolean>(false);

  // `autoCancelLoading` 用于在 `cancel` 上的加载状态
  const [autoCancelLoading, setAutoCancelLoading] = useState<boolean>(false);

  // `handleDestroy` 函数用于在 `destroy` 存在时调用它
  const handleDestroy = useCallback(() => {
    destroy && destroy();
  }, [destroy]);

  // `handlePromise` 函数用于处理可能是 Promise 的值
  // 如果值是 Promise，它会设置加载状态，并在 Promise 完成时重置加载状态和调用 `handleDestroy`
  // 如果值不是 Promise，它会直接调用 `handleDestroy`
  const handlePromise = useCallback(
    (promise, setLoading) => {
      if (promise && promise.then) {
        setLoading(true);

        const handleResult = () => {
          setLoading(false);
          handleDestroy();
        };

        promise.then(handleResult, handleResult);
      } else {
        handleDestroy();
      }
    },
    [handleDestroy],
  );

  // `handleOk` 函数用于处理 `onOk` 事件
  // 它会调用 `onOk`，并使用 `handlePromise` 处理结果
  const handleOk = useCallback(
    (e: MouseEvent) => {
      const res = onOk && onOk(e);
      handlePromise(res, setAutoOkLoading);
    },
    [onOk, handlePromise],
  );

  // `handleCancel` 函数用于处理 `onCancel` 事件
  // 它会调用 `onCancel`，并使用 `handlePromise` 处理结果
  const handleCancel = useCallback(
    (e: MouseEvent) => {
      const res = onCancel && onCancel(e);
      handlePromise(res, setAutoCancelLoading);
    },
    [onCancel, handlePromise],
  );

  return { handleOk, handleCancel, autoOkLoading, autoCancelLoading };
};
