import { I18n } from '@coze-arch/i18n';

import { TraceSelect } from '../trace-select';

import css from './header.module.less';

export const TraceListPanelHeader: React.FC = () => (
  <div className={css['trace-panel-header']}>
    <div className={css['header-tabs']}>
      <div className={css['trace-title']}>{I18n.t('debug_btn')}</div>
    </div>
    <TraceSelect />
  </div>
);
