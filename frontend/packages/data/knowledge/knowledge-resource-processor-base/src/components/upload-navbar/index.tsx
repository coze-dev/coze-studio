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

import classNames from 'classnames';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services';
import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import { IconButton, Typography } from '@coze-arch/coze-design';

interface UploadActionNavbarProps {
  title: string;
}

// Upload page navigation bar
export const UploadActionNavbar = ({ title }: UploadActionNavbarProps) => {
  const params = useKnowledgeParams();
  const resourceNavigate = useDataNavigate();

  // TODO: Scene layer maintenance of hzf biz differentiation
  const fromProject = params.biz === 'project';
  const handleBack = () => {
    const query = getKnowledgeIDEQuery() as Record<string, string>;
    resourceNavigate.toResource?.('knowledge', params.datasetID, query);
  };

  return (
    <div
      className={classNames(
        'flex items-center justify-between shrink-0 h-[56px] coz-fg-primary',
        fromProject ? 'px-[12px]' : '',
      )}
    >
      <div className="flex items-center">
        <IconButton
          color="secondary"
          icon={<IconCozArrowLeft className="text-[16px]" />}
          iconPosition="left"
          className="!p-[8px]"
          onClick={handleBack}
        ></IconButton>
        <Typography.Text fontSize="16px" weight={500} className="ml-[8px]">
          {title}
        </Typography.Text>
      </div>
    </div>
  );
};
