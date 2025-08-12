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

import { Tag, type TagProps, Typography } from '@coze-arch/coze-design';

export interface PublishStepTitleProps {
  title: string;
  tag?: string;
  color?: TagProps['color'];
}

export function PublishStepTitle({ title, tag, color }: PublishStepTitleProps) {
  return (
    <div className="flex items-center gap-[4px]">
      <Typography.Text
        className="leading-[20px] font-normal"
        data-testid="project.publish.result"
      >
        {title}
      </Typography.Text>
      {typeof tag === 'string' ? (
        <Tag size="mini" color={color}>
          {tag}
        </Tag>
      ) : null}
    </div>
  );
}
