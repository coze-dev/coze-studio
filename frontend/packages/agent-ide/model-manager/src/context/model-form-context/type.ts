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
