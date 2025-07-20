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
 
import { type interfaces } from 'inversify';
import { useIDEContainer } from '@coze-project-ide/client';

/**
 * 获取 IDE 的 IOC 模块
 * 和 flow-ide/client 包内容相同，但可以支持在业务侧如 workflow 内调用
 * @param identifier
 */
export function useIDEServiceInBiz<T>(
  identifier: interfaces.ServiceIdentifier,
): T | undefined {
  const container = useIDEContainer();
  if (container.isBound(identifier)) {
    return container.get(identifier) as T;
  } else {
    return undefined;
  }
}
