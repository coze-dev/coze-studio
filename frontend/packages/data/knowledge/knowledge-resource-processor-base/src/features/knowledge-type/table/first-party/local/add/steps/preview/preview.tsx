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
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';

import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import { TablePreview as TablePreviewInternal } from '@/components';

import { TableLocalStep } from '../../../constants';

export const TablePreview = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;

  /** store */
  const tableData = useStore(state => state.tableData);
  const tableSettings = useStore(state => state.tableSettings);
  const setCurrentStep = useStore(state => state.setCurrentStep);

  return (
    <>
      <TablePreviewInternal data={tableData} settings={tableSettings} />
      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.UploadUnitUpBtn,
              type: 'primary',
              theme: 'light',
              text: I18n.t('datasets_createFileModel_previousBtn'),
              onClick: () => {
                setCurrentStep(TableLocalStep.CONFIGURATION);
              },
              status: FooterBtnStatus.ENABLE,
            },
            {
              e2e: KnowledgeE2e.UploadUnitNextBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('datasets_createFileModel_NextBtn'),
              onClick: () => {
                setCurrentStep(TableLocalStep.PROCESSING);
              },
              status: FooterBtnStatus.ENABLE,
            },
          ])
        : null}
    </>
  );
};
