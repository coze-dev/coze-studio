import { ConditionContainer } from '../../components/condition';
import { Field } from '..';
import { useConditions } from './use-conditions';
import { DatabaseConditionRightComponent } from './database-condition-right';
import { DatabaseConditionOperatorComponent } from './database-condition-operator';
import { DatabaseConditionLeftComponent } from './database-condition-left';

interface DatabaseConditionProps {
  label: string;
  name: string;
}

export function DatabaseCondition({ label, name }: DatabaseConditionProps) {
  const { conditionList = [], logic } = useConditions(name);

  return (
    <Field label={label} isEmpty={conditionList.length === 0}>
      <ConditionContainer
        conditions={conditionList.map(condition => ({
          left: <DatabaseConditionLeftComponent value={condition.left} />,
          operator: (
            <DatabaseConditionOperatorComponent value={condition.operator} />
          ),
          right: (
            <DatabaseConditionRightComponent
              value={condition.right}
              operator={condition.operator}
            />
          ),
        }))}
        logic={logic}
      />
    </Field>
  );
}
