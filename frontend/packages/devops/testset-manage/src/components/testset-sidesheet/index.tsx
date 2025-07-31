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

import { useEffect, useRef, useState } from 'react';

import { useInfiniteScroll } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Empty, UIButton, Spin, SideSheet, UIToast } from '@coze-arch/bot-semi';
import { debuggerApi } from '@coze-arch/bot-api';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';

import {
  TestsetEditSideSheet,
  type TestsetEditState,
} from '../testset-edit-sidesheet';
import { SideSheetTitle } from '../sidesheet-title';
import { AutoLoadMore } from '../auto-load-more';
import type { TestsetData } from '../../types';
import {
  SchemaError,
  useCheckSchema,
  useTestsetManageStore,
} from '../../hooks';
import { TestsetListItem } from './testset-list-item';

import s from './index.module.less';

export interface TestsetSideSheetProps {
  visible: boolean;
  editable?: boolean;
  onClose: () => void;
  /** Is it a multiplayer collaboration mode? */
  isExpertMode?: boolean;
}

interface EmptyContentProps {
  onCreateTestset?: () => void;
}

function EmptyContent({ onCreateTestset }: EmptyContentProps) {
  return (
    <div className={s['empty-container']}>
      <Empty
        title={I18n.t('workflow_testset_empty')}
        className={s.empty}
        description={I18n.t('workflow_testset_create_tip')}
        image={<IllustrationNoContent />}
        darkModeImage={<IllustrationNoContentDark />}
      >
        <div className="text-center">
          <UIButton theme="solid" onClick={onCreateTestset}>
            {I18n.t('workflow_testset_create_btn')}
          </UIButton>
        </div>
      </Empty>
    </div>
  );
}

interface TestsetQueryResult {
  list: TestsetData[];
  hasNext?: boolean;
  nextToken?: string;
}

const DEFAULT_PAGE_SIZE = 30;

/**
 * Testset Management Side Panel
 * Should be used with TestsetManageProvider
 *
 * @example
 * ``` tsx
 * <TestsetManageProvider
 *   //Some required parameters bizCtx bizComponentSubject editable formRendersitable formRenders
 * >
 *   <TestsetSideSheet visible={visible} onClose={() => setVisible(false)} />
 * </TestsetManageProvider>
 * ```
 */
// eslint-disable-next-line @coze-arch/max-line-per-function -- large components > 150 lines, only less than 5 lines
export function TestsetSideSheet({
  visible,
  onClose,
  isExpertMode,
}: TestsetSideSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { schemaError, checking, checkSchema } = useCheckSchema();
  const { bizComponentSubject, bizCtx } = useTestsetManageStore(store => store);
  const {
    data: testsetResp,
    loading,
    loadingMore,
    reload: reloadTestsetList,
    mutate: patchTestsetResp,
    noMore,
  } = useInfiniteScroll<TestsetQueryResult>(
    async d => {
      const res = await debuggerApi.MGetCaseData({
        bizCtx,
        bizComponentSubject,
        pageLimit: DEFAULT_PAGE_SIZE,
        nextToken: d?.nextToken,
      });

      return {
        list: res.cases ?? [],
        hasNext: res.hasNext,
        nextToken: res.nextToken,
      };
    },
    { target: containerRef, isNoMore: d => !d?.hasNext, manual: true },
  );
  const [testsetEditState, setTestsetEditState] = useState<TestsetEditState>(
    {},
  );

  useEffect(() => {
    if (visible) {
      patchTestsetResp({ list: [] });
      reloadTestsetList();
      // Check schema
      checkSchema();
    }
  }, [visible]);

  const onCreateTestset = () => {
    if (checking) {
      return;
    }

    if (schemaError) {
      UIToast.error({
        content:
          schemaError === SchemaError.EMPTY
            ? I18n.t('workflow_testset_paramempty')
            : I18n.t('workflow_test_nodeerror'),
        showClose: false,
      });
      return;
    }
    setTestsetEditState({ visible: true, mode: 'create' });
  };

  const onEditTestset = (data: TestsetData) => {
    if (checking) {
      return;
    }

    if (schemaError) {
      UIToast.error({
        content:
          schemaError === SchemaError.EMPTY
            ? I18n.t('workflow_testset_peedit')
            : I18n.t('workflow_test_nodeerror'),
        showClose: false,
      });
      return;
    }
    setTestsetEditState({ visible: true, testset: data, mode: 'edit' });
  };

  const onDeleteTestset = async (data: TestsetData) => {
    if (!data.caseBase?.caseID) {
      return;
    }
    try {
      await debuggerApi.DeleteCaseData({
        bizCtx,
        caseIDs: [data.caseBase?.caseID],
      });
      patchTestsetResp({ list: [] });
      reloadTestsetList();
    } catch (e: any) {
      logger.error(e);
    }
  };

  const closeTestsetEdit = () => {
    setTestsetEditState({});
  };

  const onEditSuccess = () => {
    patchTestsetResp({ list: [] });
    reloadTestsetList();
    closeTestsetEdit();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Spin
          spinning={loading}
          tip={I18n.t('loading')}
          wrapperClassName={s['loading-wrapper']}
        />
      );
    }

    if (!testsetResp?.list.length) {
      return <EmptyContent onCreateTestset={onCreateTestset} />;
    }

    return (
      <>
        {testsetResp.list.map((data, i) => (
          <TestsetListItem
            key={data.caseBase?.caseID ?? i}
            data={data}
            onEdit={onEditTestset}
            onDelete={onDeleteTestset}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {/* Testset Management Side Panel */}
      <SideSheet
        className={s.sidesheet}
        title={
          <SideSheetTitle
            title={I18n.t('workflow_testset_tilte')}
            action={
              loading || !testsetResp?.list.length ? null : (
                <UIButton theme="solid" onClick={onCreateTestset}>
                  {I18n.t('workflow_testset_create_btn')}
                </UIButton>
              )
            }
            onClose={onClose}
          />
        }
        visible={visible}
        width={600}
        maskClosable={false}
        closable={false}
        onCancel={onClose}
      >
        <div className={s.container} ref={containerRef}>
          {renderContent()}
          <AutoLoadMore noMore={noMore} loadingMore={loadingMore} />
        </div>
      </SideSheet>
      {/* Testset Create/Edit Side Panel */}
      <TestsetEditSideSheet
        {...testsetEditState}
        mask={false}
        onSuccess={onEditSuccess}
        onClose={closeTestsetEdit}
        onCancel={closeTestsetEdit}
        isExpertMode={isExpertMode}
      />
    </>
  );
}
