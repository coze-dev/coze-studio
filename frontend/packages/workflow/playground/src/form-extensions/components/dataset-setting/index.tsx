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
 
/* eslint-disable complexity */
import { type FC, useEffect, useState, useMemo } from 'react';

import { isNil, set, omit } from 'lodash-es';
import { useNodeTestId } from '@coze-workflow/base';
import { RewriteTips, RerankTips } from '@coze-common/biz-tooltip-ui';
import { type Dataset, FormatType } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import { Popover } from '@coze-arch/coze-design';

import { CheckboxWithLabel } from '../checkbox-with-label';
import { Strategy, type DataSetInfo } from './type';
import { TitleArea, SliderArea, SearchStrategy } from './components';

import s from './index.module.less';

/** 超出此数值进行提示 */
const SUGGEST_TOP_K = 5;
/** 默认最小匹配度 */
const DEFAULT_MIN_SCORE = 0.5;
/** 默认最大召回数  */
const DEFAULT_TOP_K = 5;

export interface DataSetSettingProps {
  dataSetInfo: DataSetInfo;
  onDataSetInfoChange: (v: DataSetInfo) => void;
  readonly?: boolean;
  disabled?: boolean;
  style?: Record<string, unknown>;
  isReady?: boolean;
  dataSets?: Dataset[];
}

export const DataSetSetting: FC<DataSetSettingProps> = ({
  dataSetInfo,
  onDataSetInfoChange,
  readonly,
  disabled,
  style,
  isReady,
  dataSets,
}) => {
  const {
    min_score: minScore,
    top_k: topK,
    strategy,
    use_nl2sql: useNl2sql,
    use_rerank: useRerank,
    use_rewrite: useRewrite,
    is_personal_only: isPersonalOnly,
  } = dataSetInfo || {};

  const isDatasetWriteActive = true;

  const [isDatasetEmpty, setDatasetEmpty] = useState(true);

  const isContainSqlDataSet = useMemo(
    () => dataSets?.some(dataset => dataset?.format_type === FormatType.Table),
    [dataSets],
  );

  const { getNodeSetterId } = useNodeTestId();

  // 设置默认值
  useEffect(() => {
    if (isDatasetEmpty) {
      return;
    }

    if (
      isNil(minScore) &&
      isNil(topK) &&
      isNil(strategy) &&
      isNil(useRerank) &&
      isNil(useRewrite) &&
      isNil(isPersonalOnly)
    ) {
      const initDataSetInfo = {
        min_score: DEFAULT_MIN_SCORE,
        top_k: DEFAULT_TOP_K,
        strategy: Strategy.Hybird,
      };

      if (isDatasetWriteActive) {
        set(initDataSetInfo, 'use_rerank', true);
        set(initDataSetInfo, 'use_rewrite', true);
        set(initDataSetInfo, 'is_personal_only', true);
      }

      // 新增节点的搜索策略默认为 Hybird
      onDataSetInfoChange?.({
        ...dataSetInfo,
        ...initDataSetInfo,
      });
    } else if (isNil(strategy)) {
      // 存量流程的搜索策略默认为 Hybird
      onDataSetInfoChange?.({
        ...dataSetInfo,
        strategy: Strategy.Hybird,
      });
    } else if (
      // 存量流程补充默认值
      isNil(useRerank) &&
      isNil(useRewrite) &&
      isNil(isPersonalOnly) &&
      isDatasetWriteActive
    ) {
      onDataSetInfoChange?.({
        ...dataSetInfo,
        use_rerank: true,
        use_rewrite: true,
        is_personal_only: true,
      });
    }
  }, [dataSetInfo, isDatasetWriteActive, isContainSqlDataSet, isDatasetEmpty]);

  useEffect(() => {
    // 避免未请求到知识库列表数据导致 isContainSqlDataSet 状态错误的情况
    if (!isReady) {
      return;
    }
    if (isNil(useNl2sql)) {
      if (isContainSqlDataSet) {
        const nextDataSetInfo = {
          ...dataSetInfo,
          use_nl2sql: true,
        };
        onDataSetInfoChange(nextDataSetInfo as DataSetInfo);
      }
    } else {
      // 无表格数据库清除该字段
      if (!isContainSqlDataSet) {
        const nextDataSetInfo = omit(dataSetInfo, ['use_nl2sql']);
        onDataSetInfoChange(nextDataSetInfo as DataSetInfo);
      }
    }
  }, [isContainSqlDataSet, useNl2sql, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    // 无数据库时清空数据
    setDatasetEmpty(!dataSets?.length);
    if (!dataSets?.length) {
      const nextDataSetInfo = {};
      onDataSetInfoChange(nextDataSetInfo as DataSetInfo);
    }
  }, [dataSets, isReady, setDatasetEmpty]);

  const [minScoreVisible, setMinScoreVisible] = useState(true);

  useEffect(() => {
    setMinScoreVisible(!!useRerank);
    let nextDataSetInfo: DataSetInfo;
    if (!useRerank) {
      nextDataSetInfo = omit(dataSetInfo, ['min_score']);
      onDataSetInfoChange?.(nextDataSetInfo);
    } else if (useRerank && isNil(minScore)) {
      nextDataSetInfo = {
        ...dataSetInfo,
        min_score: DEFAULT_MIN_SCORE,
      };
      onDataSetInfoChange?.(nextDataSetInfo);
    }
  }, [useRerank, setMinScoreVisible]);

  const [topKSuggestVisible, setTopKSuggestVisible] = useState(false);

  const suggestTopKPopover = () => (
    <div className={s['tip-area']}>
      <IconWarningInfo></IconWarningInfo>
      <div className={s['tip-area-content']}>
        <div className={s['tip-area-title']}>
          {I18n.t('workflow_detail_knowledge_proceed_with_caution')}
        </div>
        <div className={s['tip-area-text']}>
          {I18n.t('dataset_max_recall_desc')}
        </div>
      </div>
    </div>
  );

  if (isDatasetEmpty) {
    return <></>;
  }

  return (
    // 设置定位防止滑动条偏移过度
    <div className={s.setting} style={{ ...style, position: 'relative' }}>
      <div className={s['setting-item']}>
        <TitleArea
          title={I18n.t('knowledge_search_strategy_title')}
          tip={I18n.t('knowledge_search_strategy_tooltip')}
        />
        <SearchStrategy
          readonly={readonly}
          value={strategy as Strategy}
          onChange={v => {
            onDataSetInfoChange(
              v === Strategy.FullText
                ? {
                    top_k: dataSetInfo?.top_k,
                    strategy: v,
                  }
                : {
                    ...dataSetInfo,
                    // 从 fulltext -> 其余策略，需要默认添加 min_score
                    min_score: dataSetInfo?.min_score || DEFAULT_MIN_SCORE,
                    strategy: v,
                  },
            );
          }}
        />
      </div>

      <div className={s['setting-item']}>
        <TitleArea
          title={I18n.t('dataset_max_recall')}
          tip={I18n.t('bot_edit_datasetsSettings_MaxTip')}
        />
        <Popover
          showArrow={false}
          position="bottom"
          trigger="custom"
          visible={topKSuggestVisible}
          content={suggestTopKPopover}
          onClickOutSide={() => {
            setTopKSuggestVisible(false);
          }}
          className={s['dataset-top-k-popover']}
          getPopupContainer={() => document.body}
        >
          <div style={{ position: 'relative' }}>
            <SliderArea
              min={1}
              max={20}
              step={1}
              value={topK}
              customStyles={{
                sliderAreaStyle: {
                  width: '160px',
                },
                boundaryStyle: {
                  width: '158px',
                  margin: 0,
                },
              }}
              isDataSet
              marks={{
                markKey: DEFAULT_TOP_K,
                // 设置 margin-left 避免和数字 1 重合
                markText: <span className="ml-2">Default</span>,
              }}
              onChange={v => {
                onDataSetInfoChange({
                  ...dataSetInfo,
                  top_k: v,
                });
                if (v > SUGGEST_TOP_K) {
                  setTopKSuggestVisible(true);
                } else {
                  setTopKSuggestVisible(false);
                }
              }}
              onClickDefault={() => {
                onDataSetInfoChange({
                  ...dataSetInfo,
                  top_k: DEFAULT_TOP_K,
                });
              }}
              // semi版本不够高
              // onMouseUp={e => {
              //   console.info('e', { e });
              // if (v > SUGGEST_TOP_K) {
              //   setTopKSuggestVisible(true);
              // } else {
              //   setTopKSuggestVisible(false);
              // }
              // }}
              disabled={readonly || disabled}
            />
          </div>
        </Popover>
      </div>

      {minScoreVisible && strategy !== Strategy.FullText ? (
        <div className={s['setting-item']}>
          <TitleArea
            title={I18n.t('dataset_min_degree')}
            tip={I18n.t('bot_edit_datasetsSettings_MinTip')}
          />
          <div style={{ position: 'relative' }}>
            <SliderArea
              min={0.01}
              max={0.99}
              step={0.01}
              customStyles={{
                sliderAreaStyle: {
                  width: '160px',
                },
                boundaryStyle: {
                  width: '158px',
                  margin: 0,
                },
              }}
              isDataSet
              value={minScore as number}
              marks={{ markKey: 0.5, markText: 'Default' }}
              disabled={readonly || disabled}
              onChange={v => {
                onDataSetInfoChange({
                  ...dataSetInfo,
                  min_score: v,
                });
              }}
              onClickDefault={() => {
                onDataSetInfoChange({
                  ...dataSetInfo,
                  min_score: DEFAULT_MIN_SCORE,
                });
              }}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
      {isDatasetWriteActive && isContainSqlDataSet ? (
        <div className={s['setting-item']}>
          <CheckboxWithLabel
            checked={useNl2sql}
            onChange={checked => {
              onDataSetInfoChange({
                ...dataSetInfo,
                use_nl2sql: checked,
              });
            }}
            readonly={readonly}
            label={I18n.t('kl_write_022')}
            description={I18n.t('kl_write_023')}
            dataTestId={getNodeSetterId('dataset_use_nl2sql')}
          />
        </div>
      ) : null}

      {isDatasetWriteActive ? (
        <>
          <CheckboxWithLabel
            checked={useRewrite}
            onChange={checked => {
              onDataSetInfoChange({
                ...dataSetInfo,
                use_rewrite: checked,
              });
            }}
            readonly={readonly}
            label={I18n.t('kl_write_024')}
            description={I18n.t('kl_write_025')}
            dataTestId={getNodeSetterId('dataset_use_rewrite')}
            tooltip={<RewriteTips />}
            tipWrapperClassName={s['tips-container']}
          />
          <CheckboxWithLabel
            checked={useRerank}
            onChange={checked => {
              onDataSetInfoChange({
                ...dataSetInfo,
                use_rerank: checked,
              });
            }}
            readonly={readonly}
            label={I18n.t('kl_write_026')}
            description={I18n.t('kl_write_027')}
            dataTestId={getNodeSetterId('dataset_use_rerank')}
            tooltip={<RerankTips />}
            tipWrapperClassName={s['tips-container']}
          />
          <CheckboxWithLabel
            checked={isPersonalOnly}
            onChange={checked => {
              onDataSetInfoChange({
                ...dataSetInfo,
                is_personal_only: checked,
              });
            }}
            readonly={readonly}
            label={I18n.t('kl_write_028')}
            description={I18n.t('kl_write_029')}
            dataTestId={getNodeSetterId('dataset_is_only_personal')}
          />
        </>
      ) : null}
    </div>
  );
};
