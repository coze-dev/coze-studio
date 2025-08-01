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

import copy from 'copy-to-clipboard';
import { BotE2e } from '@coze-data/e2e';
import { I18n, getUnReactiveLanguage } from '@coze-arch/i18n';
import { UITag, Toast, Tooltip, Image, Typography } from '@coze-arch/bot-semi';
import { IconCopy } from '@coze-arch/bot-icons';
import {
  KnowledgeShowSourceMode,
  KnowledgeNoRecallReplyMode,
} from '@coze-arch/bot-api/playground_api';

import ZhCustomizePromptPNG from '../assets/customize-prompt-zh.png';
import EnCustomizePromptPNG from '../assets/customize-prompt-en.png';
import { type RadioItem } from './radio-group-setting';

import styles from './index.module.less';

export const MAX_TOP_K_VALUE = 5;
export const FULL_TEXT_SEARCH_KEY = 20;

export const getSearchStrategyOptions = () => [
  {
    label: I18n.t('knowledge_hybird_search_title'),
    value: 1,
    tip: I18n.t('knowledge_hybird_search_tooltip'),
  },
  {
    label: I18n.t('knowledge_semantic_search_title'),
    value: 0,
    tip: I18n.t('knowledge_semantic_search_tooltip'),
  },
  {
    label: I18n.t('knowledge_full_text_search_title'),
    value: 20,
    tip: I18n.t('knowledge_full_text_search_tooltip'),
  },
];

export const getAutomaticCallOptions = () => {
  const onCopy = (text: string) => {
    const res = copy(text);
    if (!res) {
      return;
    }
    Toast.success({
      content: I18n.t('copy_success'),
      showClose: false,
    });
  };

  return [
    {
      e2e: BotE2e.BotKnowledgeSettingModalAutoRadio,
      label: I18n.t('dataset_automatic_call'),
      value: 1,
    },
    {
      e2e: BotE2e.BotKnowledgeSettingModalManualRadio,
      label: I18n.t('dataset_on_demand_call'),
      value: 0,
      desc: (
        <>
          {I18n.t('bot_edit_dataset_on_demand_prompt1')}
          <Tooltip content={I18n.t('bot_edit_datasets_copyName')}>
            <UITag
              onClick={() => onCopy(I18n.t('dataset_recall_copy_value'))}
              type="light"
              className={styles['setting-item-copy']}
            >
              {I18n.t('dataset_recall_copy_label')}
              <IconCopy className={styles['icon-copy']} />
            </UITag>
          </Tooltip>
          {I18n.t('bot_edit_dataset_on_demand_prompt2')}
        </>
      ),
    },
  ];
};

export const getNoRecallReplyOptions = (): RadioItem[] => [
  {
    e2e: BotE2e.BotKnowledgeSettingNoRecallReplyModeDefaultRadio,
    label: I18n.t('No_recall_003'),
    value: KnowledgeNoRecallReplyMode.Default,
  },
  {
    e2e: BotE2e.BotKnowledgeSettingNoRecallReplyModeCustomizePromptRadio,
    label: I18n.t('No_recall_004'),
    value: KnowledgeNoRecallReplyMode.CustomizePrompt,
    tip: (
      <>
        <div
          style={{
            lineHeight: '20px',
            color: 'rgba(29, 28, 35, 1)',
            marginBottom: '8px',
          }}
        >
          {I18n.t('No_recall_007')}
        </div>
        <Image
          width={344}
          preview={false}
          src={
            I18n.language === 'zh-CN'
              ? ZhCustomizePromptPNG
              : EnCustomizePromptPNG
          }
        />
      </>
    ),
    tipStyle: {
      backgroundColor: '#fff',
      padding: '16px',
      minWidth: '376px',
      maxWidth: '376px',
    },
  },
];

export const localeMapLink: Record<string, string> = {
  'zh-CN': '/docs/guides/knowledge',
  en: '/docs/guides/knowledge_overview?_lang=en',
};

export const getShowSourceModeOptions = (): RadioItem[] => {
  const language = getUnReactiveLanguage();

  const goToGuides = (module = 'knowledge') => {
    window.open(
      `${window.location.origin}${
        localeMapLink[language] || `/docs/guides/${module}`
      }`,
    );
  };

  return [
    {
      e2e: BotE2e.BotKnowledgeSettingShowSourceModeCardRadio,
      label: I18n.t('knowledge_source_card_0002'),
      value: KnowledgeShowSourceMode.CardList,
      tip: (
        <div className={styles['show-source-mode-tip']}>
          <div className={styles.title}>
            {I18n.t('knowledge_source_card_0004')}
          </div>
          <div className={styles.space}>
            {[
              {
                title: I18n.t('what_is_coze'),
                content: I18n.t('landingpage_description'),
                guideModule: 'welcome',
              },
              {
                title: I18n.t('knowledge_source_display_tooltip_link'),
                content: I18n.t('knowledge_source_display_tooltip_content'),
                guideModule: 'knowledge',
              },
            ].map(i => (
              <div
                className={styles.card}
                onClick={e => {
                  goToGuides(i.guideModule);
                }}
              >
                <div className={styles.title}>
                  <div>{i.title}</div>
                </div>
                <Typography.Text
                  className={styles.content}
                  ellipsis={{
                    rows: 3,
                    showTooltip: false,
                  }}
                >
                  {i.content}
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>
      ),
      tipStyle: {
        backgroundColor: '#fff',
        maxWidth: '436px',
        minWidth: '436px',
        padding: '16px',
      },
    },
    {
      e2e: BotE2e.BotKnowledgeSettingShowSourceModeTextRadio,
      label: I18n.t('knowledge_source_card_0001'),
      value: KnowledgeShowSourceMode.ReplyBottom,
      tip: (
        <div className={styles['show-source-mode-tip']}>
          <div className={styles.title}>
            {I18n.t('knowledge_source_card_0003')}
          </div>
          <div className={styles.main}>
            <Typography.Text className={styles.content}>
              {I18n.t('knowledge_source_display_tooltip_content')}
            </Typography.Text>
            <div className={styles.link}>
              <div
                onClick={e => {
                  goToGuides();
                }}
              >
                1. {I18n.t('knowledge_source_display_tooltip_link')}
              </div>
            </div>
          </div>
        </div>
      ),
      tipStyle: {
        backgroundColor: '#fff',
        maxWidth: '436px',
        minWidth: '436px',
        padding: '16px',
      },
    },
  ];
};
