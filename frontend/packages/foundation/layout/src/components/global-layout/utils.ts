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

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

export const reportNavClick = (title: string) => {
  sendTeaEvent(EVENT_NAMES.tab_click, { content: title });
  sendTeaEvent(EVENT_NAMES.coze_space_sidenavi_ck, {
    item: title,
    navi_type: 'prime',
    need_login: true,
    have_access: true,
  });
};
