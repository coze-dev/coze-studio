import { ParsingType } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { Radio } from '@coze/coze-design';

export const QuickParsing = () => (
  <Radio value={ParsingType.FastParsing} extra={I18n.t('kl_write_005')}>
    {I18n.t('kl_write_004')}
  </Radio>
);
