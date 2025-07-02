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
