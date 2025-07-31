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

/* eslint-disable @typescript-eslint/naming-convention */
import { NodeConfigForm } from '../components';

/**
 * Higher order component to add wrapper for node configuration form to component
 * This HOC provides a wrapper for the configuration form for the workflow node
 *
 * @Param Component - Component that needs to be wrapped by the configuration form
 * Returns a new component wrapped in NodeConfigForm
 */
export function withNodeConfigForm<
  ComponentProps extends React.JSX.IntrinsicAttributes = {},
>(Component: React.ComponentType<ComponentProps>) {
  return function WithNodeConfigForm(props: ComponentProps) {
    return (
      <NodeConfigForm>
        <Component {...props} />
      </NodeConfigForm>
    );
  };
}
