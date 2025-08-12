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

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Card, Tag, Tooltip } from '@coze-arch/bot-semi';
import { DocumentSource, FormatType } from '@coze-arch/bot-api/knowledge';

import { ReactComponent as LinkToKnowledgeIcon } from '../../assets/link-to-knowledge.svg';
import { filterUnnecessaryContentFromSlice } from './helpers/filter-unnecessary-content-from-slice';

import styles from './index.module.less';

export interface LLMOutput {
  meta: {
    dataset: {
      id: number;
      name: string;
    };
    document: {
      id: number;
      source_type: number;
      format_type: number;
      name: string;
    };
    link: {
      title: string;
      url: string;
    };
  };
  score: number;
  slice: string;
}

const getSourceTypeDescription = (sourceType: number): string | undefined =>
  ({
    [DocumentSource.Custom]: I18n.t('chat-area-knowledge-custom-data-source'),
    [DocumentSource.Document]: I18n.t('chat-area-knowledge-local-data-source'),
    [DocumentSource.FeishuWeb]: I18n.t(
      'chat-area-knowledge-feishu-data-source',
    ),
    [DocumentSource.Web]: I18n.t('chat-area-knowledge-online-data-source'),
    [DocumentSource.FrontCrawl]: I18n.t(
      'chat-area-knowledge-crawl-data-source',
    ),
    [DocumentSource.GoogleDrive]: I18n.t(
      'chat-area-knowledge-google-data-source',
    ),
    [DocumentSource.Notion]: I18n.t('chat-area-knowledge-notion-data-source'),
    [DocumentSource.LarkWeb]: I18n.t('Lark_00002'),
  }[sourceType]);

const getFormatTypeDescription = (formatType: number): string | undefined =>
  ({
    [FormatType.Table]: I18n.t('knowledge-dataset-type-table'),
    [FormatType.Text]: I18n.t('knowledge-dataset-type-text'),
    [FormatType.Image]: I18n.t('knowledge_photo_025'),
  }[formatType]);

function RecallSlice(props: { llmOutput: LLMOutput; index: number }) {
  const { llmOutput, index } = props;
  const { meta, slice, score } = llmOutput;

  const [isOpen, setIsOpen] = useState(false);
  const [needCollapse, setNeedCollapse] = useState(false);
  const sliceContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNeedCollapse(
      (sliceContentRef.current?.scrollHeight ?? 0) >
        (sliceContentRef.current?.clientHeight ?? 0),
    );
  }, []);

  const formatTypeDesc = useMemo(
    () =>
      meta.document.format_type
        ? getFormatTypeDescription(meta.document.format_type)
        : null,
    [meta.document],
  );

  const sourceTypeDesc = useMemo(
    () =>
      meta.document.source_type
        ? getSourceTypeDescription(meta.document.source_type)
        : null,
    [meta.document],
  );

  // Change the back to staring.
  const sliceTag = `Recall slice ${index + 1}`;

  const filteredSlice = filterUnnecessaryContentFromSlice(slice);

  return (
    <div className={styles['recall-slice']}>
      <Card>
        <Tag className={styles['recall-slice-tag']}>{sliceTag}</Tag>
        <div className={styles['recall-slice-title']}>
          {meta.document?.name ?? ''}
          <div
            onClick={() => {
              const { href, origin } = window.location;
              const hrefSlices = href.split('/');
              const spaceIndex = hrefSlices.indexOf('space');
              if (spaceIndex === -1 || spaceIndex === hrefSlices.length - 1) {
                dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
                  eventName: REPORT_EVENTS.KnowledgeSourceGetURL,
                  error: new Error(),
                });
              }
              const spaceId = hrefSlices[spaceIndex + 1];
              if (!/^[1-9][0-9]+$/.test(spaceId)) {
                dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
                  eventName: REPORT_EVENTS.KnowledgeSourceGetURL,
                  error: new Error(),
                });
              }
              window.open(
                `${origin}/space/${spaceId}/knowledge/${meta.dataset.id}?first_auto_open_edit_document_id=${meta.document.id}`,
                '_blank',
              );
            }}
            className={styles['recall-slice-title-icon']}
          >
            <LinkToKnowledgeIcon />
          </div>
        </div>
        <div className={styles['recall-slice-tags']}>
          {meta.dataset.name ? (
            <Tooltip content={meta.dataset.name}>
              <Tag>{meta.dataset.name}</Tag>
            </Tooltip>
          ) : null}

          {formatTypeDesc ? (
            <Tooltip content={formatTypeDesc}>
              <Tag>{formatTypeDesc} </Tag>
            </Tooltip>
          ) : null}

          {sourceTypeDesc ? (
            <Tooltip content={sourceTypeDesc}>
              <Tag>{sourceTypeDesc} </Tag>
            </Tooltip>
          ) : null}
          {score > 0 && <Tag>{`Score: ${score.toFixed(2)}`}</Tag>}
        </div>
        <div className={styles['recall-slice-content']}>
          <div
            ref={sliceContentRef}
            className={
              isOpen
                ? styles['recall-slice-content-open']
                : styles['recall-slice-content-collapsed']
            }
          >
            {filteredSlice}
          </div>
          {needCollapse ? (
            isOpen ? (
              <div
                className={styles['recall-slice-content-action']}
                onClick={() => setIsOpen(false)}
              >
                {I18n.t('collapse-chat-knowledge-source-header')}
              </div>
            ) : (
              <div
                className={styles['recall-slice-content-action']}
                onClick={() => setIsOpen(true)}
              >
                {I18n.t('view-all-chat-knowledge-source-header')}
              </div>
            )
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export function RecallSlices(props: { llmOutputs: Array<LLMOutput> }) {
  return (
    <div className={styles['recall-slices']}>
      {props.llmOutputs.map((llmOutput, index) => (
        <RecallSlice llmOutput={llmOutput} index={index} />
      ))}
    </div>
  );
}
