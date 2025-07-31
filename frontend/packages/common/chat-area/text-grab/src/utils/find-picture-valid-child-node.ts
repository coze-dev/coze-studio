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

import { getPictureNodeUrl } from './get-picture-node-url';

/**
 * Get a valid node for the node whose TagName is Picture
 * @param childNodes NodeListOf < Node > sub-node list
 * @returns Node | null
 */
export const findPictureValidChildNode = (childNodes: NodeListOf<Node>) =>
  Array.from(childNodes)
    .filter(node => getPictureNodeUrl(node))
    .at(0);
