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

import { useQuery } from '@tanstack/react-query';
import {
  workflowApi,
  type OperateType,
  type DiffContent,
} from '@coze-workflow/base/api';
import { UITag, UITable, UIEmpty, Typography } from '@coze-arch/bot-semi';
import { IconYesFilled } from '@coze-arch/bot-icons';
import { I18n } from '@coze-arch/i18n';

const { Text } = Typography;

import {
  CHANGE_TYPE_TAG_STYLES,
  ChangeType,
  DIFF_ITEM_NAMES,
  DIFF_ITEM_MODIFY_MSG,
} from '../../../constants';

const transformDiffContent = (diffContent?: DiffContent) => {
  if (!diffContent) {
    return;
  }
  return Object.keys(diffContent)
    .filter(key => diffContent[key].modify)
    .map(key => {
      const changes =
        DIFF_ITEM_MODIFY_MSG[key] ||
        `"${
          diffContent[key].before ||
          I18n.t('workflow_publish_multibranch_default_value')
        }" -> "${diffContent[key].after}"`;

      return {
        property: DIFF_ITEM_NAMES[key] || key,
        changeType: ChangeType.Modify,
        changes,
      };
    });
};

export const DiffTable = ({
  spaceId,
  workflowId,
  operateType,
}: {
  spaceId: string;
  workflowId: string;
  operateType: OperateType;
}) => {
  const { isLoading: loading, data } = useQuery({
    queryKey: ['workflow_diff'],
    queryFn: async () => {
      const { data: diffContent } = await workflowApi.ShowDifferences({
        space_id: spaceId,
        workflow_id: workflowId,
        type: operateType,
      });
      return transformDiffContent(diffContent);
    },
  });

  const columns = [
    {
      title: I18n.t('workflow_publish_multibranch_property'),
      dataIndex: 'property',
      width: 280,
    },
    {
      title: I18n.t('workflow_publish_multibranch_changetype'),
      dataIndex: 'changeType',
      width: 120,
      render: text => (
        <UITag style={{ ...CHANGE_TYPE_TAG_STYLES[text], flexShrink: 0 }}>
          {I18n.t('workflow_publish_multibranch_modify')}
        </UITag>
      ),
    },
    {
      title: I18n.t('workflow_publish_multibranch_changes'),
      dataIndex: 'changes',
      width: 512,
    },
  ];

  const isNoDiff = !loading && data?.length === 0;

  return (
    <div>
      {isNoDiff ? (
        <UIEmpty
          empty={{
            icon: <IconYesFilled />,
            title: I18n.t('workflow_publish_multibranch_nodiff'),
          }}
        />
      ) : (
        <div className="mt-8 max-w-[912px]">
          {!loading ? (
            <Text strong>
              {I18n.t('workflow_publish_multibranch_workflow_btn')}
            </Text>
          ) : null}

          <UITable
            tableProps={{
              columns,
              dataSource: data,
              pagination: false,
              loading,
            }}
          />
        </div>
      )}
    </div>
  );
};
