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

import { type getOriginContentText } from '../utils/normalizer/get-origin-content-text';
import { type getNormalizeNodeList } from '../utils/normalizer/get-normalize-node-list';
import { type getHumanizedContentText } from '../utils/normalizer/get-humanize-content-text';

export interface SelectionData {
  humanizedContentText: ReturnType<typeof getHumanizedContentText>;
  originContentText: ReturnType<typeof getOriginContentText>;
  normalizeSelectionNodeList: ReturnType<typeof getNormalizeNodeList>;
  nodesAncestorIsMessageBox: boolean;
  ancestorAttributeValue: string | null;
  messageSource: number;
  direction: Direction;
}

export interface GrabPosition {
  x: number;
  y: number;
}

export const enum Direction {
  Forward = 'forward',
  Backward = 'backward',
  Unknown = 'unknown',
}
