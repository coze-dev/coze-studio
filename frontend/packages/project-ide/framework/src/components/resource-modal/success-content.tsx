import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';
import {
  ResourceCopyScene,
  type ResType,
} from '@coze-arch/bot-api/plugin_develop';

import { useNavigateResource } from './use-navigate-resource';

import styles from './styles.module.less';

export const SuccessContent = ({
  spaceId,
  scene,
  resourceId,
  resourceType,
}: {
  spaceId?: string;
  scene?: ResourceCopyScene;
  resourceId?: string;
  resourceType?: ResType;
}) => {
  const handleNavigateResource = useNavigateResource({
    resourceType,
    resourceId,
    spaceId,
  });

  const content = useMemo(() => {
    if (scene === ResourceCopyScene.MoveResourceToLibrary) {
      return I18n.t('resource_toast_move_to_library_success');
    }
    return I18n.t('resource_toast_copy_to_library_success');
  }, [scene]);
  return (
    <div className={styles['content-container']}>
      {content}
      <Button color="primary" size="small" onClick={handleNavigateResource}>
        {I18n.t('resource_toast_view_resource')}
      </Button>
    </div>
  );
};
