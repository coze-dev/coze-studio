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

import { useEffect } from 'react';

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { useWorkflowNode } from '@coze-workflow/base';

import { useDependencyService } from '@/hooks';

import { InputParameters, Outputs } from '../common/components';
import { getApiNodeIdentifier } from './utils';
import { usePluginNodeService } from './hooks';

export function PluginContent() {
  const { data } = useWorkflowNode();
  const pluginService = usePluginNodeService();
  const indentifier = getApiNodeIdentifier(data?.inputs?.apiParam || []);
  const node = useCurrentEntity();
  const dependencyService = useDependencyService();

  useEffect(() => {
    if (!indentifier) {
      return;
    }

    const disposable = dependencyService.onDependencyChange(props => {
      if (!props?.extra?.nodeIds?.includes(node.id)) {
        return;
      }
      pluginService.load(indentifier);
    });

    return () => {
      disposable?.dispose?.();
    };
  }, [indentifier]);

  return (
    <>
      <InputParameters />
      <Outputs />
    </>
  );
}
