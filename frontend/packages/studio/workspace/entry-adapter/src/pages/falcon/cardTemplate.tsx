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

/* eslint-disable import/order */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eslint-comments/require-description */
/* eslint-disable unicorn/filename-case */
import { type FC, useEffect, useCallback, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import cls from 'classnames';

import {
  Content,
  Header,
  HeaderTitle,
  Layout,
  HeaderActions,
  type DevelopProps,
  WorkspaceEmpty,
} from '@coze-studio/workspace-base/develop';
import {
  Search,
  Spin,
} from '@coze-arch/coze-design';
import { GridList, GridItem } from './components/gridList';
import { aopApi } from '@coze-arch/bot-api';
import { replaceUrl } from './utils';
import placeholderImg from './assets/placeholder.png';
import bannerImg from './assets/cardTemplateBanner.png';

import styles from './index.module.less';

let timer: NodeJS.Timeout | null = null;
const delay = 300;

export const FalconCardTemplate: FC<DevelopProps> = () => {
  const { sub_route_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [filterQueryText, setFilterQueryText] = useState('');
  const [cardList, setCardList] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageNoRef = useRef(1);
  const allPageCountRef = useRef(1);

  const getCardListData = useCallback(
    (isAppend = false) => {
      if (isAppend) {
        if (pageNoRef.current > allPageCountRef.current) {
          return;
        }
        pageNoRef.current++;
      } else {
        pageNoRef.current = 1;
        setCardList([]);
      }

      setLoading(true);
      aopApi
        .GetCardMarketList({
          searchValue: filterQueryText,
          cardClassId: sub_route_id === 'all' ? '' : sub_route_id,
          pageNo: pageNoRef.current,
          pageSize: 30,
        })
        .then(res => {
          const newList = res.body.cardList || [];
          allPageCountRef.current = Number(res.body.totalPages);
          if (isAppend) {
            setCardList(prev => [...prev, ...newList]);
          } else {
            setCardList(newList);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [filterQueryText, sub_route_id],
  );

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !loading) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100;
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        getCardListData(true);
      }
    }
  }, [getCardListData, loading]);

  useEffect(() => {
    getCardListData();
  }, [getCardListData]);

  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <span>{I18n.t('workspace_card_template')}</span>
        </HeaderTitle>
        <HeaderActions>
          <Search
            showClear={true}
            className="w-[200px]"
            placeholder={I18n.t('workspace_card_search_service')}
            value={filterQueryText}
            onChange={val => {
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => {
                setFilterQueryText(val);
              }, delay);
            }}
          />
        </HeaderActions>
      </Header>
      <Content ref={scrollRef} onScroll={handleScroll}>
        {sub_route_id === 'all' && (
          <div className="w-full mb-[16px]">
            <img src={bannerImg} alt="" className="w-full block" />
          </div>
        )}
        <GridList>
          {cardList.map(item => (
            <GridItem key={item.cardId}>
              <div
                className={cls(
                  'px-[16px] h-full flex flex-col justify-between',
                )}
              >
                <div className="py-[12px]">
                  <div className="flex flex-col gap-[8px]">
                    <div
                      className="w-full h-[180px] px-[12px] py-[12px] bg-[#EFF0F4] rounded-[6px]"
                      style={{
                        background: `#EFF0F4 url("${placeholderImg}") no-repeat center center / 108px auto`,
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          background: `url("${replaceUrl(item.picUrl)}") no-repeat center center / contain`,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex gap-[6px] mb-[4px] items-center">
                        <div className="text-[18px] font-medium">
                          {item.cardName}
                        </div>
                      </div>
                      <div className={styles.cardTag}>{item.code}</div>
                    </div>
                  </div>
                </div>
              </div>
            </GridItem>
          ))}
        </GridList>
        {!cardList?.length && !loading ? <WorkspaceEmpty /> : null}
        {loading ? (
          <Spin>
            <div className="w-full h-[100px] flex items-center justify-center" />
          </Spin>
        ) : null}
      </Content>
    </Layout>
  );
};

export default FalconCardTemplate;
