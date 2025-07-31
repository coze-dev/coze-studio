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

import React, { useMemo } from 'react';

import { TESTSET_CONNECTOR_ID } from '@coze-workflow/test-run/constants';
import { TestsetSelect, TestsetManageProvider } from '@coze-workflow/test-run';
import { userStoreService } from '@coze-studio/user-store';
import {
  type CaseDataDetail,
  ComponentType,
  type SetDefaultTestCaseReq,
} from '@coze-arch/idl/debugger_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';
import { useGetStartNode } from '@/components/test-run/hooks/use-get-start-node';

import styles from './test-set-select.module.less';

interface Props {
  onSelect?: (defaultCase?: SetDefaultTestCaseReq) => void;
}

export default function DefaultTestSetSelect({ onSelect }: Props) {
  const { getNode } = useGetStartNode();
  const nodeId = getNode()?.id;
  const userInfo = userStoreService.useUserInfo();
  const userId = userInfo?.user_id_str;
  const { spaceId, workflowId } = useGlobalState();

  const bizCtx = useMemo(
    () => ({
      connectorID: TESTSET_CONNECTOR_ID,
      bizSpaceID: spaceId,
      connectorUID: userId,
    }),
    [spaceId, userId],
  );

  const bizComponentSubject = useMemo(
    () => ({
      componentType: ComponentType.CozeStartNode,
      parentComponentType: ComponentType.CozeWorkflow,
      componentID: nodeId,
      parentComponentID: workflowId,
    }),
    [nodeId, workflowId],
  );

  const handleSelect = (caseDetail?: CaseDataDetail) => {
    const caseID = caseDetail?.caseBase?.caseID;

    if (caseID) {
      onSelect?.({
        bizCtx,
        bizComponentSubject,
        caseID,
      });
    } else {
      onSelect?.(undefined);
    }
  };

  return (
    <TestsetManageProvider
      spaceId={spaceId}
      workflowId={workflowId}
      userId={userInfo?.user_id_str}
      nodeId={getNode()?.id}
    >
      <div className={'w-full mb-12px mt-8px'}>
        <div
          className={
            'text-[14px] leading-20px coz-fg-primary mb-4px flex items-center'
          }
        >
          <span className={'font-medium'}>
            {I18n.t('default_test_set_default_test_set', {}, '默认测试集')}
          </span>
          <Tooltip
            content={I18n.t(
              'default_test_set_default_test_set_release_tips',
              {},
              '发布后可以提供其他用户作为测试集使用',
            )}
          >
            <IconCozInfoCircle />
          </Tooltip>
        </div>
        <TestsetSelect
          className={'!w-full'}
          onSelect={(data, changed, detail) => handleSelect(detail)}
          forbiddenOperation={true}
          dropdownClassName={styles['test-set-select-dropdown']}
          placeholder={I18n.t(
            'default_test_set_select_test_set',
            {},
            '选择测试集',
          )}
        />
      </div>
    </TestsetManageProvider>
  );
}
