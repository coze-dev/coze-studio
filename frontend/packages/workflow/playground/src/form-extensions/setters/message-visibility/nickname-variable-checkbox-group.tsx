import { type FC } from 'react';

import { intersectionWith } from 'lodash-es';
import classnames from 'classnames';
import {
  type RefExpression,
  ValueExpressionType,
  ViewVariableType,
  useVariableType,
} from '@coze-workflow/variable';
import { VARIABLE_TYPE_ALIAS_MAP } from '@coze-workflow/base/types';
import { concatTestId } from '@coze-workflow/base';
import { Tooltip, Checkbox, CheckboxGroup } from '@coze/coze-design';

import { VariableTypeTag } from '../../components/variable-type-tag';
import { type NicknameVariable, type NicknameVariableSetting } from './types';
import { useMessageVisibilityContext } from './context';

import styles from './nickname-variable-checkbox-group.module.less';

export const NicknameVariableCheckboxGroup: FC<{
  value?: NicknameVariableSetting[];
  onChange: (userSettings: NicknameVariableSetting[]) => void;
}> = props => {
  const { nicknameVariables = [], testId } = useMessageVisibilityContext();
  const { value, onChange } = props;

  const handleOnChange = (checkedValue: string[]) => {
    const result = intersectionWith(
      nicknameVariables,
      checkedValue,
      (a, b) => a.name === b,
    ).map<NicknameVariableSetting>(item => ({
      biz_role_id: '',
      role: '',
      nickname: item.name,
    }));

    onChange?.(result);
  };

  return (
    <CheckboxGroup
      className={classnames('"mt-4"', styles['nickname-checkbox-group'])}
      value={value?.map(item => item.nickname)}
      onChange={handleOnChange}
    >
      {nicknameVariables?.map(item => (
        <Checkbox
          value={item.name}
          data-testid={concatTestId(testId, 'nickname', item.name)}
        >
          <NicknameVariableLabel data={item} />
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

const NicknameVariableLabel: FC<{
  data: NicknameVariable;
}> = props => {
  const { data } = props;
  const { input } = data;

  if (input?.type === ValueExpressionType.LITERAL) {
    return (
      <>
        <Tooltip content={data.name}>
          <div className="whitespace-nowrap truncate">{data.name}</div>
        </Tooltip>
        <VariableTypeTag>
          {VARIABLE_TYPE_ALIAS_MAP[ViewVariableType.String]}
        </VariableTypeTag>
      </>
    );
  } else {
    return (
      <RefVariableLabel name={data.name} input={data.input as RefExpression} />
    );
  }
};

const RefVariableLabel: FC<{
  name: string;
  input: RefExpression;
}> = props => {
  const { name, input } = props;
  const variableType = useVariableType(input?.content?.keyPath ?? []);

  return (
    <>
      <Tooltip content={name}>
        <div className="whitespace-nowrap truncate">{name}</div>
      </Tooltip>

      {variableType ? (
        <VariableTypeTag>
          {VARIABLE_TYPE_ALIAS_MAP[variableType]}
        </VariableTypeTag>
      ) : null}
    </>
  );
};
