import React, { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useErrorHandler } from '@coze-arch/logger';
import { Form, Spin } from '@coze/coze-design';
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
