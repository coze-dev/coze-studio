import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';

import {
  OutputTreeSchema,
  OutputTreeUniqueNameSchema,
  type OutputTree,
} from './schema';

export function outputTreeValidator(
  params: ValidatorProps<
    OutputTree,
    {
      uniqueName?: boolean;
    }
  >,
) {
  const { value, options } = params;
  const { uniqueName = false } = options;
  const parsed = uniqueName
    ? OutputTreeUniqueNameSchema.safeParse(value)
    : OutputTreeSchema.safeParse(value);

  if (!parsed.success) {
    return JSON.stringify((parsed as any).error);
  }

  return true;
}
