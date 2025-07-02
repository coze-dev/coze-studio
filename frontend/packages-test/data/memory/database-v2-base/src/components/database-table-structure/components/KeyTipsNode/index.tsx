import { PopoverContent } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';

import s from './index.module.less';

export const KeyTipsNode: React.FC = () => (
  <PopoverContent className={s['modal-key-tip']}>{`- ${I18n.t(
    'db_add_table_field_name_tips1',
  )}
- ${I18n.t('db_add_table_field_name_tips2')}
- ${I18n.t('db_add_table_field_name_tips3')}
- ${I18n.t('db_add_table_field_name_tips4')}`}</PopoverContent>
);
