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
