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

import React, { useRef } from 'react';

import { debounce, isEmpty } from 'lodash-es';
import { produce } from 'immer';
import classNames from 'classnames';
import { BotE2e } from '@coze-data/e2e';
import { RerankTips, RewriteTips } from '@coze-common/biz-tooltip-ui';
import { I18n, getUnReactiveLanguage } from '@coze-arch/i18n';
import { Banner, Form, Switch } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import { getFlags } from '@coze-arch/bot-flags';
import {
  KnowledgeShowSourceMode,
  KnowledgeNoRecallReplyMode,
} from '@coze-arch/bot-api/playground_api';

import { recallStrategyUpdater } from './utils';
import { type RagModeConfigurationProps } from './type';
import { SliderSetting } from './slider-setting';
import { SettingItem } from './setting-item';
import { RadioGroupSetting } from './radio-group-setting';
import {
  MAX_TOP_K_VALUE,
  getAutomaticCallOptions,
  getShowSourceModeOptions,
  getNoRecallReplyOptions,
  getSearchStrategyOptions,
  localeMapLink,
} from './constant';

import styles from './index.module.less';

const DATASET_INFO_MIN_SCORE = 0.01;

/* eslint-disable @coze-arch/max-line-per-function*/

// eslint-disable-next-line complexity, max-lines-per-function
export function RagModeConfiguration({
  dataSetInfo,
  onDataSetInfoChange,
  showTitle = true,
  isReadonly = false,
  showNL2SQLConfig,
  showAuto = true,
  showSourceDisplay = true,
}: RagModeConfigurationProps): JSX.Element {
  const {
    auto,
    min_score: minScore,
    top_k: topK,
    search_strategy: searchStrategy,
    show_source,
    no_recall_reply_mode,
    no_recall_reply_customize_prompt,
    show_source_mode,
    recall_strategy = {},
  } = dataSetInfo;

  // Undefined defaults to true
  const {
    use_nl2sql = true,
    use_rerank = true,
    use_rewrite = true,
  } = recall_strategy;

  const language = getUnReactiveLanguage();
  const FLAGS = getFlags();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const debounceOnNoRecallReplyCustomizePromptChange = debounce(v => {
    onDataSetInfoChange({
      ...dataSetInfo,
      no_recall_reply_customize_prompt: v,
    });
  }, 300);

  return (
    <div className={styles.setting}>
      {showTitle ? (
        <div
          data-testid={BotE2e.BotKnowledgeSettingModalTitle}
          className={classNames(
            styles['setting-title'],
            'dataset-setting-content-title',
          )}
        >
          {I18n.t('dataset_settings_title')}
        </div>
      ) : null}
      <div className={styles.recall_title}>
        {I18n.t('dataset-setting_recall_title')}
      </div>
      {showAuto ? (
        <SettingItem
          title={I18n.t('dataset_call_method')}
          tip={I18n.t('knowledge_call_method_tooltip')}
        >
          <RadioGroupSetting
            options={getAutomaticCallOptions()}
            value={auto ? 1 : 0}
            onChange={v => onDataSetInfoChange({ ...dataSetInfo, auto: !!v })}
            disabled={isReadonly}
          />
        </SettingItem>
      ) : null}
      <SettingItem
        title={I18n.t('knowledge_search_strategy_title')}
        tip={I18n.t('knowledge_search_strategy_tooltip')}
      >
        <RadioGroupSetting
          options={getSearchStrategyOptions()}
          value={searchStrategy ?? 0}
          onChange={v =>
            onDataSetInfoChange({ ...dataSetInfo, search_strategy: v })
          }
          disabled={isReadonly}
        />
      </SettingItem>
      <SettingItem
        title={I18n.t('dataset_max_recall')}
        tip={I18n.t('bot_edit_datasetsSettings_MaxTip')}
      >
        <SliderSetting
          min={1}
          max={10}
          step={1}
          precision={0}
          value={topK}
          marks={{ 3: I18n.t('dataset_max_recall_default') }}
          onChange={v => {
            onDataSetInfoChange({
              ...dataSetInfo,
              top_k: v,
            });
          }}
          disabled={isReadonly}
        />
      </SettingItem>
      {topK > MAX_TOP_K_VALUE && (
        <Banner
          bordered
          type="warning"
          fullMode={false}
          closeIcon={null}
          className={classNames(
            styles['tip-area'],
            'dataset-setting-content-tip-area',
          )}
          icon={<IconWarningInfo className={styles.icon} />}
          description={
            <span className={styles.desc}>
              {I18n.t('dataset_max_recall_desc')}
            </span>
          }
        />
      )}
      {recall_strategy.use_rerank ? (
        <SettingItem
          title={I18n.t('dataset_min_degree')}
          tip={I18n.t('bot_edit_datasetsSettings_MinTip')}
        >
          <SliderSetting
            min={DATASET_INFO_MIN_SCORE}
            max={0.99}
            step={0.01}
            precision={2}
            value={minScore}
            marks={{ 0.5: I18n.t('dataset_min_degree_default') }}
            disabled={isReadonly}
            onChange={v => {
              onDataSetInfoChange({
                ...dataSetInfo,
                min_score: v,
              });
            }}
          />
        </SettingItem>
      ) : null}
      {showNL2SQLConfig ? (
        <SettingItem
          title={I18n.t('kl_write_022')}
          tip={I18n.t('kl_write_023')}
        >
          <Switch
            checked={use_nl2sql}
            onChange={value => {
              onDataSetInfoChange(
                produce(dataSetInfo, draft =>
                  recallStrategyUpdater({
                    datasetInfo: draft,
                    field: 'use_nl2sql',
                    value,
                  }),
                ),
              );
            }}
          />
        </SettingItem>
      ) : null}
      <SettingItem title={I18n.t('kl_write_024')} tip={<RewriteTips />}>
        <Switch
          checked={use_rewrite}
          onChange={value => {
            onDataSetInfoChange(
              produce(dataSetInfo, draft =>
                recallStrategyUpdater({
                  datasetInfo: draft,
                  field: 'use_rewrite',
                  value,
                }),
              ),
            );
          }}
        />
      </SettingItem>
      <SettingItem title={I18n.t('kl_write_026')} tip={<RerankTips />}>
        <Switch
          checked={use_rerank}
          onChange={value => {
            onDataSetInfoChange(
              produce(dataSetInfo, draft => {
                const nextState = {
                  datasetInfo: draft,
                  field: 'use_rerank',
                  value,
                } as const;

                if (!value) {
                  nextState.datasetInfo.min_score = 0;
                } else if (!nextState.datasetInfo.min_score) {
                  nextState.datasetInfo.min_score = DATASET_INFO_MIN_SCORE;
                }

                return recallStrategyUpdater(nextState);
              }),
            );
          }}
        />
      </SettingItem>
      {FLAGS['bot.data.no_recall_reply'] ? (
        <div className={styles['setting-source-display']}>
          <div className={styles['setting-source-display-title']}>
            {I18n.t('No_recall_001')}
          </div>
          <SettingItem
            title={I18n.t('No_recall_002')}
            tip={
              <div className={styles.display_tooltip}>
                {I18n.t('No_recall_005')}
              </div>
            }
          >
            <RadioGroupSetting
              options={getNoRecallReplyOptions()}
              value={no_recall_reply_mode ?? KnowledgeNoRecallReplyMode.Default}
              onChange={v =>
                onDataSetInfoChange({
                  ...dataSetInfo,
                  no_recall_reply_mode: v,
                  no_recall_reply_customize_prompt:
                    v === KnowledgeNoRecallReplyMode.CustomizePrompt &&
                    isEmpty(no_recall_reply_customize_prompt)
                      ? I18n.t('No_recall_006')
                      : no_recall_reply_customize_prompt,
                })
              }
              disabled={isReadonly}
            />
          </SettingItem>
          {no_recall_reply_mode ===
          KnowledgeNoRecallReplyMode.CustomizePrompt ? (
            <Form<Record<string, unknown>>
              initValues={{
                no_recall_reply_customize_prompt:
                  no_recall_reply_customize_prompt ?? I18n.t('No_recall_006'),
              }}
            >
              <Form.TextArea
                maxLength={500}
                maxCount={500}
                ref={textAreaRef}
                onChange={debounceOnNoRecallReplyCustomizePromptChange}
                rows={2}
                disabled={isReadonly}
                placeholder={I18n.t(
                  'card_builder_dataEditor_get_errormsg_please_enter',
                )}
                pure
                field="no_recall_reply_customize_prompt"
              />
            </Form>
          ) : null}
        </div>
      ) : null}
      {FLAGS['bot.data.source_display'] && showSourceDisplay ? (
        <div className={styles['setting-source-display']}>
          <div
            className={styles['setting-source-display-title']}
            data-testid={BotE2e.BotKnowledgeSettingShowSourceDisplayTitle}
          >
            {I18n.t('knowledge_source_display_title')}
          </div>
          <SettingItem
            title={I18n.t('knowledge_source_display_status')}
            tipStyle={{
              backgroundColor: '#fff',
              color: 'var(--Light-usage-text---color-text-0, #1D1C24)',
              maxWidth: '453px',
              minWidth: '453px',
            }}
            tip={
              <div className={styles.display_tooltip}>
                <div className={styles.display_tooltip_title}>
                  {I18n.t('knowledge_source_display_tooltip_title')}
                </div>
                <div className={styles.display_tooltip_content}>
                  <div>
                    {I18n.t('knowledge_source_display_tooltip_content')}
                  </div>
                  <div className={styles.display_tooltip_content_link}>
                    <div className={styles.link_num}>1.</div>
                    <div
                      className={styles.display_tooltip_link}
                      onClick={() =>
                        window.open(
                          `${window.location.origin}${
                            localeMapLink[language] || '/docs/guides/knowledge'
                          }`,
                        )
                      }
                    >
                      {I18n.t('knowledge_source_display_tooltip_link')}
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Switch
              data-testid={BotE2e.BotKnowledgeSettingShowSourceDisplaySwitch}
              className={styles.display_status}
              checked={show_source}
              disabled={isReadonly}
              onChange={v => {
                onDataSetInfoChange({
                  ...dataSetInfo,
                  show_source: v,
                  // Display method has no value and open the display source, the card is selected by default
                  ...(!show_source_mode && v
                    ? {
                        show_source_mode: KnowledgeShowSourceMode.CardList,
                      }
                    : {}),
                });
              }}
            />
          </SettingItem>

          {show_source ? (
            <SettingItem title={I18n.t('Display format')}>
              <RadioGroupSetting
                options={getShowSourceModeOptions()}
                value={show_source_mode ?? KnowledgeShowSourceMode.ReplyBottom}
                onChange={v =>
                  onDataSetInfoChange({ ...dataSetInfo, show_source_mode: v })
                }
                disabled={isReadonly}
              />
            </SettingItem>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
