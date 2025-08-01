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
