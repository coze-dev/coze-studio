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

import { useMemo } from 'react';

import {
  type GetLLMNodeFCSettingDetailResponse,
  WorkflowMode,
} from '@coze-arch/idl/workflow_api';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ILibraryList,
  type ILibraryItem,
} from '@coze-common/editor-plugins/library-insert';

import { useGlobalState } from '@/hooks';

import { getSkillsQueryParams } from '../skills/utils';
import { useQuerySettingDetail } from '../skills/use-query-setting-detail';
import type { BoundKnowledgeItem, BoundSkills } from '../skills/types';

interface Props {
  fcParam?: BoundSkills;
}

enum DatasetFormat {
  Doc = 0,
  Table = 1,
  Image = 2,
  Database = 3,
}

const formatSkills2Libraries = (
  skillsDetail: GetLLMNodeFCSettingDetailResponse,
  fcParam?: BoundSkills,
): ILibraryList => {
  const result: ILibraryList = [];

  const plugins: ILibraryItem[] | undefined =
    fcParam?.pluginFCParam?.pluginList?.map(item => {
      const pluginDetail = skillsDetail?.plugin_detail_map?.[item.plugin_id];
      const apiDetail = skillsDetail?.plugin_api_detail_map?.[item.api_id];

      return {
        type: 'plugin',
        id: item.plugin_id,
        icon_url: pluginDetail?.icon_url || '',
        name: apiDetail?.name || '',
        desc: apiDetail?.description || '',
        api_id: apiDetail?.id,
      };
    });

  const workflows: ILibraryItem[] | undefined =
    fcParam?.workflowFCParam?.workflowList
      ?.filter(item => {
        const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];
        return (
          detail?.flow_mode === WorkflowMode.Workflow ||
          detail?.flow_mode === WorkflowMode.ChatFlow
        );
      })
      ?.map(item => {
        const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];

        return {
          type: 'workflow',
          id: item.workflow_id,
          icon_url: detail?.icon_url || '',
          name: detail?.name || '',
          desc: detail?.description || '',
        };
      });

  const imageflows: ILibraryItem[] | undefined =
    fcParam?.workflowFCParam?.workflowList
      ?.filter(item => {
        const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];
        return detail?.flow_mode === WorkflowMode.Imageflow;
      })
      ?.map(item => {
        const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];

        return {
          type: 'imageflow',
          id: item.workflow_id,
          icon_url: detail?.icon_url || '',
          name: detail?.name || '',
          desc: detail?.description || '',
        };
      });

  const genDatasetFilter =
    (target: DatasetFormat) => (item: BoundKnowledgeItem) => {
      const detail = skillsDetail?.dataset_detail_map?.[item.id];
      return detail?.format_type === target;
    };

  const tables: ILibraryItem[] | undefined =
    fcParam?.knowledgeFCParam?.knowledgeList
      ?.filter(genDatasetFilter(DatasetFormat.Table))
      ?.map(item => {
        const detail = skillsDetail?.dataset_detail_map?.[item.id];

        return {
          type: 'table',
          id: item.id,
          icon_url: detail?.icon_url || '',
          name: detail?.name || '',
          desc: '',
        };
      });

  const images: ILibraryItem[] | undefined =
    fcParam?.knowledgeFCParam?.knowledgeList
      ?.filter(genDatasetFilter(DatasetFormat.Image))
      ?.map(item => {
        const detail = skillsDetail?.dataset_detail_map?.[item.id];

        return {
          type: 'image',
          id: item.id,
          icon_url: detail?.icon_url || '',
          name: detail?.name || '',
          desc: '',
        };
      });

  const docs: ILibraryItem[] | undefined =
    fcParam?.knowledgeFCParam?.knowledgeList
      ?.filter(genDatasetFilter(DatasetFormat.Doc))
      ?.map(item => {
        const detail = skillsDetail?.dataset_detail_map?.[item.id];

        return {
          type: 'text',
          id: item.id,
          icon_url: detail?.icon_url || '',
          name: detail?.name || '',
          desc: '',
        };
      });

  if (plugins?.length) {
    result.push({
      type: 'plugin',
      items: plugins,
    });
  }

  if (workflows?.length) {
    result.push({
      type: 'workflow',
      items: workflows,
    });
  }

  if (imageflows?.length) {
    result.push({
      type: 'imageflow',
      items: imageflows,
    });
  }

  if (tables?.length) {
    result.push({
      type: 'table',
      items: tables,
    });
  }

  if (images?.length) {
    result.push({
      type: 'image',
      items: images,
    });
  }

  if (docs?.length) {
    result.push({
      type: 'text',
      items: docs,
    });
  }

  return result;
};

export default function useSkillLibraries(props: Props) {
  const { fcParam = {} } = props;

  const globalState = useGlobalState();
  const node = useCurrentEntity();

  const { data: skillsDetail, refetch } = useQuerySettingDetail({
    workflowId: globalState.workflowId,
    spaceId: globalState.spaceId,
    nodeId: node.id,
    ...getSkillsQueryParams(fcParam),
  });

  const libraries = useMemo(
    () =>
      formatSkills2Libraries(
        skillsDetail as GetLLMNodeFCSettingDetailResponse,
        fcParam,
      ),
    [skillsDetail, fcParam],
  );

  return {
    libraries,
    refetch,
  };
}
