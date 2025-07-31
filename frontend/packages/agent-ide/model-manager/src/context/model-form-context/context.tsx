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

import { type PropsWithChildren, createContext, useState, useRef } from 'react';

import { cloneDeep } from 'lodash-es';

import { type ModelFormContextProps } from './type';

export const ModelFromContext = createContext<ModelFormContextProps>({
  customizeValueMap: {},
  isGenerationDiversityOpen: false,
  setCustomizeValues: () => 0,
  setGenerationDiversityOpen: () => 0,
});

export const ModelFormProvider: React.FC<
  PropsWithChildren<Pick<ModelFormContextProps, 'hideDiversityCollapseButton'>>
> = ({ hideDiversityCollapseButton = false, children }) => {
  const [isGenerationDiversityOpen, setGenerationDiversityOpen] = useState(
    hideDiversityCollapseButton,
  ); // Always expand when hiding the expand hide button
  const customizeValueMapRef = useRef<
    ModelFormContextProps['customizeValueMap']
  >({});
  const setCustomizeValues: ModelFormContextProps['setCustomizeValues'] = (
    modelId,
    customizeValues,
  ) => {
    customizeValueMapRef.current[modelId] = cloneDeep(customizeValues);
  };
  return (
    <ModelFromContext.Provider
      value={{
        hideDiversityCollapseButton,
        isGenerationDiversityOpen,
        setCustomizeValues,
        customizeValueMap: customizeValueMapRef.current,
        setGenerationDiversityOpen,
      }}
    >
      {children}
    </ModelFromContext.Provider>
  );
};
