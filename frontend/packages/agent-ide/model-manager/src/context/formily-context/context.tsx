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
  type PropsWithChildren,
  createContext,
  useState,
  useEffect,
} from 'react';

import { type FormilyModule, type FormilyContextProps } from './type';

export const FormilyContext = createContext<FormilyContextProps>({
  formilyModule: { status: 'unInit', formilyReact: null, formilyCore: null },
  retryImportFormily: () => void 0,
});

export const FormilyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [formilyModule, setFormilyModule] = useState<FormilyModule>({
    status: 'unInit',
    formilyCore: null,
    formilyReact: null,
  });

  const importFormily = async () => {
    setFormilyModule({
      formilyCore: null,
      formilyReact: null,
      status: 'loading',
    });
    try {
      const [formilyCore, formilyReact] = await Promise.all([
        import('@formily/core'),
        import('@formily/react'),
      ]);
      setFormilyModule({
        status: 'ready',
        formilyCore,
        formilyReact,
      });
    } catch (error) {
      setFormilyModule({
        status: 'error',
        formilyCore: null,
        formilyReact: null,
      });
      throw error;
    }
  };

  useEffect(() => {
    importFormily();
  }, []);

  return (
    <FormilyContext.Provider
      value={{
        formilyModule,
        retryImportFormily: importFormily,
      }}
    >
      {children}
    </FormilyContext.Provider>
  );
};
