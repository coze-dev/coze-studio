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

import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Typography, IconButton } from '@coze-arch/coze-design';

import { useFloatLayoutService, useGlobalState } from '@/hooks';

import { RoleConfigForm } from '../role-config-form';
import { PanelWrap } from '../../float-layout';

import css from './config-panel.module.less';

const ConfigPanelHeader = () => {
  const floatLayoutService = useFloatLayoutService();

  const handleClose = () => {
    floatLayoutService.close('right');
  };

  return (
    <div className={css['panel-header']}>
      <Typography.Text fontSize="16px" strong>
        {I18n.t('workflow_role_config_title')}
      </Typography.Text>
      <IconButton
        icon={<IconCozCross />}
        color="secondary"
        onClick={handleClose}
      />
    </div>
  );
};

export const RoleConfigPanel = () => {
  const { readonly } = useGlobalState();

  return (
    <PanelWrap layout="vertical">
      <div className={css['config-panel']}>
        <ConfigPanelHeader />
        <div className={css['panel-content']}>
          <RoleConfigForm disabled={readonly} />
        </div>
      </div>
    </PanelWrap>
  );
};
