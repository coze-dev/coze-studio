import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Loading } from '@coze/coze-design';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';

import styles from './styles.module.less';

export const LoopContent = ({
  scene,
  resourceName,
}: {
  scene?: ResourceCopyScene;
  resourceName?: string;
}) => {
  const loopMoveText = useMemo(() => {
    switch (scene) {
      case ResourceCopyScene.CopyResourceFromLibrary:
        return I18n.t(
          'resource_process_modal_text_copying_resource_to_project',
          {
            resourceName,
          },
        );
      case ResourceCopyScene.MoveResourceToLibrary:
        return I18n.t(
          'resource_process_modal_text_moving_resource_to_library',
          {
            resourceName,
          },
        );
      case ResourceCopyScene.CopyResourceToLibrary:
        return I18n.t(
          'resource_process_modal_text_copying_resource_to_library',
          {
            resourceName,
          },
        );
      case ResourceCopyScene.CopyProjectResource:
        return I18n.t('project_toast_copying_resource', { resourceName });
      default:
        return '';
    }
  }, [scene, resourceName]);

  const loopSuggestionText = useMemo(() => {
    if (scene === ResourceCopyScene.MoveResourceToLibrary) {
      return I18n.t(
        'resource_process_modal_text_moving_process_interrupt_warning',
      );
    }
    return I18n.t(
      'resource_process_modal_text_copying_process_interrupt_warning',
    );
  }, [scene]);

  return (
    <div className={styles['description-container']}>
      <Loading loading={true} wrapperClassName={styles.spin} />
      <div>{loopMoveText}</div>
      <div>{loopSuggestionText}</div>
    </div>
  );
};
