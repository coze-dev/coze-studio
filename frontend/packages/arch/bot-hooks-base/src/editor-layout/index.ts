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

/**
 * @Description 'LayoutContext' is used to pass layout-related information across components
 * @since 2024.03.05
 */
import { createContext, useContext } from 'react';

export enum PlacementEnum {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

interface ILayoutContext {
  placement: PlacementEnum;
}

const context = createContext<ILayoutContext>({
  placement: PlacementEnum.CENTER,
});

export const useLayoutContext = () => useContext(context);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LayoutContext = context.Provider;
