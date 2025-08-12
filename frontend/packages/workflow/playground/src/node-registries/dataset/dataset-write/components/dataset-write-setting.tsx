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

import React from 'react';
import { I18n } from '@coze-arch/i18n';

import { Section, useWatch } from '@/form';
import { ColumnsTitle } from '@/form-extensions/components/columns-title';
import { DatasetWriteParserField } from './dataset-write-parser-field';
import { DatasetWriteChunkField } from './dataset-write-chunk-field';

const columnsTitleStyle = {
  color: 'var(--Fg-COZ-fg-primary, rgba(6, 7, 9, 0.80))',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: '500',
  lineHeight: '16px',
};

export const DatasetWriteSetting = () => {
  const datasetPatam = useWatch<string[]>({
    name: 'inputs.datasetParameters.datasetParam',
  });
  const isDatasetEmpty = !datasetPatam?.length;

  if (isDatasetEmpty) {
    return null;
  }

  return (
    <Section title={I18n.t('kl_write_033')}>
      <div className="pt-[16px]">
        <ColumnsTitle
          columns={[
            {
              title: I18n.t('kl_write_032'),
              style: columnsTitleStyle,
            },
          ]}
        />
        <DatasetWriteParserField
          name="inputs.datasetWriteParameters.parsingStrategy"
          options={{
            mode: 'card',
            direction: 'horizontal',
            options: [
              {
                value: 'fast',
                label: I18n.t('kl_write_004'),
                tooltip: I18n.t('kl_write_005'),
              },
              {
                value: 'accurate',
                label: I18n.t('kl_write_006'),
                tooltip: I18n.t('kl_write_007'),
              },
            ],
            radioCardClassName: 'px-[11px] py-[6px]',
          }}
        />
      </div>
      <ColumnsTitle
        columns={[
          {
            title: I18n.t('kl_write_011'),
            style: columnsTitleStyle,
          },
        ]}
      />
      <DatasetWriteChunkField
        name="inputs.datasetWriteParameters.chunkStrategy"
        feedbackTextClassName="w-[160px] text-[12px] leading-[16px] text-[#ff441e]"
        hasFeedback={false}
        options={{
          mode: 'card',
          direction: 'horizontal',
          options: [
            {
              value: 'default',
              label: I18n.t('kl_write_012'),
              tooltip: I18n.t('kl_write_013'),
            },
            // Phase 1 does not support hierarchical segmentation
            // {
            //   value: 'layer',
            //   Labels: 'Segmented by hierarchy',
            //   tooltip:
            //     'Segmented according to the document hierarchy, suitable for documents organized according to the hierarchy, such as papers, books, manuals, etc. ',
            // },
            {
              value: 'custom',
              label: I18n.t('datasets_segment_tag_custom'),
              tooltip: I18n.t(
                'datasets_createFileModel_step3_customDescription',
              ),
            },
          ],
          radioCardClassName: 'px-[11px] py-[6px]',
        }}
      />
    </Section>
  );
};
