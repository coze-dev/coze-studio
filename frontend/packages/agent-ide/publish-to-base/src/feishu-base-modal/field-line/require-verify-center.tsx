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

import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useRef,
} from 'react';

interface FieldsRequireCenter {
  verifyFns: Set<() => void>;
  triggerAllVerify: () => void;
  registerVerifyFn: (fn: () => void) => () => void;
}

const FieldsRequireCenterContext = createContext<FieldsRequireCenter>({
  verifyFns: new Set(),
  triggerAllVerify: () => undefined,
  registerVerifyFn: () => () => undefined,
});

export const FieldsRequireCenterWrapper: FC<PropsWithChildren> = ({
  children,
}) => {
  const fns = useRef(new Set<() => void>());

  return (
    <FieldsRequireCenterContext.Provider
      value={{
        verifyFns: fns.current,
        triggerAllVerify: () => {
          fns.current.forEach(fn => fn());
        },
        registerVerifyFn: fn => {
          fns.current.add(fn);

          return () => {
            fns.current.delete(fn);
          };
        },
      }}
    >
      {children}
    </FieldsRequireCenterContext.Provider>
  );
};

FieldsRequireCenterWrapper.displayName = 'FieldsRequireCenterWrapper';

export const useRequireVerifyCenter = (): Omit<
  FieldsRequireCenter,
  'verifyFns'
> => useContext(FieldsRequireCenterContext);
