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

import { DataViewer } from '../data-viewer';
import { type BaseLog } from '../../types';
import { LogWrap } from './log-wrap';

export const NormalLogParser: React.FC<{ log: BaseLog }> = ({ log }) => (
  <LogWrap label={log.label} source={log.data} copyTooltip={log.copyTooltip}>
    <DataViewer data={log.data} emptyPlaceholder={log.emptyPlaceholder} />
  </LogWrap>
);
