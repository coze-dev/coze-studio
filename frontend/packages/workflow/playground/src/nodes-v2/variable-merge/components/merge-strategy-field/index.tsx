import { I18n } from '@coze-arch/i18n';
import { Select, Tooltip } from '@coze-arch/coze-design';

import { InfoIcon } from '../info-icon';

/**
 * 变量聚合策略
 * @param param0
 * @returns
 */
export const MergeStrategyField = ({
  readonly = false,
}: {
  readonly: boolean;
}) => (
  <p className="pb-4">
    <div className="flex items-center text-xs font-medium gap-1">
      <span>{I18n.t('workflow_var_merge_strategy')}</span>
      <InfoIcon
        tooltip={I18n.t('workflow_var_merge_ strategy_tooltips')}
      ></InfoIcon>
    </div>

    <Tooltip content={I18n.t('workflow_var_merge_strategy_hovertips')}>
      <div className="w-full mt-1">
        <Select
          disabled={readonly}
          optionList={[]}
          size="small"
          className="w-full"
        >
          <Select.Option>
            {I18n.t('workflow_var_merge_ strategy_returnnotnull')}
          </Select.Option>
        </Select>
      </div>
    </Tooltip>
  </p>
);
