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
 
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

/**
 * 这里要跟表单内的 knowledge list 用同一个 useDataSetInfos
 * useDataSetInfos 内部会缓存数据，当表单内选中新的知识库时，不用重新发请求拉数据
 */

import { useDataSetInfos } from '@/hooks';

import { OverflowTagList } from './overflow-tag-list';
import { Field } from './field';

export function Knowledge() {
  const { data } = useWorkflowNode();
  const knowledge = data?.inputs?.datasetParameters?.datasetParam ?? [];
  const { dataSets } = useDataSetInfos({ ids: knowledge });
  return (
    <Field
      label={I18n.t('workflow_detail_knowledge_knowledge')}
      isEmpty={knowledge.length === 0}
    >
      <OverflowTagList
        value={dataSets.map(d => ({
          // 运维平台直接展示 ID 即可，因为运维平台无法拉取到实际的知识库信息
          label: IS_BOT_OP ? d.dataset_id : d.name,
          icon: (
            <img className="w-[16px] h-[16px] rounded-mini" src={d.icon_url} />
          ),
        }))}
      />
    </Field>
  );
}
