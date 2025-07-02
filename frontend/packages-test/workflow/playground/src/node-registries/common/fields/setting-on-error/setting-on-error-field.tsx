import { type SettingOnErrorValue } from '@coze-workflow/nodes';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { SettingOnError as SettingOnErrorComp } from '@/form-extensions/components/setting-on-error';
import { withField, useField } from '@/form';

interface Props {
  batchModePath?: string;
  outputsPath?: string;
  noPadding?: boolean;
}

export const SettingOnErrorField = withField(
  ({ batchModePath, outputsPath, noPadding }: Props) => {
    const field = useField<SettingOnErrorValue>();
    const readonly = useReadonly();
    return (
      <SettingOnErrorComp
        {...field}
        readonly={readonly}
        value={field.value as SettingOnErrorValue}
        batchModePath={batchModePath}
        outputsPath={outputsPath}
        noPadding={noPadding}
      />
    );
  },
);
