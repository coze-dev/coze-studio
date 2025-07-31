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

/**
 * Publish to multiple environments
 * Is a single module, abstracted into a component
 */
import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { SplitButtonGroup, Menu, IconButton } from '@coze-arch/coze-design';
import {
  OperateType,
  type PublishWorkflowRequest,
} from '@coze-arch/bot-api/workflow_api';
import { useNavigate } from 'react-router-dom';

import { useGlobalState } from '@/hooks';

import { TooltipWithDisabled } from './tooltip-with-disabled';
import { PublishWithDiff } from './publish-with-diff';

import css from './publish-env.module.less';

const usePublishEnv = () => {
  const navigate = useNavigate();
  const { workflowId, spaceId, isCollaboratorMode, info, isDevSpace } =
    useGlobalState();
  const { vcsData, plugin_id } = info;

  /** Whether to support the release of PPE */
  const canPublishEnv = useMemo(
    () => isCollaboratorMode && vcsData?.can_edit && isDevSpace,
    [isDevSpace, isCollaboratorMode, vcsData],
  );
  /** It's never been published. */
  const neverPublished = useMemo(
    () => !plugin_id || plugin_id === '0',
    [plugin_id],
  );

  const onPublishEnv = () => {
    navigate(
      `/space/${spaceId}/workflow/${workflowId}/publish?` +
        `commit_id=${vcsData?.submit_commit_id}&type=${OperateType.SubmitOperate}`,
      {
        replace: true,
      },
    );
  };

  return {
    canPublishEnv,
    neverPublished,
    onPublishEnv,
  };
};

interface PublishWithEnvProps {
  step: string;
  setStep: (v: string) => void;
  disabled?: boolean;
  onPublish: (obj?: Partial<PublishWorkflowRequest>) => Promise<boolean>;
}

export const PublishWithEnv: React.FC<PublishWithEnvProps> = props => {
  const { disabled } = props;
  const { canPublishEnv, neverPublished, onPublishEnv } = usePublishEnv();

  const disabledPublishEnv = neverPublished || disabled;

  if (!canPublishEnv) {
    return <PublishWithDiff {...props} />;
  }

  return (
    <SplitButtonGroup className={css['publish-env']}>
      <PublishWithDiff {...props} />
      <Menu
        trigger="click"
        render={
          <Menu.Menu mode="menu">
            <Menu.Item disabled={disabledPublishEnv} onClick={onPublishEnv}>
              <TooltipWithDisabled
                disabled={!disabledPublishEnv}
                position="left"
                content={I18n.t(
                  'bmv_please_release_the_official_version_before_releasing_it_',
                )}
              >
                {I18n.t('bmv_pre_release_to_lane')}
              </TooltipWithDisabled>
            </Menu.Item>
          </Menu.Menu>
        }
      >
        <IconButton
          icon={<IconCozArrowDown />}
          className={css['last-btn']}
          disabled={disabled}
          color="hgltplus"
        />
      </Menu>
    </SplitButtonGroup>
  );
};
