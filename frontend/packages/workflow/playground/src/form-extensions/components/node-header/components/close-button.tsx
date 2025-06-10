import React from 'react';

import { IconCozCross } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { useNodeRenderScene } from '@/hooks';

export const CloseButton = () => {
  const floatLayoutService = useFloatLayoutService();

  const handleClose = () => {
    floatLayoutService.close();
  };

  const { isNodeSideSheet } = useNodeRenderScene();

  return (
    <>
      <IconButton
        onClick={handleClose}
        icon={<IconCozCross />}
        size={isNodeSideSheet ? 'default' : 'small'}
        color="secondary"
      />
    </>
  );
};
