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

import { useParams } from 'react-router-dom';
import React from 'react';

import { useDestoryProject } from '@coze-common/auth';
import { useInitProjectRole } from '@coze-common/auth-adapter';

import { ProjectIDE } from './index';

const ProjectIDEContainer = ({
  spaceId,
  projectId,
  version,
}: {
  spaceId: string;
  projectId: string;
  version: string;
}) => {
  useDestoryProject(projectId);

  // Initializing Project Role Data
  const isCompleted = useInitProjectRole(spaceId, projectId);

  return isCompleted ? (
    <ProjectIDE spaceId={spaceId} projectId={projectId} version={version} />
  ) : null;
};

const Page = () => {
  const { space_id: spaceId, project_id: projectId } = useParams<{
    space_id: string;
    project_id: string;
  }>();

  const searchParams = new URLSearchParams(window.location.search);

  const commitVersion = searchParams.get('commit_version');

  return (
    <ProjectIDEContainer
      key={projectId}
      spaceId={spaceId || ''}
      projectId={projectId || ''}
      version={commitVersion || ''}
    />
  );
};

export default Page;
