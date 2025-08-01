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

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { EmptyState } from '@coze-arch/coze-design';

import EmptyPromptIcon from '../assets/empty-prompt-icon.svg';

export const UnselectedPrompt = (props: { className?: string }) => (
  <div className={props.className}>
    <EmptyState
      title={I18n.t('prompt_library_unselected')}
      icon={<img src={EmptyPromptIcon} alt="empty-prompt" />}
    />
  </div>
);

export const EmptyPrompt = (props: { className?: string }) => (
  <div className={props.className}>
    <EmptyState
      title={I18n.t('prompt_library_prompt_empty')}
      icon={<IconCozEmpty />}
    />
  </div>
);
