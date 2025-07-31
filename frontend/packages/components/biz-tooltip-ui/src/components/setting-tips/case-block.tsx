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

import React from 'react';

import s from './index.module.less';

export const CaseBlock: React.FC<{
  label: string;
  content: React.ReactNode;
}> = ({ label, content }) => (
  <div role="article" className="flex flex-col gap-[4px]">
    <div className={s['case-block-label']}>{label}</div>
    <div className="flex">{content}</div>
  </div>
);
