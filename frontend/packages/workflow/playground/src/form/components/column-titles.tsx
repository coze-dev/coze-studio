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

import React, { type FC } from 'react';

export interface Column {
  label: string;
  style?: React.CSSProperties;
  required?: boolean;
}

interface ColumnTitlesProps {
  columns: Column[];
}

export const ColumnTitles: FC<ColumnTitlesProps> = ({ columns }) => (
  <div className="flex gap-1 items-center text-xs font-normal leading-4 text-[rgba(28,29,35,0.35)] tracking-[0.12px] mb-[8px]">
    {columns.map(({ label, style, required = false }, index) => (
      <div key={index} style={style}>
        {label}
        {required ? (
          <span style={{ color: '#f93920', paddingLeft: 2 }}>*</span>
        ) : null}
      </div>
    ))}
  </div>
);
