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

import { type FC, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { SceneType, usePageJumpService } from '@coze-arch/bot-hooks';

import Tree, { type TreeNode } from '../tree';
import { getSpanDataByTraceId } from '../../utils/cspan-graph';
import { DataSourceTypeEnum } from '../../typings/graph';
import { spanData2treeData } from './util';
import { type WorkflowJumpParams, type TraceTreeProps } from './typing';
import { defaultProps } from './config';

import styles from './index.module.less';

const TraceTree: FC<TraceTreeProps> = props => {
  const [treeData, setTreeData] = useState<TreeNode>();
  const [hoverNodeKey, setHoverNodeKey] = useState('');
  const { jump } = usePageJumpService();
  const {
    dataSource: { type: dataType, spanData, traceId },
    spaceId,
    selectedSpanId,
    spanTypeConfigMap,
    indentDisabled,
    lineStyle: _lineStyle,
    globalStyle: _globalStyle,
    className,
    ...restProps
  } = props;

  const lineStyle = useMemo(
    () => ({
      normal: Object.assign(
        {},
        defaultProps.lineStyle?.normal,
        _lineStyle?.normal,
      ),
      select: Object.assign(
        {},
        defaultProps.lineStyle?.select,
        _lineStyle?.select,
      ),
      hover: Object.assign(
        {},
        defaultProps.lineStyle?.hover,
        _lineStyle?.hover,
      ),
    }),
    [_lineStyle],
  );

  const globalStyle = useMemo(
    () => Object.assign({}, defaultProps.globalStyle, _globalStyle),
    [_globalStyle],
  );
  const handleJumpToWorkflow = ({
    workflowID,
    executeID,
    workflowNodeID,
    workflowVersion,
    subExecuteID,
  }: WorkflowJumpParams) => {
    if (!spaceId) {
      return;
    }
    jump(SceneType.BOT__VIEW__WORKFLOW, {
      workflowID,
      spaceID: spaceId,
      botID: '',
      executeID,
      workflowNodeID,
      workflowVersion,
      subExecuteID,
      newWindow: true,
    });
  };
  // Initialize flamethreadData
  useEffect(() => {
    if (dataType === DataSourceTypeEnum.SpanData && spanData) {
      if (spanData?.length === 0 && treeData === undefined) {
        return;
      }

      const treeNode = spanData2treeData(spanData, spanTypeConfigMap, {
        spaceId,
        onHoverChange: setHoverNodeKey,
        onJumpToWorkflow: handleJumpToWorkflow,
      });
      setTreeData(treeNode);
    } else if (dataType === DataSourceTypeEnum.TraceId && traceId) {
      const spans = getSpanDataByTraceId(traceId);
      const treeNode = spanData2treeData(spans, spanTypeConfigMap, {
        onHoverChange: setHoverNodeKey,
        onJumpToWorkflow: handleJumpToWorkflow,
      });
      setTreeData(treeNode);
    }
  }, [dataType, spanData, traceId, spanTypeConfigMap]);

  return treeData ? (
    <Tree
      className={classNames(styles['trace-tree'], className)}
      treeData={treeData}
      disableDefaultHover={true}
      hoverKey={hoverNodeKey}
      selectedKey={selectedSpanId}
      indentDisabled={indentDisabled}
      lineStyle={lineStyle}
      globalStyle={globalStyle}
      {...restProps}
    />
  ) : null;
};

export default TraceTree;
