import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze/coze-design/icons';
import { Typography, IconButton } from '@coze/coze-design';

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
