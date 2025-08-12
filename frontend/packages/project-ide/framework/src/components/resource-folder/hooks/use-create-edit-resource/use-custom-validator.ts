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
