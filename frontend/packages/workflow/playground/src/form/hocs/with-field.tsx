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

import { Field, type FieldProps } from '../components';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withField<T = {}, V = any>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Cpt: React.ComponentType<T>,
  config: Omit<FieldProps<V>, 'name' | 'children'> = {},
) {
  const Component = (props: T & FieldProps<V>) => {
    const innerProps = {
      ...config,
      ...props,
    };

    const {
      label,
      required,
      tooltip,
      layout,
      defaultValue,
      name,
      deps,
      labelExtra,
      hasFeedback,
      ...rest
    } = innerProps;

    return (
      <Field<V>
        name={name}
        label={label}
        required={required}
        tooltip={tooltip}
        layout={layout}
        defaultValue={defaultValue}
        deps={deps}
        labelExtra={labelExtra}
        hasFeedback={hasFeedback}
      >
        <Cpt {...(rest as T & React.JSX.IntrinsicAttributes)} />
      </Field>
    );
  };

  Component.displayName = `withField(${Cpt.displayName || 'Anonymous'})`;

  return Component;
}
