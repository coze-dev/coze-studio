import { type FC, useMemo } from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import type {
  OptionItem,
  RadioChangeEvent,
  RadioType,
} from '@coze-arch/bot-semi/Radio';
import { Radio as RadioUI, RadioGroup } from '@coze-arch/bot-semi';

import { type ComponentProps } from '@/nodes-v2/components/types';

import { useReadonly } from '../../hooks/use-readonly';

import styles from './index.module.less';

type RadioItem = OptionItem & {
  disabled?: boolean;
};

type RadioProps = ComponentProps<string> & {
  name: string;
  mode: RadioType;
  options: RadioItem[];
};

export const Radio: FC<RadioProps> = props => {
  const { value, onChange, options = [], mode, name } = props;

  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const readonly = useReadonly();

  const uiOptions = useMemo(
    () =>
      options.map(item => (
        <RadioUI
          className={classNames({
            'border-[#1C1F23]/[8%]': mode === 'card' && item.value !== value,
            'bg-[--semi-color-bg-0]': mode === 'card' && item.value !== value,
          })}
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          data-testid={concatTestId(getNodeSetterId(name), `${item.value}`)}
        >
          {item.label}
        </RadioUI>
      )),
    [options, mode, value, concatTestId, getNodeSetterId, name],
  );

  return (
    <RadioGroup
      style={{
        pointerEvents: readonly ? 'none' : 'auto',
      }}
      className={styles.workflowNodeSetterRadio}
      type={mode}
      value={value}
      onChange={onChange as unknown as (event: RadioChangeEvent) => void}
    >
      {uiOptions}
    </RadioGroup>
  );
};
