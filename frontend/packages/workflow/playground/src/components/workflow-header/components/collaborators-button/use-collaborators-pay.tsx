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
 
import { useCallback, useMemo, useState, useEffect } from 'react';

import {
  workflowApi,
  UserBehaviorType,
  AuthType,
} from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { useGlobalState } from '../../../../hooks';
import { CollaborationCloseIntroduction } from './introduction';

interface Limit {
  workflow?: number;
  collaborators?: number;
}

const fetchCollaboratorsPayPass = async ({ workflowId, spaceId }) => {
  const { data } = await workflowApi.UserBehaviorAuth({
    workflow_id: workflowId,
    space_id: spaceId,
    action_type: UserBehaviorType.OpenCollaborators,
    only_config_item: false,
  });
  const pass = data?.auth_type === AuthType.Pass;
  const canUpdate = data?.can_upgrade;
  const workflowCount = data?.config.workflow_count;
  const collaboratorsCount = data?.config.collaborators_count;

  return {
    pass,
    canUpdate,
    workflowCount,
    collaboratorsCount,
  };
};

const useCollaboratorsPay = () => {
  const globalState = useGlobalState();
  const { workflowId, spaceId, isCollaboratorMode } = globalState;
  // release 版本才收费
  const isNeedPay = IS_RELEASE_VERSION;
  // 是否允许打开多人协作
  const [disabledOpen, setDisabledOpen] = useState(isNeedPay ? true : false);
  const [limit, setLimit] = useState<Limit | null>(null);

  const textMap = useMemo(
    () => ({
      // 协作者可以共同编辑、提交修改和发布 Workflow。
      titleTooltip: I18n.t('wmv_collaborate_collabration_explain'),
      intro: <CollaborationCloseIntroduction />,
      // 仅当未启用时，才判断是否需要禁用启用按钮
      disableTooltip:
        !isCollaboratorMode && disabledOpen
          ? I18n.t('bz_upgrade_detail')
          : undefined,
    }),
    [disabledOpen, isCollaboratorMode],
  );

  const text = useMemo(() => {
    if (!limit) {
      return undefined;
    }
    if (isCollaboratorMode) {
      return {
        title: I18n.t('bz_upgrade_detail'),
        desc: I18n.t('bz_coop_upgrade_for_more', {
          max_coop: limit.collaborators,
        }),
        button: I18n.t('bz_upgrade_button'),
      };
    }
    return {
      title: I18n.t('bz_upgrade_detail'),
      desc: I18n.t('bz_reache_max', {
        type_name: 'Workflow',
        max_cnt: limit.workflow,
      }),
      button: I18n.t('bz_upgrade_button'),
    };
  }, [isCollaboratorMode, limit]);

  const fetch = useCallback(async () => {
    setLimit(null);
    const { pass, canUpdate, workflowCount, collaboratorsCount } =
      await fetchCollaboratorsPayPass({ workflowId, spaceId });

    /** 不能继续升级，高亮块不显示 */
    if (!canUpdate) {
      setLimit(null);
    } else {
      setLimit({
        workflow: workflowCount,
        collaborators: collaboratorsCount,
      });
    }

    setDisabledOpen(!pass);
  }, [workflowId, spaceId]);

  useEffect(() => {
    if (isNeedPay) {
      fetch();
    }
  }, [fetch, isNeedPay, isCollaboratorMode]);

  return {
    text,
    textMap,
  };
};

export { useCollaboratorsPay };
