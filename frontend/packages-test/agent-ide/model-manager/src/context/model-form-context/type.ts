import { type Dispatch, type SetStateAction } from 'react';

export interface ModelFormContextProps {
  isGenerationDiversityOpen: boolean;
  customizeValueMap: Record<string, Record<string, unknown>>;
  setGenerationDiversityOpen: Dispatch<SetStateAction<boolean>>;
  setCustomizeValues: (
    modelId: string,
    customizeValues: this['customizeValueMap'][string],
  ) => void;
  /**
   * 是否展示多样性设置区域的展开收起按钮
   *
   *  需求将详细配置区域放到了独立面板中，因此高度足够展示所有选项，不再需要折叠
   *
   * @default false
   */
  hideDiversityCollapseButton?: boolean;
}
