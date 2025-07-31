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

import { useState } from 'react';

import { type DiffContentMeta } from '@coze-workflow/base/api';
import {
  Typography,
  UITag,
  Table,
  Checkbox,
  Select,
  Space,
  Spin,
} from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { useMerge } from '../use-merge';
import {
  DIFF_ITEM_MODIFY_MSG,
  Retained,
  CHANGE_TYPE_TAG_STYLES,
  ChangeType,
} from '../../../constants';

const { Text } = Typography;

const mergeOptions = [
  {
    label: I18n.t('workflow_publish_multibranch_my_draft'),
    value: Retained.Draft,
  },
  {
    label: I18n.t('workflow_publish_multibranch_latest_version'),
    value: Retained.Submit,
  },
];

const renderDiff = (key: string, diff: DiffContentMeta) => {
  const { modify, before, after } = diff || {};

  if (!modify) {
    return '-';
  }

  return (
    <Space spacing={8}>
      <UITag
        style={{ ...CHANGE_TYPE_TAG_STYLES[ChangeType.Modify], flexShrink: 0 }}
      >
        {I18n.t('workflow_publish_multibranch_modify')}
      </UITag>
      {DIFF_ITEM_MODIFY_MSG[key] ||
        `"${
          before || I18n.t('workflow_publish_multibranch_default_value')
        }" -> "${after}"`}
    </Space>
  );
};

const MergeTable = () => {
  const { data, loading, retainedResult, handleRetained } = useMerge();

  const [onlyConflict, setOnlyConflict] = useState(false);

  const columns = [
    {
      title: I18n.t('workflow_publish_multibranch_property'),
      dataIndex: 'property',
      width: 200,
    },
    {
      title: I18n.t('workflow_publish_multibranch_latest_version'),
      dataIndex: 'lastVersion',
      width: 320,
      render: (text, { key, lastVersion }) => renderDiff(key, lastVersion),
    },
    {
      title: I18n.t('workflow_publish_multibranch_my_draft'),
      dataIndex: 'myDraft',
      width: 320,
      render: (text, { key, myDraft }) => renderDiff(key, myDraft),
    },
    {
      title: I18n.t('workflow_publish_multibranch_RetainedResult'),
      dataIndex: 'retainedResult',
      width: 120,
      render: (text, { lastVersion, myDraft, isConflict, key }) => {
        if (isConflict) {
          return (
            <Select
              size="small"
              style={{
                width: 104,
                height: 24,
              }}
              placeholder={I18n.t('workflow_publish_multibranch_PleaseSelect')}
              value={retainedResult[key]}
              optionList={mergeOptions}
              onChange={result => handleRetained({ [key]: result as string })}
            />
          );
        }

        return (
          <div>
            {lastVersion?.modify
              ? I18n.t('workflow_publish_multibranch_latest_version')
              : I18n.t('workflow_publish_multibranch_my_draft')}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Spin size="large" wrapperClassName="w-full mt-20" />;
  }

  return (
    <div className="overflow-auto  pt-4 pb-9 flex flex-col items-center">
      <div>
        <Checkbox
          checked={onlyConflict}
          onChange={e => setOnlyConflict(!!e.target.checked)}
        >
          {I18n.t('workflow_publish_multibranch_view_conflict')}
        </Checkbox>
        <div className="mt-6">
          <Text strong>
            {I18n.t('workflow_publish_multibranch_workflow_btn')}
          </Text>
          <Table
            columns={columns}
            dataSource={data.filter(item => !onlyConflict || item.isConflict)}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MergeTable;
