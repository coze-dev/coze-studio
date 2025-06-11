import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import { IconClose } from '@douyinfe/semi-icons';

import s from './index.module.less';

export interface PanelHeaderProps {
  onClose: () => void;
}

export const PanelHeader = (props: PanelHeaderProps) => {
  const { onClose } = props;
  return (
    <div className={s['panel-header']}>
      <div className={s['panel-header-title']}>
        {I18n.t('debug_detail_tab')}
      </div>
      <div className={s['panel-header-option']}>
        <UIButton
          className={s['panel-header-option-icon']}
          theme="borderless"
          icon={<IconClose />}
          size="small"
          onClick={onClose}
        />
      </div>
    </div>
  );
};
