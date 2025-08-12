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

/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from 'react-router-dom';
import React, { type ReactNode, useCallback } from 'react';

import { useIsPublishRecordReady } from '@coze-studio/publish-manage-hooks';
import {
  useProjectAuth,
  EProjectPermission,
  useProjectRole,
} from '@coze-common/auth';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozAnalytics,
  IconCozArrowDown,
  IconCozArrowRight,
  IconCozDocument,
  IconCozLongArrowTopRight,
  IconCozTrigger,
} from '@coze-arch/coze-design/icons';
import {
  Button,
  Divider,
  IconButton,
  Menu,
  Popover,
  Tooltip,
} from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';

import { usePublishStatus } from '../hooks/use-publish-status';
import { useBizConnectorAnchor } from '../hooks/use-biz-connector-anchor';

const isLocalDevMode = () => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.has('devBlock');
};

/* eslint @coze-arch/max-line-per-function: ["error", {"max": 300}] */
export const PublishButton = ({
  spaceId,
  projectId,
  hasPublished,
}: {
  spaceId: string;
  projectId: string;
  hasPublished: boolean;
}) => {
  const navigate = useNavigate();

  const { modal, tag, latestVersion, open } = usePublishStatus({
    spaceId,
    projectId,
  });

  const hasPublishPermission = useProjectAuth(
    EProjectPermission.PUBLISH,
    projectId,
    spaceId,
  );
  const { removeAnchor } = useBizConnectorAnchor();

  const handlePublish = useCallback(() => {
    removeAnchor();
    navigate(`/space/${spaceId}/project-ide/${projectId}/publish`);
  }, [spaceId, projectId, removeAnchor]);

  const projectRoles = useProjectRole(projectId);

  const [FLAGS] = useFlags();

  const { ready, inited } = useIsPublishRecordReady({
    type: IntelligenceType.Project,
    intelligenceId: projectId,
    spaceId,
    enable: !!(
      // Support soon, so stay tuned.
      (
        FLAGS['bot.studio.publish_management'] &&
        hasPublished &&
        projectRoles.length &&
        !IS_OPEN_SOURCE
      )
    ),
  });

  const menuAnalysis = (
    <MenuItem
      disabled={!ready}
      onClick={() => {
        navigate(`/space/${spaceId}/publish/app/${projectId}?tab=analysis`);
      }}
      text={I18n.t('analytics_page_title')}
      prefix={
        <IconCozAnalytics className="w-[24px] h-[24px] px-[4px] py-[4px]" />
      }
    />
  );

  const menuLogs = (
    <MenuItem
      disabled={!ready}
      onClick={() => {
        navigate(`/space/${spaceId}/publish/app/${projectId}?tab=logs`);
      }}
      text={I18n.t('release_management_trace')}
      prefix={
        <IconCozDocument className="w-[24px] h-[24px] px-[4px] py-[4px]" />
      }
    />
  );

  const menuTriggers = (
    <MenuItem
      disabled={!ready}
      onClick={() => {
        navigate(`/space/${spaceId}/publish/app/${projectId}?tab=triggers`);
      }}
      text={I18n.t('release_management_trigger')}
      prefix={
        <IconCozTrigger className="w-[24px] h-[24px] px-[4px] py-[4px]" />
      }
    />
  );

  if (!hasPublishPermission) {
    return null;
  }

  if (!hasPublished) {
    return (
      <Button
        onClick={handlePublish}
        disabled={isLocalDevMode()}
        data-testid="project.goto.publish-button"
      >
        {I18n.t('project_ide_frame_publish')}
      </Button>
    );
  }

  return (
    <>
      {modal}
      <Popover
        trigger="click"
        zIndex={999}
        content={
          <div className="px-[4px] py-[8px] rounded-[12px] w-[244px] flex flex-col gap-[12px]">
            {latestVersion?.version_number ? (
              <div
                className="flex justify-between items-center h-[32px] px-[4px] cursor-pointer"
                onClick={() => open()}
              >
                <span className="flex-grow mr-[8px]">
                  {`${I18n.t('app_ide_publish_modal_recent_publication')} ${
                    latestVersion?.version_number
                  }`}
                </span>
                {tag}
                <IconButton
                  size="small"
                  className="ml-[4px]"
                  icon={<IconCozArrowRight />}
                  color="secondary"
                />
              </div>
            ) : null}

            <div className="px-[8px] w-full">
              <Divider />
            </div>

            {/* Support soon, so stay tuned. */}
            {FLAGS['bot.studio.publish_management'] && !IS_OPEN_SOURCE ? (
              <div>
                <div className="coz-fg-secondary font-[500] px-[8px] pt-[4px] pb-0 mb-[2px]">
                  {I18n.t('app_ide_publish_modal_publish_management')}
                </div>
                <Menu>
                  {ready || !inited ? (
                    menuAnalysis
                  ) : (
                    <Tooltip
                      theme="dark"
                      content={I18n.t('release_management_generating')}
                    >
                      <div>{menuAnalysis}</div>
                    </Tooltip>
                  )}
                  {ready || !inited ? (
                    menuLogs
                  ) : (
                    <Tooltip
                      theme="dark"
                      content={I18n.t('release_management_generating')}
                    >
                      <div>{menuLogs}</div>
                    </Tooltip>
                  )}
                  {ready || !inited ? (
                    menuTriggers
                  ) : (
                    <Tooltip
                      theme="dark"
                      content={I18n.t('release_management_generating')}
                    >
                      <div>{menuTriggers}</div>
                    </Tooltip>
                  )}
                </Menu>
              </div>
            ) : null}

            <div className="px-[4px] w-full">
              <Button
                className="w-full"
                onClick={handlePublish}
                disabled={isLocalDevMode()}
                data-testid="project.goto.publish-button"
              >
                {I18n.t('app_ide_publish_modal_publish_button')}
              </Button>
            </div>
          </div>
        }
      >
        <Button>
          <span className="mr-[4px]">
            {I18n.t('project_ide_frame_publish')}
          </span>
          <IconCozArrowDown />
        </Button>
      </Popover>
    </>
  );
};

const MenuItem = ({
  prefix,
  text,
  onClick,
  disabled,
}: {
  prefix?: ReactNode;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Menu.Item
    className="px-[4px] py-[4px]"
    disabled={disabled}
    onClick={onClick}
  >
    <div className="w-[228px] flex items-center justify-between gap-[4px]">
      {prefix}
      <span className="flex-grow">{text}</span>
      <IconCozLongArrowTopRight className="w-[24px] h-[24px] px-[4px] py-[4px] coz-fg-secondary" />
    </div>
  </Menu.Item>
);
