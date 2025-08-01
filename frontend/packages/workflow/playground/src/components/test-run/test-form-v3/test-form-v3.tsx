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

import { useEffect, useRef } from 'react';

import {
  TestRunForm,
  TestRunFormProvider,
  isFormSchemaPropertyEmpty,
} from '@coze-workflow/test-run-next';
import { InputFormEmpty } from '@coze-workflow/test-run';

import { type WorkflowNodeEntity } from '@/test-run-kit';

import { TestsetSave, TestsetSelect } from '../test-form-materials/testset';
import { JsonModeInput } from '../test-form-materials/json-mode-input';
import { TypedFileInput } from '../test-form-materials/file/file-v2';
import {
  NodeFieldCollapse,
  RelatedFieldCollapse,
} from '../test-form-materials';
import { useModeFormSchema } from './use-mode-form-schema';
import { useModeFormEvent } from './use-mode-form-event';
import { TestRunFormModel } from './test-run-form-model';

interface TestFormV3Props {
  node: WorkflowNodeEntity;
  onMounted: (formApi: TestRunFormModel) => void;
}

const components = {
  NodeFieldCollapse,
  RelatedFieldCollapse,
  TypedFileInput,
  JsonModeInput,
  TestsetSave,
  TestsetSelect,
};

export const InnerTestForm: React.FC<TestFormV3Props> = ({
  node,
  onMounted,
}) => {
  const formApiRef = useRef(new TestRunFormModel());
  const { schemaWithMode } = useModeFormSchema({ node, formApiRef });
  const events = useModeFormEvent({ schemaWithMode, formApiRef });

  useEffect(() => {
    onMounted(formApiRef.current);
  }, [formApiRef]);

  if (!schemaWithMode) {
    return null;
  }
  if (schemaWithMode && isFormSchemaPropertyEmpty(schemaWithMode.properties)) {
    return <InputFormEmpty />;
  }

  return (
    <TestRunForm schema={schemaWithMode} components={components} {...events} />
  );
};

export const TestFormV3: React.FC<TestFormV3Props> = props => (
  <TestRunFormProvider>
    <InnerTestForm {...props} />
  </TestRunFormProvider>
);
