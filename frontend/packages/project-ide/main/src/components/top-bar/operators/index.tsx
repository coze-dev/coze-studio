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

import { useNavigate } from 'react-router-dom';
import React, { type PropsWithChildren, useCallback } from 'react';

import { PublishButton } from '@coze-studio/project-publish';
import {
  useCopyProjectModal,
  useDeleteIntelligence,
} from '@coze-studio/project-entity-adapter';
import { CollapsibleIconButtonGroup } from '@coze-studio/components/collapsible-icon-button';
import { LeftContentButtons } from '@coze-project-ide/ui-adapter';
import {
  useProjectId,
  useSpaceId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import {
  useProjectAuth,
  EProjectPermission,
  useProjectRole,
} from '@coze-common/auth';
import { I18n } from '@coze-arch/i18n';
import { IconCozEye, IconCozMore } from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  Divider,
  Popover,
  Menu,
  Toast,
  Tooltip,
  Tag,
} from '@coze-arch/coze-design';

import { useProjectInfo } from '../../../hooks';
import { MonetizeConfig } from './monetize';

export const Operators = () => {
  const navigate = useNavigate();
  const spaceId = useSpaceId();
  const projectId = useProjectId();

  const { version } = useCommitVersion();

  const { modalContextHolder: modalDelete, deleteIntelligence } =
    useDeleteIntelligence({
      onDeleteProjectSuccess: () => {
        Toast.success(I18n.t('project_ide_toast_delete_success'));
        navigate(`/space/${spaceId}/develop`);
      },
    });

  const { modalContextHolder, openModal } = useCopyProjectModal({
    onSuccess: () => navigate(`/space/${spaceId}/develop`),
  });
  const { projectInfo, initialValue } = useProjectInfo();
  const projectRoles = useProjectRole(projectId);

  const handleCopy = useCallback(() => {
    openModal({
      initialValue: {
        ...initialValue,
        to_space_id: spaceId,
      },
    });
  }, [initialValue, spaceId]);

  const handleDelete = useCallback(() => {
    deleteIntelligence({
      name: initialValue.name || '',
      projectId: projectInfo?.id || '',
    });
  }, [initialValue, projectInfo]);

  const canDelete = useProjectAuth(
    EProjectPermission.DELETE,
    projectId,
    spaceId,
  );

  return version ? (
    <Tag prefixIcon={<IconCozEye />}>{I18n.t('app_ide_viewing_archive')}</Tag>
  ) : (
    <div className="flex items-center justify-end grow gap-[8px] overflow-hidden">
      {modalContextHolder}
      {projectRoles.length ? (
        <>
          {modalDelete}
          <LeftContent>
            <LeftContentButtons />
            {IS_OVERSEA ? <MonetizeConfig /> : null}
          </LeftContent>
          <Divider layout="vertical" className="first:hidden" />
          <PublishButton
            spaceId={spaceId}
            projectId={projectId}
            hasPublished={Boolean(Number(projectInfo?.publish_time))}
          />
          <Popover
            trigger="click"
            className="rounded-[8px]"
            content={
              <Menu>
                <Menu.Item
                  className="min-w-[190px] h-[32px] rounded-[4px]"
                  onClick={handleCopy}
                >
                  {I18n.t('project_ide_duplicate')}
                </Menu.Item>
                {/* Tooltip disableFocusListener failed, waiting for subsequent repairs to complete */}
                {canDelete ? (
                  <Menu.Item
                    className="min-w-[190px] h-[32px] rounded-[4px]"
                    onClick={handleDelete}
                  >
                    {I18n.t('project_ide_delete_project')}
                  </Menu.Item>
                ) : (
                  <Tooltip
                    position="left"
                    content={I18n.t('project_delete_permission_tooltips')}
                  >
                    <Menu.Item
                      disabled={true}
                      className="min-w-[190px] h-[32px] rounded-[4px]"
                      onClick={handleDelete}
                    >
                      {I18n.t('project_ide_delete_project')}
                    </Menu.Item>
                  </Tooltip>
                )}
              </Menu>
            }
          >
            <IconButton icon={<IconCozMore />} color="secondary" />
          </Popover>
        </>
      ) : (
        <Button onClick={handleCopy}>
          {I18n.t('project_ide_create_duplicate')}
        </Button>
      )}
    </div>
  );
};

/**
 * In order to give the left side a container for calculating the overall width, in order to automatically hide the paid configuration copy when the width is not enough
 * Also take into account the first: hidden writing method that automatically hides the divider when there is no content on the left
 */
function LeftContent({ children }: PropsWithChildren) {
  return IS_OVERSEA ? (
    <CollapsibleIconButtonGroup gap={8}>{children}</CollapsibleIconButtonGroup>
  ) : (
    children
  );
}
