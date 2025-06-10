import { validateAllBranchesFromOutside } from './multi-condition/validate/validate';
import { Condition } from './multi-condition';

export const condition = {
  key: 'Condition',
  component: Condition,
  validator: ({ value, context }) =>
    validateAllBranchesFromOutside(value, context),
};
