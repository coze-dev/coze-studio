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
 
import React, { useMemo, type FC } from 'react';

import { type WorkflowDetailInfoData } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozExit } from '@coze-arch/coze-design/icons';

import { useGlobalState } from '@/hooks';

import { type SubWorkflowDetailDTO, type Identifier } from '../types';

export const SubWorkflowLink: FC<{
  workflowDetail: SubWorkflowDetailDTO;
  identifier: Identifier;
}> = props => {
  const { workflowDetail, identifier } = props;
  const { workflowId } = identifier;
  const { getProjectApi, spaceId } = useGlobalState();
  const projectApi = getProjectApi();
  const isProjectWorkflow = Boolean(
    (workflowDetail as WorkflowDetailInfoData)?.project_id,
  );

  const subWorkflowProjectId = isProjectWorkflow
    ? (workflowDetail as WorkflowDetailInfoData)?.project_id
    : undefined;

  // 获取最新的 commitId
  const commitId = useMemo(() => {
    /** 来自资源库的流程需要获取最新的版本号 */
    const latestVersion = isProjectWorkflow
      ? undefined
      : workflowDetail.latest_flow_version;

    const { workflowVersion } = identifier;

    /** 是否是最新版本的子流程 */
    const isLatest = !workflowVersion || workflowVersion === latestVersion;
    return isLatest ? undefined : workflowDetail.commit_id;
  }, [workflowDetail, isProjectWorkflow]);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (IS_BOT_OP) {
      window.open(
        `${window.location.pathname}?workflow_id=${workflowId}`,
        '_blank',
      );
      e.stopPropagation();
      return;
    }
    // 存在 project id 时，是引用的 project 内的 workflow
    if (subWorkflowProjectId && projectApi?.navigate) {
      projectApi?.navigate(`/workflow/${workflowId}`);
    } else {
      let url = `/work_flow?space_id=${spaceId}&workflow_id=${workflowId}`;
      if (commitId) {
        url += `&version=${commitId}`;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <span
      className="cursor-pointer flex items-center w-full justify-between"
      onClick={e => handleClick(e)}
    >
      {I18n.t('workflow_subwf_jump_detail', {}, 'Workflow Detail')}
      <IconCozExit className="text-xs" />
    </span>
  );
};

export const createSubWorkflowLink = (
  workflowDetail: SubWorkflowDetailDTO,
  identifier: Identifier,
) => (
  <SubWorkflowLink workflowDetail={workflowDetail} identifier={identifier} />
);
