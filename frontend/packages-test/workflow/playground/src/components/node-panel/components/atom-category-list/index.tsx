import { type FC } from 'react';

import { get } from 'lodash-es';
import { type StandardNodeType } from '@coze-workflow/base';

import { isPluginCategoryNodeTemplate } from '@/utils';
import { type NodeCategory } from '@/typing';

import { NodeCategoryPanel } from '../node-category-panel';
import { CustomDragCard } from '../custom-drag-card';
import { NodeCard } from '../card';
import { useNodePanelContext } from '../../hooks/node-panel-context';

export interface AtomCategoryListProps {
  data: NodeCategory[];
}

export const AtomCategoryList: FC<AtomCategoryListProps> = ({ data }) => {
  const { keyword, enableDrag, onSelect } = useNodePanelContext();

  return (
    <>
      {data.map(({ categoryName, nodeList }) => (
        <NodeCategoryPanel key={categoryName} categoryName={categoryName}>
          {nodeList.map((nodeTemplate, index) => (
            <CustomDragCard
              key={`${nodeTemplate?.type}_${nodeTemplate.name}`}
              tooltipPosition={index % 2 === 0 ? 'left' : 'right'}
              nodeType={nodeTemplate?.type as StandardNodeType}
              nodeDesc={get(nodeTemplate, 'desc')}
              nodeJson={get(nodeTemplate, 'nodeJSON')}
              nodeTemplate={nodeTemplate}
              disabled={!enableDrag}
            >
              <NodeCard
                name={nodeTemplate.name ?? ''}
                icon={nodeTemplate.icon_url ?? ''}
                hideOutline={isPluginCategoryNodeTemplate(nodeTemplate)}
                keyword={keyword}
                onClick={event => onSelect?.({ event, nodeTemplate })}
              />
            </CustomDragCard>
          ))}
        </NodeCategoryPanel>
      ))}
    </>
  );
};
