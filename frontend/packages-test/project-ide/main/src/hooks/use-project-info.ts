import { useEffect, useState } from 'react';

import {
  type User,
  type IntelligenceBasicInfo,
  type IntelligencePublishInfo,
} from '@coze-arch/idl/intelligence_api';
import { type ProjectFormValues } from '@coze-studio/project-entity-adapter';
import { useIDEService, useIDEGlobalStore } from '@coze-project-ide/framework';

import { ProjectInfoService } from '../plugins/create-app-plugin/project-info-service';

export const useProjectInfo = () => {
  const projectInfoService =
    useIDEService<ProjectInfoService>(ProjectInfoService);
  const [loading, setLoading] = useState(true);
  const [projectInfo, setProjectInfo] = useState<
    IntelligenceBasicInfo | undefined
  >(projectInfoService.projectInfo?.projectInfo);
  const [publishInfo, setPublishInfo] = useState<
    IntelligencePublishInfo | undefined
  >(projectInfoService?.projectInfo?.publishInfo);
  const [ownerInfo, setOwnerInfo] = useState<User | undefined>(
    projectInfoService?.projectInfo?.ownerInfo,
  );
  const [initialValue, setInitialValue] = useState<ProjectFormValues>(
    projectInfoService.initialValue,
  );

  const { patch } = useIDEGlobalStore(store => ({
    patch: store.patch,
  }));

  useEffect(() => {
    if (projectInfoService.projectInfo) {
      setLoading(false);
    }
    patch({ projectInfo: { projectInfo, publishInfo, ownerInfo } });
    const projectDisposable = projectInfoService.onProjectInfoUpdated(() => {
      setLoading(false);
      setProjectInfo(projectInfoService.projectInfo?.projectInfo);
      setPublishInfo(projectInfoService.projectInfo?.publishInfo);
      setOwnerInfo(projectInfoService.projectInfo?.ownerInfo);
      patch({ projectInfo: projectInfoService.projectInfo });
      setInitialValue(projectInfoService.initialValue);
    });
    return () => {
      projectDisposable?.dispose?.();
    };
  }, []);

  return {
    loading,
    initialValue,
    projectInfo,
    ownerInfo,
    publishInfo,
    updateProjectInfo:
      projectInfoService.updateProjectInfo.bind(projectInfoService),
  };
};
