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

import React from 'react';

import { Field } from '@flowgram-adapter/free-layout-editor';

import { SchemaContext, type FormSchema } from '../shared';
import { useFieldUIState } from '../hooks';
import { ReactiveField } from './reactive-field';

interface FieldProps {
  name: string;
  schema: FormSchema;
}

export const GeneralField: React.FC<React.PropsWithChildren<FieldProps>> = ({
  schema,
}) => {
  const parentUIState = useFieldUIState();
  return (
    <SchemaContext.Provider value={schema}>
      <Field name={schema.path.join('.')} defaultValue={schema.defaultValue}>
        <ReactiveField parentUIState={parentUIState} />
      </Field>
    </SchemaContext.Provider>
  );
};
