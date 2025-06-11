import React from 'react';

import { useIDEContainer } from './use-ide-container';

export const IDERendererProvider = Symbol('IDERendererProvider');

export type IDERendererProvider = (props: {
  className?: string;
}) => React.ReactElement<any, any> | null;

export const IDERenderer: React.FC<{ className?: string }> = ({
  className,
}: {
  className?: string;
}) => {
  const container = useIDEContainer();
  const RendererProvider =
    container.get<IDERendererProvider>(IDERendererProvider)!;
  return <RendererProvider className={className} />;
};
