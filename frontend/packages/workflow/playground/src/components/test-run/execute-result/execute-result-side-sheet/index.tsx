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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography, IconButton, Spin } from '@coze-arch/bot-semi';
import {
  IconSvgBitableFormOutlined,
  IconArrowRight,
} from '@coze-arch/bot-icons';

import { ExecuteLogId } from '../execute-log-id';
import { SingletonInnerSideSheet } from '../../../workflow-inner-side-sheet';
import { useExecStateEntity } from '../../../../hooks';
import { useResultSideSheetVisible } from './hooks/use-result-side-sheet-visible';
import { useHasError } from './hooks/use-has-error';
import { ExecuteResult } from './components/execute-result';

import styles from './index.module.less';

const { Text } = Typography;

/** drawer width */
const EXECUTE_RESULT_SIDE_SHEET_WIDTH = 400;

export const ExecuteResultSideSheet = () => {
  const { openSideSheetAndShowResult, loading, closeSideSheet } =
    useResultSideSheetVisible();

  const exeState = useExecStateEntity();

  const SideSheetTitle = () => (
    <div
      className={classNames(
        styles['result-title'],
        'flex',
        'items-center',
        'h-8',
      )}
    >
      <div className={styles['icon-fold']}>
        <IconButton icon={<IconArrowRight />} onClick={closeSideSheet} />
      </div>
      <Text className="ml-2">{I18n.t('workflow_running_results')}</Text>
    </div>
  );

  const hasError = useHasError();

  const Loading = () => (
    <div className="flex h-full items-center justify-center">
      <Spin />
    </div>
  );

  return (
    <>
      <SingletonInnerSideSheet
        sideSheetId="execute-result"
        sideSheetProps={{
          headerStyle: { padding: 16, paddingBottom: 24 },
          bodyStyle: { paddingLeft: 16, paddingRight: 16 },
          title: <SideSheetTitle />,
          footer: hasError ? <ExecuteLogId /> : null,
          width: EXECUTE_RESULT_SIDE_SHEET_WIDTH,
        }}
        closeConfirm={() => {
          exeState.closeSideSheet();
          return true;
        }}
      >
        {!loading ? <ExecuteResult /> : <Loading />}
      </SingletonInnerSideSheet>

      <div className={styles['icon-unfold']}>
        <IconButton
          className={classNames('rounded-l-m rounded-r-none')}
          icon={<IconSvgBitableFormOutlined />}
          onClick={async () => await openSideSheetAndShowResult()}
        />
      </div>
    </>
  );
};
