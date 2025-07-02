import { useEffect, useRef } from 'react';

import { type CustomValidatorPropsType } from '../../type';
import { PromiseController } from './promise-controller';

const useCustomValidator = ({
  validator,
  callback,
}: {
  validator: (data: CustomValidatorPropsType) => Promise<string>;
  callback: (label: string) => void;
}) => {
  const promiseController = useRef(
    new PromiseController<CustomValidatorPropsType, string>(),
  );

  useEffect(() => {
    promiseController.current
      .registerPromiseFn(validator)
      .registerCallbackFb(callback);
    return () => {
      promiseController.current?.dispose?.();
    };
  }, []);

  const validateAndUpdate = (data: CustomValidatorPropsType) => {
    promiseController.current?.excute(data);
  };

  return {
    validateAndUpdate,
  };
};

export { useCustomValidator };
