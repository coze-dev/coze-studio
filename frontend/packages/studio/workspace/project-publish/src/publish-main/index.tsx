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

import React, { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useErrorHandler } from '@coze-arch/logger';
import { Form, Spin } from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

import { useProjectPublishStore } from '../store';
import {
  loadProjectPublishDraft,
  saveProjectPublishDraft,
} from './utils/publish-draft';
import { initPublishStore } from './utils/init-publish-store';
import { PublishTitleBar } from './publish-title-bar';
import { PublishRecord } from './publish-record';
import { PublishConnectors } from './publish-connectors';
import { PublishBasicInfo } from './publish-basic-info';
import { PublishContainer } from './components/publish-container';

import s from './index.module.less';

export function ProjectPublish(): JSX.Element {
  const { project_id = '', space_id = '' } = useParams<DynamicParams>();
  const {
    showPublishResult,
    pageLoading,
    resetProjectPublishInfo,
    exportDraft,
  } = useProjectPublishStore(
    useShallow(state => ({
      showPublishResult: state.showPublishResult,
      pageLoading: state.pageLoading,
      resetProjectPublishInfo: state.resetProjectPublishInfo,
      exportDraft: state.exportDraft,
    })),
  );
  const errorHandle = useErrorHandler();

  useEffect(() => {
    const saveDraft = () => {
      saveProjectPublishDraft(exportDraft(project_id));
    };
    window.addEventListener('beforeunload', saveDraft);
    return () => {
      window.removeEventListener('beforeunload', saveDraft);
    };
  }, [exportDraft, project_id]);

  useEffect(() => {
    initPublishStore(
      project_id,
      errorHandle,
      loadProjectPublishDraft(project_id),
    );
    return () => {
      resetProjectPublishInfo();
    };
  }, []);

  return !pageLoading ? (
    <PublishContainer>
      <Form<Record<string, unknown>>
        className={s.project}
        showValidateIcon={false}
      >
        <PublishTitleBar />
        {!showPublishResult ? (
          <div className="flex justify-center pt-[32px] pb-[48px] coz-bg-primary">
            <div className="w-[800px]">
              <PublishBasicInfo />
              <PublishConnectors />
            </div>
          </div>
        ) : (
          <PublishRecord projectId={project_id} spaceId={space_id} />
        )}
      </Form>
    </PublishContainer>
  ) : (
    <Spin
      spinning
      wrapperClassName="flex justify-center h-full w-full items-center"
    />
  );
}
