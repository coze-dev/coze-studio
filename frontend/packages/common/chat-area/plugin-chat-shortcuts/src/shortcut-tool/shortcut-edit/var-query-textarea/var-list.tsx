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

import { type PropsWithChildren, type FC } from 'react';

export const InputTypeTag: FC<PropsWithChildren> = ({ children }) => (
  <span className="coz-mg-secondary-hovered rounded-[4px] h-[16px] text-[12px] coz-fg-primary px-[5px] leading-[16px]">
    {children}
  </span>
);

export const VarListItem: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex justify-between items-center px-[4px] text-[14px] font-normal coz-fg-primary">
    {children}
  </div>
);
