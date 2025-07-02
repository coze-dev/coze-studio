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

  // 初始化Project角色数据
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
