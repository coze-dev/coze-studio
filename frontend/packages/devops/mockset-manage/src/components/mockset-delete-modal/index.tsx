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

import { useRequest } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIModal } from '@coze-arch/bot-semi';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import {
  type BizCtx,
  type MockSet,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import { getEnvironment, getPluginInfo } from '../../utils';

export interface MockSetInfo {
  detail: MockSet;
  ctx?: {
    mockSubjectInfo?: ComponentSubject;
    bizCtx?: BizCtx;
  };
}

export interface MockSetEditModalProps {
  visible: boolean;
  zIndex?: number;
  mockSetInfo: MockSetInfo;
  onSuccess?: () => void;
  onCancel?: () => void;
  needResetPopoverContainer?: boolean;
}

function isValidRefCount(refCount: number) {
  return refCount >= 0;
}

export const MockSetDeleteModal = ({
  visible,
  mockSetInfo,
  onSuccess,
  onCancel,
  zIndex,
  needResetPopoverContainer,
}: MockSetEditModalProps) => {
  const {
    detail: { id },
    ctx,
  } = mockSetInfo || {};
  const [mockSetRefCount, setMockSetRefCount] = useState(-1);

  // Space information
  const spaceType = useSpaceStore(s => s.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const { run: fetchRefInfo } = useRequest(
    async () => {
      const { spaceID } = getPluginInfo(
        ctx?.bizCtx || {},
        ctx?.mockSubjectInfo || {},
      );
      try {
        const { usersUsageCount } = await debuggerApi.GetMockSetUsageInfo({
          mockSetID: id,
          spaceID,
        });
        setMockSetRefCount(Number(usersUsageCount ?? 0));
      } catch (e) {
        logger.error({
          error: e as Error,
          eventName: 'fetch_mockset_ref_fail',
        });
        setMockSetRefCount(0);
      }
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    fetchRefInfo();
  }, [mockSetInfo]);

  const renderTitle =
    mockSetRefCount > 0
      ? I18n.t('people_using_mockset_delete', { num: mockSetRefCount })
      : I18n.t('delete_the_mockset');

  const handleOk = async () => {
    const { toolID, spaceID } = getPluginInfo(
      ctx?.bizCtx || {},
      ctx?.mockSubjectInfo || {},
    );
    const basicParams: ParamsTypeDefine[EVENT_NAMES.del_mockset_front] = {
      environment: getEnvironment(),
      workspace_id: spaceID || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: toolID || '',
      mock_set_id: String(id) || '',
      status: 1,
    };
    try {
      id && (await debuggerApi.DeleteMockSet({ id, bizCtx: ctx?.bizCtx }));
      onSuccess?.();
      sendTeaEvent(EVENT_NAMES.del_mockset_front, {
        ...basicParams,
        status: 0,
      });
    } catch (e) {
      sendTeaEvent(EVENT_NAMES.del_mockset_front, {
        ...basicParams,
        status: 1,
        error: (e as Error | undefined)?.message as string,
      });
    }
  };
  return (
    <UIModal
      type="info"
      zIndex={zIndex}
      icon={
        <IconAlertCircle
          size="extra-large"
          className="inline-flex text-[#FF2710]"
        />
      }
      title={renderTitle}
      visible={isValidRefCount(mockSetRefCount) && visible}
      onCancel={onCancel}
      onOk={handleOk}
      getPopupContainer={
        needResetPopoverContainer ? () => document.body : undefined
      }
      okType="danger"
    >
      {I18n.t('operation_cannot_be_reversed')}
    </UIModal>
  );
};
