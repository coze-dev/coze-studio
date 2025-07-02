import { type CSSProperties } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import type {
  SetterComponentProps,
  SetterExtension,
} from '@flowgram-adapter/free-layout-editor';

import { CustomPort } from '../../../components/custom-port';

type CustomPortProps = SetterComponentProps<{
  portId: string;
  portType: 'input' | 'output';
  className?: string;
  style: CSSProperties;
  collapsedClassName?: string;
  collapsedStyle?: CSSProperties;
}>;

export const CustomPortSetter = ({ options }: CustomPortProps) => {
  const {
    portID,
    portType,
    className,
    style,
    collapsedClassName,
    collapsedStyle,
  } = options;

  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const setterTestId = getNodeSetterId('custom-port');
  const testId = concatTestId(setterTestId, portID);

  return (
    <CustomPort
      portId={portID}
      portType={portType}
      className={className}
      style={style}
      collapsedClassName={collapsedClassName}
      collapsedStyle={collapsedStyle}
      testId={testId}
    />
  );
};

export const customPort: SetterExtension = {
  key: 'CustomPort',
  component: CustomPortSetter,
};
