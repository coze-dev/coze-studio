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
