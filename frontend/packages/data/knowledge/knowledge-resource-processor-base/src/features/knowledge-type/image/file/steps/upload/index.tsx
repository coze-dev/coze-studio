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

import { useMemo, type FC } from 'react';

import {
  type ContentProps,
  FooterBtnStatus,
  UploadStatus,
  type UnitItem,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { UploadUnitFile, UploadUnitTable } from '@/components';

import { ImageFileAddStep } from '../../types';
import { type ImageFileAddStore } from '../../store';
import { useRetry } from './use-retry';

export const ImageUpload: FC<ContentProps<ImageFileAddStore>> = props => {
  const { useStore, footer } = props;
  const setCurrentStep = useStore(state => state.setCurrentStep);
  const unitList = useStore(state => state.unitList);
  const setUnitList = useStore(state => state.setUnitList);

  const onRetry = useRetry({ unitList, setUnitList });

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

  const hideUploadFile = false;
  const AddUnitMaxLimit = 300;

  const handleClickNext = () => {
    setCurrentStep(ImageFileAddStep.Annotation);
  };

  const handleUnitListUpdate = (data: UnitItem[]) => {
    const result = data;
    setUnitList(result);
  };

  return (
    <>
      <UploadUnitFile
        action=""
        accept={'.png,.jpg,.jpeg,.webp'}
        dragMainText={I18n.t('knowledge_photo_004')}
        dragSubText={I18n.t('knowledge_photo_005')}
        limit={AddUnitMaxLimit}
        unitList={unitList}
        multiple={AddUnitMaxLimit > 1}
        style={hideUploadFile ? { visibility: 'hidden', height: 0 } : undefined}
        setUnitList={handleUnitListUpdate}
        onFinish={handleUnitListUpdate}
        maxSizeMB={20}
        onSizeError={file =>
          Toast.error(
            I18n.t('photo-size-limit', {
              fileName: file.name,
            }),
          )
        }
      />
      {unitList.length > 0 ? (
        <div className="mt-[25px] mb-[25px] overflow-y-auto">
          <UploadUnitTable
            type={UnitType.IMAGE_FILE}
            edit={true}
            unitList={unitList}
            onChange={setUnitList}
            onRetry={onRetry}
          />
        </div>
      ) : null}
      {footer?.([
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: buttonStatus,
          onClick: handleClickNext,
        },
      ])}
    </>
  );
};
