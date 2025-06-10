import React from 'react';

import { type ReactWidget } from '@coze-project-ide/framework';

interface WidgetFallbackProps {
  widget: ReactWidget;
}

export const WidgetFallback: React.FC<WidgetFallbackProps> = ({ widget }) => (
  <div>Widget error: {widget.id}</div>
);
