import {
  Field,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type SettingOnErrorValue } from '@coze-workflow/nodes';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { SettingOnError as SettingOnErrorComp } from '@/form-extensions/components/setting-on-error';

interface Props {
  fieldName?: string;
  batchModePath?: string;
  outputsPath?: string;
}

export const SettingOnError = ({
  fieldName = 'settingOnError',
  batchModePath,
  outputsPath,
}: Props) => {
  const readonly = useReadonly();

  return (
    <Field name={fieldName}>
      {({ field }: FieldRenderProps<SettingOnErrorValue>) => (
        <SettingOnErrorComp
          {...field}
          batchModePath={batchModePath}
          outputsPath={outputsPath}
          readonly={readonly}
        />
      )}
    </Field>
  );
};
