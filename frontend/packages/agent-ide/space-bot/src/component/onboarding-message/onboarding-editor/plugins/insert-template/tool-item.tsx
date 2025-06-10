import { type FC, type PropsWithChildren } from 'react';

import { ToolbarButton } from '@coze-common/md-editor-adapter';

const PLUGIN_KEY = 'insertTemplate';

export interface InsertTemplateToolItemProps {
  style?: React.CSSProperties;
  tooltipText?: string;
  pluginValue: string;
}
export const InsertTemplateToolItem: FC<
  PropsWithChildren<InsertTemplateToolItemProps>
> = ({ children, tooltipText, pluginValue }) => (
  <ToolbarButton
    extra={{
      size: 'small',
    }}
    icon={children}
    tooltipText={tooltipText}
    pluginKey={PLUGIN_KEY}
    pluginValue={pluginValue}
  ></ToolbarButton>
);
