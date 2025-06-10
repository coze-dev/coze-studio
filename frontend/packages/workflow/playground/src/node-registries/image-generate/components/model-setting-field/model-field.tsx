import { ImageModelSelectField } from '@/node-registries/common/components';
import { type FieldProps } from '@/form';

import { createModelOptions } from './create-model-options';

export const ModelField = (props: Omit<FieldProps, 'children'>) => (
  <ImageModelSelectField options={createModelOptions()} {...props} />
);
