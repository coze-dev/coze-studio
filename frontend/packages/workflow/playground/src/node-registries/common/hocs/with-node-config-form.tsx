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
 * 高阶组件，用于为组件添加节点配置表单的包装
 * 这个 HOC 为工作流节点提供配置表单的包装器
 *
 * @param Component - 需要被配置表单包装的组件
 * @returns 返回一个被 NodeConfigForm 包装后的新组件
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
