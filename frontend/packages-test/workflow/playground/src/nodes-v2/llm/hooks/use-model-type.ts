import { useForm } from '@flowgram-adapter/free-layout-editor';

/**
 * 获取模型type
 */
export function useModelType() {
  const form = useForm();

  const modelType = form.getValueIn('model')?.modelType;
  return modelType;
}
