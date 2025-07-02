import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { useDataNavigate } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { Button, Toast } from '@coze-arch/coze-design';

export const useLeaveWarning = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const resourceNavigate = useDataNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const wasInVariablePage = prevPathRef.current.includes('/variables');

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    if (
      wasInVariablePage &&
      !currentPath.includes('/variables') &&
      hasUnsavedChanges
    ) {
      Toast.warning({
        content: (
          <div>
            <span className="text-sm font-medium coz-fg-plus mr-2">
              {I18n.t('variable_config_toast_savetips')}
            </span>
            <Button
              color="primary"
              onClick={() => {
                resourceNavigate.navigateTo?.('/variables');
              }}
            >
              {I18n.t('variable_config_toast_return_button')}
            </Button>
          </div>
        ),
      });
    }

    if (currentPath.includes('/variables') && hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    prevPathRef.current = currentPath;

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location, hasUnsavedChanges]);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
  };
};
