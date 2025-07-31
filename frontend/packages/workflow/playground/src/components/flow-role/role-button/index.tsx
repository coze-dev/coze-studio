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

import { useEffect, useRef, useState } from 'react';

import { useMemoizedFn } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Button, Typography } from '@coze-arch/coze-design';

import { type PanelInfo } from '@/services/workflow-float-layout-service';
import {
  useFloatLayoutService,
  useRoleService,
  useRoleServiceStore,
  useGlobalState,
} from '@/hooks';
import { LayoutPanelKey } from '@/constants';

import { RoleAvatar } from './role-avatar';
import { OnBoardingPopover } from './onboarding';

import css from './role-button.module.less';

export const RoleButton = () => {
  const floatLayoutService = useFloatLayoutService();
  const roleService = useRoleService();

  const { isInitWorkflow } = useGlobalState();
  const { isReady, loading, data } = useRoleServiceStore(s => ({
    isReady: s.isReady,
    loading: s.loading,
    data: s.data,
  }));

  const [onBoardingVisible, setOnBoardingVisible] = useState(false);

  const ref = useRef(null);
  /**
   * Is this the first time to open the role configuration panel?
   */
  const isInitRef = useRef(false);

  const roleName = data?.name || I18n.t('team_column_role');
  const roleAvatar = data?.avatar?.image_url;

  const handleClick = () => {
    floatLayoutService.open(LayoutPanelKey.RoleConfig);
  };

  const handlePanelClose = useMemoizedFn((info: PanelInfo) => {
    const { key } = info;
    if (key === LayoutPanelKey.RoleConfig && isInitRef.current) {
      setOnBoardingVisible(true);
    }
  });

  /**
   * Initialize request role data
   */
  useEffect(() => {
    roleService.load();
  }, [roleService]);

  /**
   * Whether to automatically open the configuration panel
   */
  useEffect(() => {
    /**
     * Unmodified Process & Unconfigured Role Configuration = > Automatically Expand Role Panel
     */
    if (isInitWorkflow && isReady && data === null) {
      floatLayoutService.open(LayoutPanelKey.RoleConfig);
      isInitRef.current = true;
    }
  }, [isReady, isInitWorkflow, data, floatLayoutService]);

  /**
   * Whether onboarding is turned on when closing the panel
   */
  useEffect(() => {
    const disposable = floatLayoutService.onUnmount(handlePanelClose);

    return () => disposable.dispose();
  }, [floatLayoutService, handlePanelClose]);

  return (
    <div ref={ref} className={css['role-button']}>
      <OnBoardingPopover
        visible={onBoardingVisible}
        getPopupContainer={() => ref.current || document.body}
      >
        <Button color="secondary" onClick={handleClick} loading={loading}>
          <div className={css['role-info']}>
            <RoleAvatar url={roleAvatar} />
            <Typography.Text
              style={{ maxWidth: 100 }}
              ellipsis={{ showTooltip: true }}
              strong
            >
              {roleName}
            </Typography.Text>
          </div>
        </Button>
      </OnBoardingPopover>
    </div>
  );
};
