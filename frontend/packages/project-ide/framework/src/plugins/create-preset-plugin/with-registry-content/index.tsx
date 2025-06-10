import React from 'react';

import { Spin } from '@coze/coze-design';
import { useCurrentWidget } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type RegistryHandler } from '@/types';

import { useMount } from './use-mount';
import { useLifeCycle } from './use-lifecycle';

export const withRegistryContent = (registry: RegistryHandler<any>) => {
  const WidgetComp = () => {
    const widget: ProjectIDEWidget = useCurrentWidget();

    const { context } = widget;

    useLifeCycle(registry, context, widget);

    const { loaded, mounted, content } = useMount(registry, widget);

    return loaded && mounted ? content : <Spin />;
  };
  return WidgetComp;
};
