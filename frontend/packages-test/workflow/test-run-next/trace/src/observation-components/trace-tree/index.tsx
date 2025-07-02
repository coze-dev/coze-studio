import { useEffect, useMemo, useState } from 'react';

import { clsx } from 'clsx';

import { geSpanNodeInfoMap, spanNode2TreeNode } from '../utils/graph';
import { type TraceTreeProps } from '../typings/graph';
import { TRACE_TREE_STYLE_DEFAULT_PROPS } from '../consts/graph';
import { type TreeNodeInfo } from '../common/tree/typing';
import { Tree, type TreeNode } from '../common/tree';
import { traceTreeContext } from './context';

import styles from './index.module.less';

export const TraceTree = (props: TraceTreeProps) => {
  const {
    spans: spanNodes,
    selectedSpanId,
    indentDisabled,
    lineStyle: _lineStyle,
    globalStyle: _globalStyle,
    className,
    onCollapseChange,
    renderGraphNodeConfig,
    defaultDisplayMode,
    hostUser,
    ...restProps
  } = props;

  const [treeData, setTreeData] = useState<TreeNode[]>();
  const [treeMap, setTreeMap] = useState<Record<string, TreeNodeInfo>>(() =>
    geSpanNodeInfoMap(spanNodes),
  );

  const lineStyle = useMemo(
    () => ({
      normal: Object.assign(
        {},
        TRACE_TREE_STYLE_DEFAULT_PROPS.lineStyle?.normal,
        _lineStyle?.normal,
      ),
      select: Object.assign(
        {},
        TRACE_TREE_STYLE_DEFAULT_PROPS.lineStyle?.select,
        _lineStyle?.select,
      ),
      hover: Object.assign(
        {},
        TRACE_TREE_STYLE_DEFAULT_PROPS.lineStyle?.hover,
        _lineStyle?.hover,
      ),
    }),
    [_lineStyle],
  );

  const globalStyle = useMemo(
    () =>
      Object.assign(
        {},
        TRACE_TREE_STYLE_DEFAULT_PROPS.globalStyle,
        _globalStyle,
      ),
    [_globalStyle],
  );
  const handleCollapse = (id: string, collapsed: boolean) => {
    setTreeMap({
      ...treeMap,
      [id]: {
        ...treeMap[id],
        isCollapsed: collapsed,
      },
    });
    onCollapseChange?.(id);
  };

  useEffect(() => {
    setTreeMap(geSpanNodeInfoMap(spanNodes));
  }, [spanNodes]);

  useEffect(() => {
    if (spanNodes) {
      const treeNodes = spanNode2TreeNode(spanNodes, treeMap, {
        renderGraphNodeConfig,
        showKeyNodeOnly: false,
      });
      setTreeData(treeNodes);
    }
  }, [treeMap]);

  return (
    <traceTreeContext.Provider
      value={{
        treeMap,
        onCollapse: handleCollapse,
      }}
    >
      <div className={styles['trace-tree-layout']}>
        <div
          className={clsx(
            styles['trace-trees-wrapper'],
            'trace-trees-scroll-ref',
          )}
        >
          {treeData?.map(tree => (
            <Tree
              key={tree.key}
              className={clsx(
                styles['trace-tree'],
                styles['trace-graph-panel-content-trace-tree'],
              )}
              treeData={tree}
              selectedKey={selectedSpanId}
              indentDisabled={indentDisabled}
              lineStyle={lineStyle}
              globalStyle={globalStyle}
              {...restProps}
            />
          ))}
        </div>
      </div>
    </traceTreeContext.Provider>
  );
};
