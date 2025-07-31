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

import { useEffect, type FC } from 'react';

import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { Steps } from '@coze-arch/bot-semi';

import { Step } from './types';
import { useStepStore } from './store/step';
import { useInitialConfigStore } from './store/initial-config';
import { Upload } from './components/upload';
import { TableStructure } from './components/table-structure';
import { TablePreview } from './components/table-preview';
import { Processing } from './components/processing';

import styles from './index.module.less';

const map = {
  [Step.Step1_Upload]: Upload,
  [Step.Step2_TableStructure]: TableStructure,
  [Step.Step3_TablePreview]: TablePreview,
  [Step.Step4_Processing]: Processing,
};

export interface DatabaseCreateFromExcelProps {
  onCancel: () => void;
  botId: string;
  spaceId: string;
  maxColumnNum?: number;
  onSave?: (params: {
    response: any;
    stateData: DatabaseInfo;
  }) => Promise<void>;
}
export const DatabaseCreateFromExcel: FC<
  DatabaseCreateFromExcelProps
> = props => {
  const { onCancel, botId, onSave, maxColumnNum = 10, spaceId } = props;

  const { step, reset } = useStepStore(state => ({
    step: state.step,
    reset: state.reset,
  }));

  // init / reset store
  useEffect(() => {
    useInitialConfigStore.setState(() => ({
      onCancel,
      botId,
      spaceId,
      onSave,
      maxColumnNum,
    }));
    return () => {
      reset();
    };
  }, []);

  const Component = map[step];
  return (
    <div className={styles['create-from-excel-wrapper']}>
      <Steps
        type="basic"
        size="small"
        current={step - 1}
        className={styles.steps}
      >
        <Steps.Step title={I18n.t('db_table_0126_012')} />
        <Steps.Step title={I18n.t('db_table_0126_013')} />
        <Steps.Step title={I18n.t('db_table_0126_014')} />
        <Steps.Step title={I18n.t('db_table_0126_015')} />
      </Steps>
      <Component />
    </div>
  );
};

export { StepFooter } from './components/step-footer';
