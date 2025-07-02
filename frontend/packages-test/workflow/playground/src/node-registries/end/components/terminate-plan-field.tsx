import { TERMINATE_PLAN_PATH, defaultTerminalPlanOptions } from '../constants';
import { RadioSetterField } from '../../common/fields';

export const TerminatePlanField = () => (
  <RadioSetterField
    name={TERMINATE_PLAN_PATH}
    options={{
      direction: 'horizontal',
      mode: 'button',
      options: defaultTerminalPlanOptions,
    }}
  />
);
