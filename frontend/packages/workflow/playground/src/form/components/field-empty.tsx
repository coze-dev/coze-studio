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

import { type PropsWithChildren } from 'react';

import { IconCozEmpty } from '@coze-arch/coze-design/icons';

export interface FieldEmptyProps {
  text?: string;
  isEmpty?: boolean;
}

export function FieldEmpty({
  text = '',
  isEmpty = false,
  children,
}: PropsWithChildren<FieldEmptyProps>) {
  return (
    <>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[95px]">
          <IconCozEmpty className="mb-[4px] w-[32px] h-[32px] coz-fg-dim" />
          <div className="text-center text-[12px] leading-[16px] coz-fg-dim">
            {text}
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
