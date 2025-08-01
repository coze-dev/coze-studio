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
  forwardRef,
  type MouseEvent,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { throttle } from 'lodash-es';
import classNames from 'classnames';
import {
  Root,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@radix-ui/react-scroll-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty, IconCozMagnifier } from '@coze-arch/coze-design/icons';
import { EmptyState, Input } from '@coze-arch/coze-design';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { type UnionNodeTemplate } from '@/typing';

import { NodePanelContextProvider } from '../hooks/node-panel-context';
import { useSearchNode, useTemplateNodeList } from '../hooks';
import { PANEL_WIDTH, THROTTLE_INTERVAL } from '../constant';
import { SearchResultNodeList } from './search-result-node-list';
import {
  FavoritePluginNodeList,
  type FavoritePluginNodeListRefType,
} from './plugin-node/favorite-plugin-node-list';
import { AtomCategoryList } from './atom-category-list';

import styles from './styles.module.less';
export type NodeListRefType = FavoritePluginNodeListRefType;
interface NodesContainerProps {
  onSelect: (props: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: UnionNodeTemplate;
  }) => void;
  enableDrag?: boolean;
  containerNode?: WorkflowNodeEntity;
  adaptiveHeight?: number;
  /**
   * Update the status of the node being added. At this time, clickOutside will not close the node panel to avoid triggering onClose to close before the addition of the node is completed, and the previous connection cannot be destroyed.
   * @param isAdding
   * @returns
   */
  onAddingNode?: (isAdding: boolean) => void;
}
export const NodeList = forwardRef<NodeListRefType, NodesContainerProps>(
  (props, ref) => {
    const {
      onSelect,
      enableDrag = false,
      containerNode,
      adaptiveHeight,
      onAddingNode,
    } = props;
    const nodeCategoryList = useTemplateNodeList(containerNode);
    const nodeListRef = useRef<HTMLDivElement>();
    const [showBorder, setShowBorder] = useState(false);
    const [input, setInput] = useState('');

    const {
      showSearchResult,
      searchResult,
      isSearching,
      noSearchResult,
      loadMore,
      keyword,
      handleKeywordChange,
    } = useSearchNode({
      atomNodeCategoryList: nodeCategoryList,
    });

    useEffect(() => {
      if (!nodeListRef.current || showSearchResult) {
        setShowBorder(false);
        return;
      }
      const el = nodeListRef.current;
      const handleScroll = throttle(() => {
        if ((el.scrollTop ?? 0) > 0) {
          setShowBorder(true);
        } else {
          setShowBorder(false);
        }
      }, THROTTLE_INTERVAL);
      setShowBorder((nodeListRef.current?.scrollTop ?? 0) > 0);
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }, [showSearchResult]);
    const favoritePluginsRef = useRef<FavoritePluginNodeListRefType>();

    useImperativeHandle(ref, () => ({
      refetch: async () => {
        await favoritePluginsRef.current?.refetch();
      },
    }));

    useEffect(() => {
      const text = input.replaceAll(' ', ''); // Remove spaces
      handleKeywordChange(text);
    }, [input]);

    return (
      <div
        className={styles['node-panel']}
        style={{ height: adaptiveHeight, width: PANEL_WIDTH }}
        data-flow-editor-selectable="false"
        data-testid="workflow.detail.node-panel"
      >
        <svg style={{ width: 0, height: 0, display: 'block' }}>
          <clipPath
            id="favorite-plugin-clip-path"
            clipPathUnits="objectBoundingBox"
          >
            <path d="M0,1 H1 V0 C1,0.552,0.552,1,0,1"></path>
          </clipPath>
        </svg>
        <div
          className={classNames(
            styles['node-search'],
            showBorder ? styles['node-search-shadow'] : '',
          )}
          data-testid="workflow.detail.node-panel.search"
        >
          <Input
            className={styles['node-search-input']}
            showClear
            placeholder={I18n.t('workflow_250306_01')}
            value={input}
            onClear={() => setInput('')}
            onChange={setInput}
            prefix={<IconCozMagnifier style={{ fontSize: '16px' }} />}
          />
        </div>
        {noSearchResult ? (
          <EmptyState
            className="mx-auto mt-[128px] max-w-[270px]"
            icon={<IconCozEmpty />}
            size="large"
            title={I18n.t('workflow_250305_001')}
            description={I18n.t('workflow_250305_002')}
          />
        ) : null}
        <Root className={classNames('node-panel-render', styles['node-list'])}>
          <ScrollAreaViewport
            ref={nodeListRef as RefObject<HTMLDivElement>}
            className={styles.viewport}
          >
            <NodePanelContextProvider
              value={{
                onSelect,
                enableDrag,
                keyword,
                getScrollContainer: () => nodeListRef.current,
                onLoadMore: loadMore,
                onAddingNode,
              }}
            >
              {showSearchResult ? (
                <SearchResultNodeList
                  searchResult={searchResult}
                  loading={isSearching}
                />
              ) : (
                <div
                  className={styles['list-wrapper']}
                  data-testid="workflow.detail.node-panel.list"
                >
                  <AtomCategoryList data={[nodeCategoryList[0]]} />
                  <FavoritePluginNodeList
                    ref={
                      favoritePluginsRef as RefObject<FavoritePluginNodeListRefType>
                    }
                  />
                  <AtomCategoryList data={nodeCategoryList.slice(1)} />
                </div>
              )}
            </NodePanelContextProvider>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar
            className={styles.scrollbar}
            orientation="vertical"
          >
            <ScrollAreaThumb className={styles['scrollbar-thumb']} />
            <ScrollAreaCorner className={styles['scrollbar-corner']} />
          </ScrollAreaScrollbar>
        </Root>
      </div>
    );
  },
);
