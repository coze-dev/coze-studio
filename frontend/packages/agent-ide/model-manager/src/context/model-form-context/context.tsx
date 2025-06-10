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
  ); // 隐藏展开收起按钮时则始终展开
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
