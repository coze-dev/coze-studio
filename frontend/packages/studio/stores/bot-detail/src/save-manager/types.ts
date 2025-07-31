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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ItemType } from '@coze-arch/bot-api/developer_api';

// The scope server level that automatically saves the update interface will maintain ItemType, and other scope front-ends are maintained in ItemTypeExtra.
export enum ItemTypeExtra {
  MultiAgent = 1024,
  TTS = 1025,
  ConnectorType = 1026,
  ChatBackGround = 1027,
  Shortcut = 1028,
  QueryCollect = 1029,
  LayoutInfo = 1030,
  TaskInfo = 1031,
  TimeCapsule = 1032,
}

export type BizKey = ItemType | ItemTypeExtra | undefined;
export type ScopeStateType = any;
export { ItemType };
