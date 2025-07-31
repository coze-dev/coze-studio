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

import { type FC, useRef, useLayoutEffect, useState, useMemo } from 'react';

import { throttle } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Loading, Typography } from '@coze-arch/coze-design';

import {
  NodeSearchSectionType,
  type NodeSearchResult,
  type NodeSearchResultSection,
} from '@/typing';

import { SubWorkflowCategoryList } from '../sub-workflow-category-list';
import { PluginCategoryList } from '../plugin-node/plugin-category-list';
import { AtomCategoryList } from '../atom-category-list';
import { useNodePanelContext } from '../../hooks/node-panel-context';

import styles from './index.module.less';

const SearchResultSection: FC<{
  sectionData: NodeSearchResultSection;
}> = ({ sectionData }) => {
  const renderSection = ({ dataType, data }: NodeSearchResultSection) => {
    if (dataType === NodeSearchSectionType.Atom) {
      return <AtomCategoryList data={data} />;
    } else if (dataType === NodeSearchSectionType.Plugin) {
      return <PluginCategoryList data={data} />;
    } else if (dataType === NodeSearchSectionType.SubWorkflow) {
      return <SubWorkflowCategoryList data={data} />;
    }
  };

  const { getScrollContainer } = useNodePanelContext();
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [isSticky, setSticky] = useState(false);
  useLayoutEffect(() => {
    const scrollEl = getScrollContainer?.();
    if (!stickyHeaderRef.current || !scrollEl) {
      return;
    }
    const scrollElTop = scrollEl.getBoundingClientRect().top;
    const updateSticky = () => {
      const el = stickyHeaderRef.current;
      if (!el) {
        return;
      }

      const headerTop = el.getBoundingClientRect().top;
      setSticky(
        Math.round(scrollElTop - headerTop) === 0 && scrollEl.scrollTop !== 0,
      );
    };
    const handleScroll = throttle(() => updateSticky(), 200);

    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles['search-result-section']}>
      <div
        className={classNames(styles['search-result-section-title'], {
          [styles.sticky]: isSticky,
        })}
        ref={stickyHeaderRef}
      >
        {sectionData.name}
      </div>
      <div className={styles['search-result-section-content']}>
        {renderSection(sectionData)}
      </div>
    </div>
  );
};

export const SearchResultNodeList: FC<{
  searchResult: NodeSearchResult;
  loading: boolean;
}> = ({ searchResult, loading }) => {
  // (Only front-end search node & & loading) = > out of small circle
  const showSpinLoading = useMemo(
    () =>
      loading &&
      searchResult.length === 1 &&
      searchResult[0].dataType === NodeSearchSectionType.Atom,
    [searchResult, loading],
  );
  // (No nodes | | Both nodes of front-end search and back-end search have & & loading) = > out of a large circle
  const showMaskLoading = useMemo(
    () =>
      loading &&
      (searchResult.length === 0 ||
        searchResult.some(
          item => item.dataType !== NodeSearchSectionType.Atom,
        )),
    [searchResult, loading],
  );
  return (
    <div
      className="flex flex-col pb-4"
      data-testid="workflow.detail.node-panel.list"
    >
      {searchResult.map(sectionData => {
        const key = `${sectionData.dataType}_${sectionData.name}`;
        return <SearchResultSection key={key} sectionData={sectionData} />;
      })}
      {showSpinLoading ? (
        <div className="w-full flex items-center justify-center gap-[4px]">
          <Loading className="coz-fg-secondary" loading={true} size="mini" />
          <Typography.Text
            className="coz-fg-secondary relative top-[-2px]"
            weight={500}
          >
            {I18n.t('loading')}
          </Typography.Text>
        </div>
      ) : null}
      {showMaskLoading ? (
        <div className={styles['mask-loading']}>
          <Loading
            className="coz-fg-secondary"
            label={
              <Typography.Text
                className="coz-fg-secondary relative top-[-4px]"
                weight={500}
              >
                {I18n.t('loading')}
              </Typography.Text>
            }
            loading={true}
            size="large"
          >
            <div></div>
          </Loading>
        </div>
      ) : null}
    </div>
  );
};
