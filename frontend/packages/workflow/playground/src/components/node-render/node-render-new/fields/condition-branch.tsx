import { type FC } from 'react';

import { type ConditionLogic } from '@coze-workflow/base';
import { type ConditionType } from '@coze-arch/idl/workflow_api';
import {
  IconCozEqual,
  IconCozEqualSlash,
  IconCozGreater,
  IconCozGreaterEqual,
  IconCozLess,
  IconCozLessEqual,
  IconCozProperSuperset,
  IconCozProperSupersetSlash,
} from '@coze-arch/coze-design/icons';

import { type ConditionItem } from '@/form-extensions/setters/condition/multi-condition/types';

import {
  VariableDisplay,
  ConditionContainer,
  ExpressionDisplay,
} from '../components/condition';

interface ConditionBranchProps {
  branch: {
    logic: ConditionLogic;
    conditions: ConditionItem[];
  };
}

const Operator: FC<{
  operator?: ConditionType;
}> = props => {
  const { operator } = props;
  const operatorMap = {
    1: <IconCozEqual />,
    2: <IconCozEqualSlash />,
    3: <IconCozGreater />,
    4: <IconCozGreaterEqual />,
    5: <IconCozLess />,
    6: <IconCozLessEqual />,
    // 包含
    7: <IconCozProperSuperset />,
    // 不包含
    8: <IconCozProperSupersetSlash />,
    // isEmpty
    9: <IconCozEqual />,
    // isNotEmpty
    10: <IconCozEqualSlash />,
    // isTrue
    11: <IconCozEqual />,
    // isFalse
    12: <IconCozEqual />,
    13: <IconCozGreater />,
    14: <IconCozGreaterEqual />,
    15: <IconCozLess />,
    16: <IconCozLessEqual />,
  };
  if (!operator) {
    return null;
  }

  return <div className="text-center flex">{operatorMap[operator]}</div>;
};

export const ConditionBranch: FC<ConditionBranchProps> = props => {
  const { branch } = props;
  const { conditions = [], logic } = branch;

  return (
    <ConditionContainer
      conditions={conditions.map(condition => ({
        left: <VariableDisplay keyPath={condition.left?.content?.keyPath} />,
        operator: <Operator operator={condition.operator} />,
        right: (
          <ExpressionDisplay
            value={condition.right}
            operator={condition.operator}
          />
        ),
      }))}
      logic={logic}
    />
  );
};
