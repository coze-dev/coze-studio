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

import classNames from 'classnames';
import { OperateType } from '@coze-workflow/base/api';
import { withQueryClient } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { TextArea } from '@coze-arch/coze-design';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { Typography } from '@coze-arch/bot-semi';

import { ReferenceTable } from '@/components/workflow-references/publish-confirm-content';

import { DiffTable } from './diff-table';

const { Text } = Typography;

export const DiffModal = withQueryClient(
  ({
    spaceId,
    workflowId,
    operateType,
    referenceNum,
    onDescChange,
    needDesc,
  }: {
    spaceId: string;
    workflowId: string;
    operateType: OperateType;
    referenceNum?: number;
    onDescChange: (val: string) => void;
    needDesc: boolean;
  }) => {
    const [showDiff, setShowDiff] = useState(false);

    const confirmText =
      operateType === OperateType.SubmitOperate
        ? I18n.t('workflow_publish_multibranch_submit_comfirm_desc')
        : I18n.t('workflow_publish_multibranch_publish_confirm_content');

    return (
      <div>
        <div
          className={classNames(
            'min-w-[512px]',
            'text-sm',
            'text-[var(--semi-color-text-2)]',
            'mb-4',
            'font-[SF Pro Display]',
            {
              'w-[512px]': !showDiff && !referenceNum,
            },
          )}
        >
          {confirmText}
        </div>
        {needDesc && operateType === OperateType.SubmitOperate ? (
          <div className="mb-2">
            <TextArea
              placeholder={I18n.t('bmv_enter_version_description')}
              maxCount={500}
              onChange={val => {
                onDescChange(val);
              }}
            />
          </div>
        ) : null}
        {referenceNum ? <ReferenceTable num={referenceNum} /> : null}

        <Text
          link
          onClick={() => {
            sendTeaEvent(
              operateType === OperateType.SubmitOperate
                ? EVENT_NAMES.workflow_submit_difference
                : EVENT_NAMES.workflow_publish_difference,
              {
                workflow_id: workflowId,
                workspace_id: spaceId,
              },
            );

            setShowDiff(!showDiff);
          }}
        >
          {showDiff
            ? I18n.t('workflow_publish_multibranch_hidediff')
            : I18n.t('workflow_publish_multibranch_diff_btn')}
        </Text>

        {showDiff ? (
          <DiffTable
            spaceId={spaceId}
            workflowId={workflowId}
            operateType={operateType}
          />
        ) : null}
      </div>
    );
  },
);
