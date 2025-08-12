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
import { IconCozPlusFill } from '@coze-arch/coze-design/icons';

import { ProjectTemplateCardUI } from './project-template-card';

export const CreateEmptyProjectUI: React.FC<{
  onClick: (() => void) | undefined;
}> = ({ onClick }) => (
  <ProjectTemplateCardUI
    onClick={onClick}
    className="h-200px flex items-center justify-center flex-col coz-fg-primary"
  >
    <IconCozPlusFill />
    <div className="py-6px px-8px text-[14px] leading-[20px] font-medium">
      {I18n.t('creat_project_creat_new_project')}
    </div>
  </ProjectTemplateCardUI>
);
