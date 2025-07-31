/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
