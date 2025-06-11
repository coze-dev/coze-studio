import { type FC, type MouseEvent } from 'react';

import classNames from 'classnames';
import { type StandardNodeType } from '@coze-workflow/base';
import { Tooltip } from '@coze/coze-design';

import { type PluginNodeTemplate, type PluginApiNodeTemplate } from '@/typing';

import { CustomDragCard } from '../custom-drag-card';
import { NodeCard } from '../card';
import { PluginNodeCard } from './plugin-node-card';

import styles from './styles.module.less';
export interface PluginNodeProps {
  index: number;
  nodeTemplate: PluginNodeTemplate;
  enableDrag?: boolean;
  keyword?: string;
  onSelect?: (props: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: PluginApiNodeTemplate;
  }) => void;
  expand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}
export const PluginNode: FC<PluginNodeProps> = ({
  index,
  nodeTemplate,
  enableDrag,
  onSelect,
  keyword,
  expand,
  onExpandChange,
}) => {
  const {
    name: pluginName,
    plugin_id,
    icon_url,
    desc: pluginDesc,
    tools,
  } = nodeTemplate;
  const renderPluginNode = () => {
    const tooltipPosition = index % 2 === 0 ? 'left' : 'right';
    if (tools?.length === 1) {
      const pluginTool = tools[0];
      return (
        <CustomDragCard
          key={plugin_id}
          tooltipPosition={tooltipPosition}
          nodeType={pluginTool?.type as StandardNodeType}
          nodeDesc={pluginDesc}
          nodeJson={pluginTool.nodeJSON}
          nodeTemplate={pluginTool}
          disabled={!enableDrag}
        >
          <NodeCard
            name={pluginName ?? ''}
            icon={icon_url}
            keyword={keyword}
            onClick={event => onSelect?.({ event, nodeTemplate: pluginTool })}
          />
        </CustomDragCard>
      );
    } else {
      return (
        <div className={styles['plugin-card-wrapper']}>
          {expand ? (
            <div
              className={classNames(
                styles['plugin-card-cutcorner'],
                styles['left-corner'],
              )}
            ></div>
          ) : null}
          <Tooltip
            content={pluginDesc}
            position={tooltipPosition}
            mouseEnterDelay={500}
          >
            <div>
              <PluginNodeCard
                name={pluginName ?? ''}
                icon={icon_url ?? ''}
                keyword={keyword}
                expand={expand ?? false}
                onClick={() => onExpandChange?.(!expand)}
              />
            </div>
          </Tooltip>
          {expand ? (
            <div
              className={classNames(
                styles['plugin-card-cutcorner'],
                styles['right-corner'],
              )}
            ></div>
          ) : null}
        </div>
      );
    }
  };
  return renderPluginNode();
};
