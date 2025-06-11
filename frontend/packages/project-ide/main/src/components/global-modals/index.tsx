import React from 'react';

import { ResourceModal } from './resource-modal';
import { CloseConfirmModal } from './close-confirm-modal';

export const GlobalModals = () => (
  // do something
  <>
    {/* 移动资源库全局弹窗 */}
    <ResourceModal />
    {/* 保存中资源关闭弹窗 */}
    <CloseConfirmModal />
  </>
);
