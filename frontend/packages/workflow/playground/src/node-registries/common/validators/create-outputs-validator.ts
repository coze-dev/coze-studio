import { type Validate } from '@flowgram-adapter/free-layout-editor';
import { outputTreeValidator } from '@coze-workflow/nodes';
import { type ViewVariableMeta } from '@coze-workflow/base';
export interface OutputsValidatorOptions {
  uniqueName?: boolean;
}
export const createOutputsValidator =
  (options: OutputsValidatorOptions): Validate<ViewVariableMeta[]> =>
  ({ value, context }) =>
    outputTreeValidator({
      value,
      options,
      context,
    }) as ReturnType<Validate<ViewVariableMeta[]>>;
