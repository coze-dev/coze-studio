import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { I18n } from '@coze-arch/i18n';

const useEditConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { savingInfo } = usePageRuntimeStore.getState();
  const leaveWarningInfo = I18n.t('pop_edit_save_confirm');

  // 保存navigate和location.pathname的引用
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location.pathname);
  const debouncingRef = useRef(savingInfo.debouncing);

  function isNoNeedConfirm() {
    return !debouncingRef.current;
  }

  function handleBeforeUnload(event) {
    if (isNoNeedConfirm()) {
      return;
    }

    event.preventDefault();
    event.returnValue = leaveWarningInfo;
  }

  useEffect(() => {
    // popstate 执行回调的时候，由于产生了闭包，会保存支持的值，所以需要在这里处理一下
    navigateRef.current = navigate;
    locationRef.current = location.pathname;

    const unSubDebouncing = usePageRuntimeStore.subscribe(
      store => store.savingInfo.debouncing,
      debouncing => {
        debouncingRef.current = debouncing;
      },
    );

    return () => {
      unSubDebouncing();
    };
  }, [navigate, location]);

  useEffect(() => {
    // 刷新页面 & 关闭页面情况，用 beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history]);
};

export { useEditConfirm };
