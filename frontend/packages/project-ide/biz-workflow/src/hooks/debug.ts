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

import { ProjectResourceActionKey } from '@coze-arch/bot-api/plugin_develop';

export const workflowActions = [
  {
    key: ProjectResourceActionKey.Rename,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.Copy,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.MoveToLibrary,
    enable: false,
    hint: '不能移动到资源库',
  },
  {
    key: ProjectResourceActionKey.CopyToLibrary,
    enable: true,
    hint: '复制到资源库',
  },
  {
    // Switch to chatflow
    key: ProjectResourceActionKey.SwitchToChatflow,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.Delete,
    enable: true,
  },
];
