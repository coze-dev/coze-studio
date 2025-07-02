import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

export function Form({ children }: SetterComponentProps): JSX.Element {
  return <div>{children}</div>;
}

export const form = {
  key: 'Form',
  component: Form,
};
