import React, { useCallback, useState } from 'react';

import {
  TestsetSelect as OriginTestsetSelect,
  type TestsetData,
  type TestsetSelectProps as OriginTestsetSelectProps,
} from '@coze-devops/testset-manage';

import { generateTestsetData } from '../utils/generate-testset-data';
import { Provider } from './provider';

type TestsetSelectProps = Omit<
  OriginTestsetSelectProps,
  'testset' | 'onSelect'
> & {
  onSelect: (data: Record<string, unknown> | undefined) => void;
};

const TestsetSelect: React.FC<TestsetSelectProps> = ({
  onSelect,
  ...props
}) => {
  const [value, setValue] = useState<TestsetData | undefined>();
  const handleChange = useCallback((v: TestsetData | undefined) => {
    onSelect(v ? generateTestsetData(v) : v);
    setValue(v);
  }, []);
  return (
    <Provider>
      <OriginTestsetSelect {...props} testset={value} onSelect={handleChange} />
    </Provider>
  );
};

export { TestsetSelect, type TestsetSelectProps };
