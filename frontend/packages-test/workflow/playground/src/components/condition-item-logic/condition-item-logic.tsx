import { type FC } from 'react';

import { ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { logicTextMap } from './constants';

import styles from './condition-item-logic.module.less';

export interface ConditionItemLogicProps {
  /**
   * 逻辑 And Or
   */
  logic?: ConditionLogic;
  /**
   * 逻辑 And Or change 回调
   */
  onChange: (logic: ConditionLogic) => void;
  showStroke?: boolean;
  className?: string;
  readonly?: boolean;
  testId?: string;
}

export const ConditionItemLogic: FC<ConditionItemLogicProps> = props => {
  const {
    logic,
    onChange,
    showStroke = false,
    readonly = false,
    testId,
  } = props;

  return (
    <div className="flex flex-col pt-[16px] pb-[16px] w-[50px]">
      <div className="flex-1 relative">
        {showStroke ? (
          <div className="absolute left-1/2 right-0 top-2.5 bottom-0 rounded-tl-lg border-solid border-0 border-t border-l coz-stroke-plus" />
        ) : null}
      </div>
      <Select
        className={styles['condition-logic-select']}
        placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
        style={{ marginRight: 4 }}
        value={logic}
        disabled={readonly}
        size="small"
        optionList={[
          {
            label: logicTextMap.get(ConditionLogic.AND),
            value: ConditionLogic.AND,
          },
          {
            label: logicTextMap.get(ConditionLogic.OR),
            value: ConditionLogic.OR,
          },
        ]}
        onChange={val => onChange(val as ConditionLogic)}
        data-testid={testId}
      />
      <div className="flex-1 relative">
        {showStroke ? (
          <div className="absolute left-1/2 right-0 top-0 bottom-2.5 rounded-bl-lg border-solid border-0 border-b border-l coz-stroke-plus" />
        ) : null}
      </div>
    </div>
  );
};
