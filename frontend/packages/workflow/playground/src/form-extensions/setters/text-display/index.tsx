import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { Text } from '../../components/text';

export const TextDisplay: FC<SetterComponentProps<string>> = props => {
  const { value } = props;
  return <Text className="h-8 leading-8" text={value} />;
};

export const textDisplay = {
  key: 'TextDisplay',
  component: TextDisplay,
};
