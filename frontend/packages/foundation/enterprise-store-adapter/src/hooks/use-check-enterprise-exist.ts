/**
 * @file 社区版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */

import { useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useEnterpriseStore } from '../stores/enterprise';
export const useCheckEnterpriseExist = () => {
  const { isEnterpriseExist } = useEnterpriseStore(
    useShallow(store => ({
      isEnterpriseExist: store.isEnterpriseExist,
    })),
  );
  const checkEnterpriseExist = useCallback(() => {
    console.log('checkEnterpriseExist');
  }, []);

  return {
    checkEnterpriseExist,
    checkEnterpriseExistLoading: false,
    isEnterpriseExist,
  };
};
