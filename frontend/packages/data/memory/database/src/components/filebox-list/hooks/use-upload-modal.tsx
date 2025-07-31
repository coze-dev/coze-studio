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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useState } from 'react';

import { dataReporter, DataNamespace } from '@coze-data/reporter';
import {
  type UnitItem,
  UnitType,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';
import {
  UploadUnitFile,
  UploadUnitTable,
} from '@coze-data/knowledge-resource-processor-base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { UIModal, UIToast } from '@coze-arch/bot-semi';
import { fileboxApi } from '@coze-arch/bot-api';

import { FileBoxListType } from '../types';
import s from '../index.module.less';
import { prefixUri } from '../helpers/prefix-uri';
import { COZE_CONNECTOR_ID } from '../const';
import { useRetry } from './use-retry';
import { type Result } from './use-file-list';

export interface UseUploadModalParams {
  botId: string;
  fileListType: FileBoxListType;
  reloadAsync: () => Promise<Result>;
}

export const useUploadModal = (params: UseUploadModalParams) => {
  const { botId, fileListType, reloadAsync } = params;

  const [visible, setVisible] = useState(false);
  const [unitList, setUnitList] = useState<UnitItem[]>([]);

  const hideUploadFile = false;
  const AddUnitMaxLimit = 10;

  const onRetry = useRetry({ unitList, setUnitList });

  const submitButtonDisabled =
    unitList.length === 0 ||
    unitList.some(
      i =>
        /**
         * 1. Unsuccessful upload
         * 2. Validation failed
         * 3. The name is empty (the name is empty will not affect the validateMessage for the time being, so it needs to be judged separately)
         */
        i.status !== UploadStatus.SUCCESS || i.validateMessage || !i.name,
    );

  const handleUnitListUpdate = (data: UnitItem[]) => {
    // Prevent renaming and then uploading from being overwritten.
    const newData = data.map(i => {
      let resultName = i.name;
      unitList.forEach(u => {
        if (
          u.uid === i.uid &&
          u.status === i.status &&
          u.status === UploadStatus.SUCCESS
        ) {
          resultName = u.name;
        }
      });
      return {
        ...i,
        name: resultName,
      };
    });

    setUnitList(newData);
  };

  const handleUploadSubmit = async () => {
    try {
      const {
        DestFiles = [],
        SuccessNum,
        FailNum,
      } = await fileboxApi.UploadFiles({
        source_files: unitList.map(i => {
          const { uri, url, name } = i;
          return {
            file_uri: prefixUri(uri, url),
            file_name: name,
          };
        }),
        bid: botId,
        cid: COZE_CONNECTOR_ID,
        biz_type:
          fileListType === FileBoxListType.Image ? 'coze-img' : 'coze-file',
      });
      const failedDestFiles = DestFiles.filter(i => i.status !== 0).map(i => ({
        ...i,
        errorMessage:
          i.status === 708252039
            ? I18n.t('file_name_exist')
            : I18n.t('Upload_failed'),
      }));
      UIToast.success(
        I18n.t('upload_success_failed_count', {
          successNum: SuccessNum,
          failedNum: FailNum,
        }),
      );
      if (failedDestFiles.length === 0) {
        await reloadAsync();
        setVisible(false);
      } else {
        const newUnitList = failedDestFiles.map(i => {
          const unit = unitList.find(
            u => prefixUri(u.uri, u.url) === i.file_uri,
          );
          return {
            ...unit,
            dynamicErrorMessage: i.errorMessage,
          };
        });
        setUnitList(newUnitList as UnitItem[]);
      }
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.FILEBOX, {
        error: error as Error,
        eventName: REPORT_EVENTS.FileBoxUploadFile,
      });
    }
  };

  // reset
  useEffect(() => {
    if (!visible) {
      setUnitList([]);
    }
  }, [visible]);

  return {
    open: () => setVisible(true),
    close: () => setVisible(false),
    node: (
      <UIModal
        visible={visible}
        onCancel={() => setVisible(false)}
        title={I18n.t('datasets_createFileModel_step2')}
        width={792}
        onOk={handleUploadSubmit}
        keepDOM={false}
        okButtonProps={{
          disabled: submitButtonDisabled,
        }}
        className={s['upload-modal']}
      >
        <UploadUnitFile
          action=""
          maxSizeMB={20}
          accept={
            fileListType === FileBoxListType.Image
              ? '.png,.jpg,.jpeg'
              : '.pdf,.txt,.doc,.docx'
          }
          dragMainText={I18n.t(
            fileListType === FileBoxListType.Image
              ? 'knowledge_photo_004'
              : 'datasets_createFileModel_step2_UploadDoc',
          )}
          dragSubText={
            fileListType === FileBoxListType.Image
              ? I18n.t('knowledge_photo_005')
              : I18n.t('datasets_createFileModel_step2_UploadDoc_description', {
                  fileFormat: 'PDF、TXT、DOC、DOCX',
                  maxDocNum: 300,
                  filesize: '20MB',
                  pdfPageNum: 250,
                })
          }
          limit={AddUnitMaxLimit}
          unitList={unitList}
          multiple={AddUnitMaxLimit > 1}
          style={
            hideUploadFile ? { visibility: 'hidden', height: 0 } : undefined
          }
          setUnitList={handleUnitListUpdate}
          onFinish={handleUnitListUpdate}
        />
        {unitList.length > 0 ? (
          <div className="overflow-y-auto my-[25px]">
            <UploadUnitTable
              type={UnitType.IMAGE_FILE}
              edit={true}
              unitList={unitList}
              onChange={setUnitList}
              onRetry={onRetry}
              inModal
            />
          </div>
        ) : null}
      </UIModal>
    ),
  };
};
