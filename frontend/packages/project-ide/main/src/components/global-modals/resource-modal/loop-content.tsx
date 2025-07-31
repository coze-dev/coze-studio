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

import { I18n } from '@coze-arch/i18n';
import { Loading } from '@coze-arch/coze-design';
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
