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

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { Resizable } from 're-resizable';
import classNames from 'classnames';
import {
  type CSpan,
  DataSourceTypeEnum,
  TraceFlamethread,
  TraceTree,
  type InteractionEventHandler,
  type CTrace,
} from '@coze-devops/common-modules/query-trace';
import { I18n } from '@coze-arch/i18n';
import { type TabsProps } from '@coze-arch/bot-semi/Tabs';
import { TabPane, Tabs } from '@coze-arch/bot-semi';

import { DebugPanelLayout } from '../../../typings';
import { useDebugPanelStore } from '../../../store';
import { useDebugPanelLayoutConfig } from '../../../hooks/use-debug-panel-layout-config';
import {
  DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO,
  GraphTabEnum,
} from '../../../consts/static';

import s from './index.module.less';

interface PanelChartProps {
  rootSpan: CTrace;
  spans: CSpan[];
  targetDetailSpan?: CSpan;
  onTargetDetailSpanChange: (detailSpan: CSpan) => void;
}

const ChartResizableArea = (props: PropsWithChildren) => {
  const { children } = props;
  const [layoutConfig, setLayoutConfig] = useDebugPanelLayoutConfig();
  return (
    <Resizable
      minHeight={
        DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[DebugPanelLayout.Chat]
          .height.min
      }
      maxHeight={
        DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[DebugPanelLayout.Chat]
          .height.max
      }
      minWidth="100%"
      enable={{
        bottom: true,
      }}
      defaultSize={{
        height: layoutConfig.side[DebugPanelLayout.Chat],
        width: '100%',
      }}
      // eslint-disable-next-line max-params
      onResizeStop={(e, d, el, delta) => {
        setLayoutConfig(config => {
          config.side[DebugPanelLayout.Chat] += delta.height;
        });
      }}
    >
      <div className={classNames(s['resize-container-chat'])}>{children}</div>
    </Resizable>
  );
};

export const PanelChart = (props: PanelChartProps) => {
  const { rootSpan, spans, targetDetailSpan, onTargetDetailSpanChange } = props;
  const {
    basicInfo: { spaceID },
  } = useDebugPanelStore(
    useShallow(state => ({
      basicInfo: state.basicInfo,
    })),
  );
  const [activeTab, setActiveTab] = useState<GraphTabEnum>(
    GraphTabEnum.RunTree,
  );

  useEffect(() => {
    onTargetDetailSpanChange(rootSpan as CSpan);
  }, [rootSpan.id]);

  const renderTabBar = useCallback<
    Exclude<TabsProps['renderTabBar'], undefined>
  >(tabBarProps => {
    const { activeKey, list } = tabBarProps;

    return (
      <div className={s['chat-trace-tabs-bar']}>
        {list?.map(({ tab, itemKey }) => (
          <div
            className={classNames(s['chat-trace-tabs-bar-tab-bar'], {
              [s.active]: activeKey === itemKey,
            })}
            key={itemKey}
            onClick={() => setActiveTab(itemKey as GraphTabEnum)}
          >
            {tab}
          </div>
        ))}
      </div>
    );
  }, []);

  const onFlamethreadClick: InteractionEventHandler = useCallback(
    (_, element) => {
      const { span } = element?.data?.[0]?.extra as { span: CSpan };
      if (span?.id !== undefined) {
        onTargetDetailSpanChange(span);
      }
    },
    [],
  );

  return (
    <ChartResizableArea>
      <Tabs
        className={s['chat-trace-tabs']}
        activeKey={activeTab}
        renderTabBar={renderTabBar}
      >
        <TabPane
          tab={I18n.t('query_run_tree')}
          itemKey={GraphTabEnum.RunTree}
          className={s['chat-trace-tab-pane_scroll']}
        >
          <TraceTree
            className={s['chat-trace-tree']}
            dataSource={{
              type: DataSourceTypeEnum.SpanData,
              spanData: spans,
            }}
            spaceId={spaceID}
            selectedSpanId={targetDetailSpan?.id}
            onSelect={({ node }) => {
              const { span } = node.extra as { span: CSpan };
              if (span?.id !== undefined) {
                onTargetDetailSpanChange(span);
              }
            }}
          />
        </TabPane>
        <TabPane
          tab={I18n.t('query_flamethread')}
          className="h-full overflow-hidden"
          itemKey={GraphTabEnum.Flamethread}
        >
          <div className={s['chat-flamethread']}>
            <TraceFlamethread
              dataSource={{
                type: DataSourceTypeEnum.SpanData,
                spanData: spans,
              }}
              disableViewScroll
              selectedSpanId={targetDetailSpan?.id}
              axisLabelSuffix="ms"
              globalStyle={{
                height: '100%',
              }}
              onClick={onFlamethreadClick}
            />
          </div>
        </TabPane>
      </Tabs>
    </ChartResizableArea>
  );
};
