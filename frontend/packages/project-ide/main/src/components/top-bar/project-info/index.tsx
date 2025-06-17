import React, { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { useProjectAuth, EProjectPermission } from '@coze-common/auth';
import { useUpdateProjectModal } from '@coze-studio/project-entity-adapter';
import {
  useSpaceId,
  useProjectId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import {
  IconCozEdit,
  IconCozCheckMarkCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import {
  CozAvatar,
  Typography,
  Skeleton,
  IconButton,
  Toast,
  Popover,
} from '@coze-arch/coze-design';

import { useProjectInfo } from '../../../hooks';
import { InfoContent } from './info-content';

import styles from './styles.module.less';

const { Title: COZTitle } = Typography;

export const ProjectInfo = () => {
  const {
    loading,
    initialValue,
    projectInfo,
    updateProjectInfo,
    publishInfo,
    ownerInfo,
  } = useProjectInfo();
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const { version } = useCommitVersion();
  const { modalContextHolder, openModal } = useUpdateProjectModal({
    onSuccess: () => {
      updateProjectInfo();
      // 更新 info 信息
      Toast.success(I18n.t('project_ide_toast_edit_success'));
    },
  });

  const canAuthEdit = useProjectAuth(
    EProjectPermission.EDIT_INFO,
    projectId || '',
    spaceId || '',
  );

  /**
   * 可编辑判断：
   * 1. 有编辑权限
   * 2. 非预览态
   */
  const canEdit = canAuthEdit && !version;

  // 打开 project 编辑弹窗
  const handleEditProject = useCallback(() => {
    openModal({
      initialValue,
    });
  }, [initialValue]);

  const hasPublished = publishInfo?.has_published;

  return loading ? (
    <Skeleton.Title style={{ width: 24, height: 24 }} />
  ) : (
    <div className={styles['project-info']}>
      <Popover
        content={
          <InfoContent
            projectInfo={projectInfo}
            publishInfo={publishInfo}
            ownerInfo={ownerInfo}
            spaceId={spaceId}
          />
        }
      >
        <CozAvatar type="bot" size="small" src={projectInfo?.icon_url} />
        {hasPublished ? (
          <div className={styles['check-icon']}>
            <IconCozCheckMarkCircleFillPalette color="green" />
          </div>
        ) : null}
      </Popover>
      <COZTitle
        ellipsis={{
          showTooltip: {
            opts: { content: projectInfo?.name },
          },
        }}
        className={styles.title}
        fontSize="16px"
        style={{ maxWidth: 320 }}
      >
        {projectInfo?.name}
      </COZTitle>
      {/* 权限判断 */}
      {canEdit ? (
        <IconButton
          color="secondary"
          icon={<IconCozEdit />}
          onClick={handleEditProject}
        />
      ) : null}
      {modalContextHolder}
    </div>
  );
};
