import { type ComponentTypeItem } from '../types';

export const formatComponentTypeForm = (
  values: ComponentTypeItem,
): ComponentTypeItem => {
  const { type } = values;
  if (type === 'text') {
    return { type };
  }
  if (type === 'select') {
    return { type, options: values.options };
  }
  if (type === 'upload') {
    return { type, uploadTypes: values.uploadTypes };
  }
  return values;
};
