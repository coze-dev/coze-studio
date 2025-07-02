import { useEffect, useState } from 'react';

import { useRequireVerifyCenter } from './require-verify-center';

export const useRequireVerify = <T>({
  getVal,
  verify,
  onChange,
}: {
  getVal: () => T;
  verify: (val: T) => boolean;
  onChange?: (isError: boolean) => void;
}) => {
  const [showWarn, setShowWarn] = useState(false);
  const { registerVerifyFn } = useRequireVerifyCenter();

  const onTrigger = () => {
    const val = getVal();
    const verified = verify(val);
    const isError = !verified;
    setShowWarn(isError);
    onChange?.(isError);
  };

  useEffect(() => {
    const unregister = registerVerifyFn(onTrigger);
    return unregister;
  }, []);

  return {
    showWarn,
    onTrigger,
  };
};
