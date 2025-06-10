import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { OutputsParamDisplay } from '../../components/output-param-display';

type IOutputSingleTextProps = SetterComponentProps;

const OutputLabelText = (props: IOutputSingleTextProps) => (
  <OutputsParamDisplay {...props} />
);

export const outputLabelTextSetter = {
  key: 'OutputLabelText',
  component: OutputLabelText,
};
