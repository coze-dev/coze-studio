import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import {
  type ConditionItem,
  type ConditionValue,
} from '../multi-condition/types';
import { HiddenConditionItem } from './condition-item';

type ConditionProps = SetterComponentProps<ConditionValue>;

export const HiddenCondition: FC<ConditionProps> = props => {
  const { value, onChange } = props;

  const handleConditionItemChange: (
    branchIndex: number,
    conditionItemIndex: number,
  ) => (data: ConditionItem) => void =
    (branchIndex, conditionItemIndex) => conditionItem => {
      const activeBranch = value[branchIndex];

      const newConditions = activeBranch.condition.conditions.map(
        (item, subIndex) => {
          if (subIndex === conditionItemIndex) {
            return {
              ...conditionItem,
            };
          } else {
            return item;
          }
        },
      );

      onChange?.(
        value.map((branch, index) => {
          if (index === branchIndex) {
            return {
              condition: {
                ...branch.condition,
                conditions: newConditions,
              },
            };
          } else {
            return branch;
          }
        }),
      );
    };

  return (
    <>
      {value?.map((branch, branchIndex) =>
        branch.condition.conditions.map((item, conditionItemIndex) => (
          <HiddenConditionItem
            data={item}
            onDataChange={handleConditionItemChange(
              branchIndex,
              conditionItemIndex,
            )}
          />
        )),
      )}
    </>
  );
};
