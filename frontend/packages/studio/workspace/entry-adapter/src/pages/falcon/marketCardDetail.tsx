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

/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import {
  Button,
  Breadcrumb,
  Form,
  Spin,
  Toast,
  Space,
  RadioGroup,
  Radio,
  Table,
  Pagination,
} from '@coze-arch/coze-design';
import { getParamsFromQuery } from '../../../../../../arch/bot-utils';
import { useParams } from 'react-router-dom';
import {
  IconCozArrowLeft,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import {
  Content,
  Header,
  SubHeaderSearch,
  HeaderTitle,
  SubHeaderFilters,
  Layout,
  SubHeader,
  HeaderActions,
  type DevelopProps,
} from '@coze-studio/workspace-base/develop';
import { IconCozPlus, IconCozEmpty } from '@coze-arch/coze-design/icons';
import { GridList, GridItem } from './components/gridList';
import placeholderImg from './assets/placeholder.png';

import cls from 'classnames';
import { replaceUrl, parseUrl } from './utils';
import { aopApi } from '@coze-arch/bot-api';

import styles from './index.module.less';

export const FalconMarketCardDetail = () => {
  const cardId = getParamsFromQuery({ key: 'card_id' });
  const creator = getParamsFromQuery({ key: 'creator' });
  const createTime = getParamsFromQuery({ key: 'createTime' });
  const previewImg = getParamsFromQuery({ key: 'preview_img' });
  const [cardDetail, setCardDetail] = useState({});
  const [showType, setShowType] = useState('preview');
  const [addCardId, setAddCardId] = useState('');
  const [versionPageNum, setVersionPageNum] = useState(1);
  const [versionList, setVersionList] = useState([]);
  const [versionTotal, setVersionTotal] = useState(0);
  const [cardList, setCardList] = useState([]);
  const pageSize = 30;
  const navigate = useNavigate();

  const addToMe = useCallback(() => {
    aopApi
      .CardMarketAddToMe({
        cardId: cardId,
      })
      .then(res => {
        Toast.success(I18n.t('Added'));
        setAddCardId(cardId);
      })
      .catch(err => {
        Toast.error(err.message);
      });
  }, [cardId]);

  useEffect(() => {
    aopApi
      .GetCardMarketVersionList({
        cardId: cardId,
        pageNo: versionPageNum,
        pageSize: pageSize,
      })
      .then(res => {
        const newList = res.body.versionList || [];
        setVersionList(newList);
        setVersionTotal(Number(res.body.totalNums));
      });
  }, [cardId, versionPageNum]);

  useEffect(() => {
    aopApi
      .GetCardMarketList({
        cardClassId: ~~(Math.random() * 11 + 1),
        pageNo: 1,
        pageSize: 4,
      })
      .then(res => {
        const newList = res.body.cardList || [];
        setCardList(newList);
      });

    aopApi
      .GetCardMarketDetail({
        cardId: cardId,
      })
      .then(res => {
        setCardDetail(res.body);
      })
      .catch(err => {
        Toast.error(err.message);
      });
  }, [cardId]);

  return (
    <div className="mt-[16px] mx-[24px]">
      <Header>
        <HeaderTitle>
          <Button
            color="secondary"
            icon={<IconCozArrowLeft />}
            onClick={() => navigate(-1)}
          >
            {I18n.t('back') + I18n.t('workspace_card_library')}
          </Button>
        </HeaderTitle>
      </Header>
      <div className={styles.marketCardDetailContent}>
        <div
          className="py-[24px] mx-[20px] flex items-start"
          style={{
            borderBottom:
              '1px solid rgba(var(--coze-stroke-5), var(--coze-stroke-5-alpha))',
          }}
        >
          <div className="flex-col flex-1">
            <div className="text-[24px] font-bold mb-[12px]">
              {cardDetail.cardName}
            </div>
            <Space spacing={12} className="text-[12px] coz-fg-secondary">
              <div>
                {I18n.t('Publisher')}：{creator || '暂无'}
              </div>
              <div>
                {I18n.t('PublishedTime')}：{createTime || '暂无'}
              </div>
            </Space>
            <div className="text-[16px] mt-[16px] coz-fg-secondary">
              {cardDetail.code}
            </div>
          </div>
          <Button
            size="large"
            type="primary"
            icon={<IconCozPlus />}
            onClick={addToMe}
            disabled={addCardId === cardId}
          >
            {I18n.t('workspace_card_add_my_workstation')}
          </Button>
        </div>
        <div className="mt-[24px] mx-[20px] flex gap-[24px]">
          <div className="flex-1">
            <RadioGroup
              type="button"
              value={showType}
              onChange={e => {
                setShowType(e.target.value);
              }}
            >
              <Radio value="preview">概览</Radio>
              <Radio value="version">版本</Radio>
            </RadioGroup>
            {showType === 'preview' && (
              <div className="mt-[16px]">
                <div className="text-[20px] font-[600] mb-[12px]">
                  {I18n.t('workspace_card_preview')}
                </div>
                <div className="w-full py-[54px] bg-[#EFF0F4] rounded-[6px]">
                  <div className="w-full h-[300px]">
                    <img
                      src={previewImg}
                      alt=""
                      className="block h-[100%] mx-[auto]"
                    />
                  </div>
                </div>
                <div className="text-[20px] font-[600] mb-[12px] mt-[24px]">
                  {I18n.t('workspace_card_params')}
                </div>
                <div
                  className="w-full px-[24px] py-[24px] bg-[#fff] rounded-[6px] mb-[24px]"
                  style={{
                    border:
                      '1px solid rgba(var(--coze-stroke-5), var(--coze-stroke-5-alpha))',
                  }}
                >
                  <Table
                    tableProps={{
                      columns: [
                        {
                          key: '1',
                          title: '参数',
                          dataIndex: 'paramName',
                        },
                        {
                          key: '2',
                          title: '名称',
                          dataIndex: 'paramDesc',
                        },
                        {
                          key: '3',
                          title: '类型',
                          dataIndex: 'paramType',
                          width: 100,
                          align: 'center',
                        },
                        {
                          key: '4',
                          title: '是否必填',
                          dataIndex: 'isRequired',
                          width: 100,
                          align: 'center',
                          render: (text, record) =>
                            record.isRequired === '1' ? '是' : '否',
                        },
                      ],
                      className: 'bg-[#fff]',
                      rowKey: 'paramId',
                      dataSource: cardDetail.paramList || [],
                      pagination: false,
                    }}
                    empty={
                      <div className="w-full h-full flex flex-col items-center pt-[20px]">
                        <IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />
                        <div className="text-[16px] font-[500] leading-[22px] mt-[8px] mb-[16px] coz-fg-primary">
                          {I18n.t('analytic_query_blank_context')}
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            )}
            {showType === 'version' && (
              <div
                className="w-full px-[24px] pt-[24px] pb-[8px] bg-[#fff] rounded-[6px] mt-[16px] mb-[24px]"
                style={{
                  border:
                    '1px solid rgba(var(--coze-stroke-5), var(--coze-stroke-5-alpha))',
                }}
              >
                <Table
                  tableProps={{
                    columns: [
                      {
                        key: '1',
                        title: I18n.t('ocean_deploy_list_pkg_version'),
                        dataIndex: 'version',
                      },
                      {
                        key: '2',
                        title: I18n.t('bot_publish_columns_platform'),
                        dataIndex: 'platformStatus',
                        align: 'left',
                        render: (_, record) => {
                          const platform = JSON.parse(
                            record.platformStatus || '[]',
                          );
                          return platform?.join('、') || '-';
                        },
                      },
                      {
                        key: '3',
                        title: I18n.t('PublishedTime'),
                        dataIndex: 'createTime',
                        align: 'left',
                        width: 200,
                      },
                    ],
                    className: 'bg-[#fff]',
                    rowKey: 'versionId',
                    dataSource: versionList || [],
                    pagination: {
                      total: versionTotal,
                      currentPage: versionPageNum,
                      pageSize,
                      onPageChange: setVersionPageNum,
                    },
                  }}
                  empty={
                    <div className="w-full h-full flex flex-col items-center pt-[20px]">
                      <IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />
                      <div className="text-[16px] font-[500] leading-[22px] mt-[8px] mb-[16px] coz-fg-primary">
                        {I18n.t('analytic_query_blank_context')}
                      </div>
                    </div>
                  }
                />
                {/* <Pagination
                  className={styles['version-pagination']}
                  total={versionTotal}
                  pageSize={pageSize}
                  currentPage={versionPageNum}
                  onPageChange={setVersionPageNum}
                /> */}
              </div>
            )}
          </div>
          <div className="w-[276px]">
            <div className="text-[18px] font-[600] mb-[20px]">
              {I18n.t('workspace_card_hot_recommend')}
            </div>
            <GridList averageItemWidth={276}>
              {cardList.map(item => (
                <GridItem key={item.cardId}>
                  <div
                    className={cls(
                      'px-[12px] h-full flex flex-col justify-between',
                    )}
                    onClick={e => {
                      navigate(
                        `/template/market-card-detail?card_id=${
                          item.cardId
                        }&preview_img=${replaceUrl(item.picUrl)}&creator=${
                          item.createUserName
                        }&createTime=${item.cardShelfTime}`,
                        { replace: true },
                      );
                    }}
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
          </div>
        </div>
      </div>
    </div>
  );
};
