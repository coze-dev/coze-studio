import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';

import { type KnowledgeGlobalSetting } from './types';
import { TooltipAction } from './tooltip-action';
import { KnowledgeSettingFormModal } from './knowledge-setting-form-modal';

interface KnowledgeSettingProps {
  setting?: KnowledgeGlobalSetting;
  onChange?: (setting?: KnowledgeGlobalSetting) => void;
}

export const KnowledgeSetting: FC<KnowledgeSettingProps> = props => {
  const { setting, onChange } = props;
  const [visible, setVisible] = useState(false);

  const handleSubmit = (newSetting?: KnowledgeGlobalSetting) => {
    onChange?.(newSetting);
    setVisible(false);
  };

  return (
    <>
      <TooltipAction
        tooltip={I18n.t('plugin_bot_ide_plugin_setting_icon_tip')}
        icon={<IconCozSetting />}
        onClick={() => setVisible(true)}
      />
      <KnowledgeSettingFormModal
        visible={visible}
        setting={setting}
        onSubmit={handleSubmit}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};
