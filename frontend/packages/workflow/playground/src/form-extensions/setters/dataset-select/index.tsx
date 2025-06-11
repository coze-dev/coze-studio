import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { DatasetSelect as BaseDatasetSelect } from '../../components/dataset-select';

const DatasetSelect = (props: SetterComponentProps<string[]>) => (
  <BaseDatasetSelect {...props} />
);

export const DatasetSelectSetter = {
  key: 'DatasetSelect',
  component: DatasetSelect,
};
