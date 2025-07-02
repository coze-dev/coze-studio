import { type FC } from 'react';

import { type WithCustomStyle } from '@coze-workflow/base/types';

import { type PluginFCSetting } from './types';

interface AsyncParamsFormProps {
  initValue?: PluginFCSetting['response_style'];
  onChange: (value: PluginFCSetting['response_style']) => void;
}

export const AsyncParamsForm: FC<
  WithCustomStyle<AsyncParamsFormProps>
> = props => <div>Async</div>;
