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

import { useMemo, useContext } from 'react';

import { KnowledgeParamsStoreContext } from '@coze-data/knowledge-stores/src/context';
import {
  type UnitItem,
  type ContentProps,
  FooterBtnStatus,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';

import { useDocIdFromQuery } from '@/utils';
import { TextLocalTaskList } from '@/features/upload-task-list';
import { PDF_MAX_PAGES } from '@/constants/components';
import { getTextUploadChannelConfig, type Channel } from '@/constants/common';
import { UNIT_MAX_MB } from '@/constants';
import { UploadUnitFile } from '@/components';

import type { UploadTextLocalAddUpdateStore } from '../../store';
import { TextLocalAddUpdateStep } from '../../constants';
import { useRetry } from './hooks';

const UpdateContentMaxLimit = 1;

export const TextUpload = <T extends UploadTextLocalAddUpdateStore>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;
  const isDouyin = useContext(KnowledgeParamsStoreContext)?.paramsStore?.(
    s => s.params?.isDouyinBot,
  );
  /** common store */
  const unitList = useStore(state => state.unitList);
  /** common action */
  const setUnitList = useStore(state => state.setUnitList);
  const setCurrentStep = useStore(state => state.setCurrentStep);

  const onRetry = useRetry({ unitList, setUnitList });

  const docId = useDocIdFromQuery();
  const channel: Channel = isDouyin ? 'DOUYIN' : 'DEFAULT';
  const textUploadChannelConfig = getTextUploadChannelConfig(channel);
  const AddUnitMaxLimit = textUploadChannelConfig.addUnitMaxLimit;

  const buttonStatus = useMemo(() => {
    if (
      unitList.length === 0 ||
      unitList.some(
        unitItem =>
          unitItem.name.length === 0 ||
          unitItem.status !== UploadStatus.SUCCESS,
      )
    ) {
      return FooterBtnStatus.DISABLE;
    }
    return FooterBtnStatus.ENABLE;
  }, [unitList]);

  const isUpdateMode = useMemo(() => !!docId, [docId]);

  const uploadLimit = useMemo(
    () => (isUpdateMode ? UpdateContentMaxLimit : AddUnitMaxLimit),
    [isUpdateMode, AddUnitMaxLimit],
  );

  const hideUploadFile = useMemo(
    () => isUpdateMode && unitList?.length === UpdateContentMaxLimit,
    [unitList, isUpdateMode],
  );

  const handleClickNext = () => {
    setCurrentStep(TextLocalAddUpdateStep.SEGMENT_CLEANER);
  };

  const handleUnitListUpdate = (data: UnitItem[]) => {
    let result = data;
    if (docId) {
      result = data.map(item => ({
        ...item,
        docId,
      }));
    }
    setUnitList(result);
  };

  const accept = textUploadChannelConfig.acceptFileTypes.join(',');

  return (
    <>
      <UploadUnitFile
        action=""
        accept={accept}
        dragMainText={I18n.t('datasets_createFileModel_step2_UploadDoc')}
        dragSubText={I18n.t(
          'datasets_createFileModel_step2_UploadDoc_description',
          {
            fileFormat: textUploadChannelConfig.fileFormatString,
            maxDocNum: uploadLimit,
            filesize: `${UNIT_MAX_MB}MB`,
            pdfPageNum: PDF_MAX_PAGES,
          },
        )}
        limit={uploadLimit}
        unitList={unitList}
        multiple={uploadLimit > 1}
        style={hideUploadFile ? { visibility: 'hidden', height: 0 } : undefined}
        setUnitList={handleUnitListUpdate}
        onFinish={handleUnitListUpdate}
      />

      {unitList.length > 0 ? (
        <div className="overflow-y-auto mt-[16px]">
          <TextLocalTaskList
            edit={!isUpdateMode}
            unitList={unitList}
            onChange={setUnitList}
            onRetry={onRetry}
          />
        </div>
      ) : null}

      {footer?.([
        {
          type: 'hgltplus',
          theme: 'solid',
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: buttonStatus,
          onClick: handleClickNext,
          e2e: KnowledgeE2e.UploadUnitNextBtn,
        },
      ])}
    </>
  );
};
