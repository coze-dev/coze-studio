import { type FC } from 'react';

import { ConditionLogic } from '@coze-workflow/base';

import { LogicDisplay } from './logic-display';

interface Condition {
  left?: React.ReactNode;
  operator?: React.ReactNode;
  right?: React.ReactNode;
}

interface ConditionContainerProps {
  conditions: Condition[];
  logic?: ConditionLogic;
}

export const ConditionContainer: FC<ConditionContainerProps> = props => {
  const { conditions = [], logic = ConditionLogic.AND } = props;

  return (
    <div className="coz-stroke-plus coz-bg-max border border-solid py-1 rounded-mini text-xs coz-fg-primary min-h-[32px]">
      {conditions.map((condition, index) => (
        <>
          <div className="flex items-center px-1">
            <div className="flex-1 min-w-0 overflow-hidden">
              {condition.left}
            </div>
            <div className="flex items-center flex-grow-0 flex-shrink-0 basis-[0] px-2 ">
              {condition.operator}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              {condition.right}
            </div>
          </div>
          {index < conditions.length - 1 ? (
            <LogicDisplay logic={logic} />
          ) : null}
        </>
      ))}
    </div>
  );
};
