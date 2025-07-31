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

import { Skeleton } from '@coze-arch/coze-design';

import { ProjectTemplateGroup } from './project-template-group';

export const CardSkeleton: React.FC = () => (
  <Skeleton.Image className="rounded-xl" />
);

export const TemplateGroupSkeleton: React.FC = () => (
  <ProjectTemplateGroup
    title={<Skeleton.Title className="w-120px" />}
    groupChildrenClassName="h-[200px]"
  >
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </ProjectTemplateGroup>
);
