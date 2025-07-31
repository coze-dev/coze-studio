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

export const EmptyRecommend = () => (
  <div className="flex h-full items-center justify-center">
    <EmptyState
      title={I18n.t('prompt_library_empty_title')}
      icon={<IconCozEmpty />}
      style={{ maxWidth: '300px' }}
    />
  </div>
);
