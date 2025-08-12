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

import { useState } from 'react';

import {
  type UnitItem,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import { type TableType, type TableSheet } from '@coze-arch/bot-api/memory';
import { Button, Modal } from '@coze-arch/coze-design';

import { type TableFieldData } from '../database-table-data/type';
import { StepUpload } from './steps/upload';
import { StepProcess } from './steps/process';
import { StepPreview } from './steps/preview';
import { StepConfig } from './steps/config';
import { BatchImportStep, BatchImportSteps } from './import-steps';

export interface BatchImportModalProps {
  visible: boolean;
  databaseId: string;
  tableFields: TableFieldData[];
  tableType: TableType;
  connectorId?: string;
  onClose?: () => void;
  onComplete?: () => void;
}

export function BatchImportModal({
  visible,
  databaseId,
  tableFields,
  tableType,
  connectorId,
  onClose,
  onComplete,
}: BatchImportModalProps) {
  const [currentStep, setCurrentStep] = useState(BatchImportStep.Upload);
  const [unitList, setUnitList] = useState<UnitItem[]>([]);
  const [tableSheet, setTableSheet] = useState<TableSheet>();

  const resetSteps = () => {
    setCurrentStep(BatchImportStep.Upload);
    setUnitList([]);
    setTableSheet(undefined);
  };

  const getNextDisabled = () => {
    switch (currentStep) {
      case BatchImportStep.Upload:
        return (
          unitList.length <= 0 ||
          unitList.some(item => item.status !== UploadStatus.SUCCESS)
        );
      case BatchImportStep.Config:
        return !tableSheet;
      case BatchImportStep.Preview:
        return false;
      case BatchImportStep.Process:
        return false;
      default:
        return false;
    }
  };

  return (
    <Modal
      visible={visible}
      title={I18n.t('db_optimize_013')}
      onCancel={onClose}
      width={1120}
      className="[&_.semi-modal-content]:min-h-[520px]"
      footer={
        <>
          {currentStep !== BatchImportStep.Process ? (
            <>
              <Button
                color="primary"
                disabled={currentStep === BatchImportStep.Upload}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                {I18n.t('db_optimize_020')}
              </Button>
              <Button
                disabled={getNextDisabled()}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                {I18n.t('db_optimize_021')}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                onClose?.();
                onComplete?.();
                resetSteps();
              }}
            >
              {I18n.t('db2_004')}
            </Button>
          )}
        </>
      }
    >
      <BatchImportSteps step={currentStep} />
      {currentStep === BatchImportStep.Upload ? (
        <StepUpload
          databaseId={databaseId}
          tableType={tableType}
          unitList={unitList}
          onUnitListChange={setUnitList}
        />
      ) : null}
      {currentStep === BatchImportStep.Config ? (
        <StepConfig
          databaseId={databaseId}
          tableFields={tableFields}
          tableType={tableType}
          fileUri={unitList[0].uri}
          onTableSheetChange={setTableSheet}
        />
      ) : null}
      {currentStep === BatchImportStep.Preview ? (
        <StepPreview
          databaseId={databaseId}
          tableFields={tableFields}
          fileUri={unitList[0].uri}
          tableSheet={tableSheet}
        />
      ) : null}
      {currentStep === BatchImportStep.Process ? (
        <StepProcess
          databaseId={databaseId}
          tableType={tableType}
          fileItem={unitList[0]}
          tableSheet={tableSheet}
          connectorId={connectorId}
        />
      ) : null}
    </Modal>
  );
}
