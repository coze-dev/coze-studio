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

import { createContext } from 'react';

export type NodeRenderScene =
  | 'new-node-render'
  | 'node-side-sheet'
  | 'old-node-render'
  | 'side-expand-modal'
  | undefined;

/** Used to determine under what scenarios the node-render front end is used */
export const NodeRenderSceneContext = createContext<NodeRenderScene>(undefined);
