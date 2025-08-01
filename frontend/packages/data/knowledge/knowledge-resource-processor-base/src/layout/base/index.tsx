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

import { useEffect, useMemo } from 'react';

import classNames from 'classnames';
import {
  useDataCallbacks,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import {
  DataErrorBoundary,
  DataNamespace,
  ErrorFallbackComponent,
} from '@coze-data/reporter';
import {
  Upload,
  OptType,
  KnowledgeUploadStoreProvider,
  type UploadBaseState,
  type UploadConfig,
  type UploadBaseAction,
} from '@coze-data/knowledge-resource-processor-core';
import { useGetKnowledgeListInfo } from '@coze-data/knowledge-common-hooks/use-case';
import { useReportTti } from '@coze-arch/report-tti';
import { I18n } from '@coze-arch/i18n';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { Layout } from '@coze-arch/coze-design';

import { UploadActionNavbar } from '@/components/upload-navbar';

import styles from './index.module.less';

export interface KnowledgeResourceProcessorLayoutProps {
  keepDocTitle?: boolean;
  uploadConfig: UploadConfig<
    number,
    UploadBaseState<number> & UploadBaseAction<number>
  >;
  children?: React.ReactNode;
}

export const KnowledgeResourceProcessorLayout = ({
  keepDocTitle,
  uploadConfig,
  children,
}: KnowledgeResourceProcessorLayoutProps) => {
  const { onUpdateDisplayName, onStatusChange } = useDataCallbacks();

  const { datasetID, opt, docID, biz } = useKnowledgeParams();

  // Get Knowledge Base Details
  const { data: dataSetInfo, loading } = useGetKnowledgeListInfo({
    datasetID: datasetID || '',
  });

  const hasCreateAction = useMemo(() => !docID, [docID]);
  const headerTiTle = useMemo(() => {
    let title = I18n.t('knowledge_upload_create_title');
    if (opt === OptType.RESEGMENT) {
      return I18n.t('datasets_unit_config_title1');
    }

    if (opt === OptType.INCREMENTAL || dataSetInfo?.file_list?.length) {
      title = I18n.t('knowledg_unit_add_segments');
    } else if (!hasCreateAction) {
      title = I18n.t('datasets_unit_config_title1');
    } else {
      title = I18n.t('knowledge_upload_create_title');
    }
    return title;
  }, [hasCreateAction, opt, dataSetInfo]);

  useReportTti({
    isLive: !!dataSetInfo && !loading,
  });

  useEffect(() => {
    onUpdateDisplayName?.(headerTiTle);
    onStatusChange?.('normal');
  }, [headerTiTle]);

  // TODO: hzf differentiation split into scenes
  const fromProject = biz === 'project';

  return (
    <DataErrorBoundary namespace={DataNamespace.KNOWLEDGE}>
      <Layout
        className={classNames(
          'flex flex-col gap-[16px]',
          fromProject
            ? 'coz-bg-max border border-solid coz-stroke-primary'
            : 'p-[24px] pt-[16px]',
        )}
        title={renderHtmlTitle(
          I18n.t('tab_dataset_detail', {
            dataset_name: dataSetInfo?.name ?? '',
          }),
        )}
        keepDocTitle={keepDocTitle}
      >
        <UploadActionNavbar title={headerTiTle} />
        <Layout.Content className={classNames('!px-[76px] h-full')} scrollY>
          {children}
          <div className={styles['upload-unit-wrap']}>
            {uploadConfig ? (
              <KnowledgeUploadStoreProvider
                createStore={uploadConfig.createStore}
              >
                <Upload config={uploadConfig} />
              </KnowledgeUploadStoreProvider>
            ) : (
              <ErrorFallbackComponent namespace={DataNamespace.KNOWLEDGE} />
            )}
          </div>
        </Layout.Content>
      </Layout>
    </DataErrorBoundary>
  );
};
