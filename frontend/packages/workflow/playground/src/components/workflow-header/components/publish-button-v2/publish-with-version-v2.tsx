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

import React, { useState, useRef, useEffect } from 'react';

import semver from 'semver';
import type { PublishWorkflowRequest } from '@coze-arch/idl/workflow_api';
import { type SetDefaultTestCaseReq } from '@coze-arch/idl/debugger_api';
import { I18n } from '@coze-arch/i18n';
import { Form, Button, Popover, type useFormApi } from '@coze-arch/coze-design';
import { debuggerApi } from '@coze-arch/bot-api';

import { useGlobalState } from '@/hooks';
import { BasePublishButton } from '@/components/workflow-header/components/publish-button-v2/base-publish-button';

import { useForcePush } from '../force-push-popover';
import TestSetSelect from './test-set-select';

import css from './publish-with-version.module.less';

type PublishData = Partial<
  PublishWorkflowRequest & { defaultTestCase?: SetDefaultTestCaseReq }
>;

interface PublishWithVersionProps {
  disabled?: boolean;
  className?: string;
  step: string;
  setStep: (v: string) => void;
  onPublish: (obj?: PublishData) => void;
}

const VersionForm: React.FC<{
  onSubmit: (data: PublishData) => void;
  onCancel: () => void;
  forcePushVisible?: boolean;
  onTestRun: () => void;
  onForcePublish: () => void;
  onForceCancel: () => void;
}> = ({
  onSubmit,
  onCancel,
  forcePushVisible,
  onTestRun,
  onForcePublish,
  onForceCancel,
}) => {
  const formApiRef = useRef<ReturnType<typeof useFormApi> | null>(null);
  const currentSelectCase = useRef<SetDefaultTestCaseReq | undefined>(
    undefined,
  );
  const { info } = useGlobalState();
  const { workflow_version: workflowVersion } = info;

  const getDefaultVersion = () => {
    if (!workflowVersion) {
      return 'v0.0.1';
    }
    return `v${semver.inc(workflowVersion, 'patch')}`;
  };

  const handleTestSetSelect = (caseData?: SetDefaultTestCaseReq) => {
    currentSelectCase.current = caseData;
  };

  const trySaveDefaultCase = () => {
    try {
      if (currentSelectCase.current) {
        debuggerApi.SetDefaultTestCase(currentSelectCase.current);
      }
    } catch (error) {
      console.error('SetDefaultTestCase Error', error);
    }
  };

  const handleSubmit = async (cb?: () => void) => {
    if (!formApiRef.current) {
      return;
    }
    try {
      await formApiRef.current.validate();
      const data = formApiRef.current.getValues();
      const next: PublishData = {
        workflow_version: data.version,
        version_description: data.description,
      };

      onSubmit(next);

      cb?.();

      trySaveDefaultCase();

      // eslint-disable-next-line @coze-arch/no-empty-catch
    } catch {
      // Validation error requires no additional processing
    }
  };

  const handleForcePublish = () => {
    handleSubmit(onForcePublish);
  };

  const renderBtn = () => {
    if (forcePushVisible) {
      return (
        <div className={'flex flex-row-reverse mt-12px'}>
          <Button
            color="highlight"
            onClick={onTestRun}
            data-testid="workflow-testrun-button"
          >
            {I18n.t('workflow_detail_title_testrun')}
          </Button>
          <Button
            color="primary"
            onClick={handleForcePublish}
            className={'mr-[8px]'}
            data-testid="workflow-force-publish-button"
          >
            {I18n.t('workflow_publish_not_testrun_ insist')}
          </Button>
          <Button
            color="primary"
            onClick={onForceCancel}
            className={'mr-[8px]'}
            data-testid="workflow-publish-cancel-button"
          >
            {I18n.t('workflow_list_create_modal_footer_cancel')}
          </Button>
        </div>
      );
    }

    return (
      <div className={'flex flex-row-reverse mt-12px'}>
        <Button
          onClick={() => handleSubmit()}
          data-testid="workflow-publish-button"
        >
          {I18n.t('workflow_detail_title_publish')}
        </Button>

        <Button
          color="primary"
          onClick={onCancel}
          className={'mr-[8px]'}
          data-testid="workflow-publish-cancel-button"
        >
          {I18n.t('workflow_list_create_modal_footer_cancel')}
        </Button>
      </div>
    );
  };

  return (
    <div className={css['version-form-v2']}>
      {forcePushVisible ? (
        <div className={css['force-push-tips']}>
          <div className={css['force-push-tips-label']}>
            {I18n.t('workflow_publish_not_testrun_title', {}, '发布前未试运行')}
          </div>
          <div className={css['force-push-tips-content']}>
            {I18n.t(
              'workflow_publish_not_testrun_content',
              {},
              '未进行试运行,建议确保工作流程正常运行后再发布',
            )}
          </div>
        </div>
      ) : null}
      <Form getFormApi={v => (formApiRef.current = v)}>
        <Form.Input
          label={I18n.t('ocean_deploy_list_pkg_version')}
          required
          field="version"
          initValue={getDefaultVersion()}
          data-testid="workflow-publish-version-name"
          rules={[
            {
              required: true,
              message: I18n.t('mockset_field_is_required', {
                field: I18n.t('ocean_deploy_list_pkg_version'),
              }),
            },
            {
              validator(_, value) {
                if (!value) {
                  return true;
                }
                return !!/^v\d+\.\d+\.\d+$/.test(value);
              },
              message: I18n.t('workflow_version_number_error1'),
            },
            {
              validator(_, value) {
                if (!value || !semver.valid(value) || !workflowVersion) {
                  return true;
                }
                return semver.lt(workflowVersion, value);
              },
              message: I18n.t('workflow_version_number_error2'),
            },
          ]}
        />
        <Form.TextArea
          autosize={{
            minRows: 1,
            maxRows: 10,
          }}
          label={I18n.t('card_builder_builder_publish_changelog_label')}
          placeholder={I18n.t(
            'workflow_version_update_placeholder',
            {},
            '请描述本次版本更新内容',
          )}
          field="description"
          data-testid="workflow-publish-version-description"
          rules={[
            {
              required: true,
              message: I18n.t('mockset_field_is_required', {
                field: I18n.t('card_builder_builder_publish_changelog_label'),
              }),
            },
            {
              max: 800,
              message: I18n.t(
                'project_resource_sidebar_warning_length_exceeds',
              ),
            },
          ]}
        />

        {/* will support soon */}
        {!IS_OPEN_SOURCE && <TestSetSelect onSelect={handleTestSetSelect} />}

        {renderBtn()}
      </Form>
    </div>
  );
};

export const PublishWithVersionV2: React.FC<PublishWithVersionProps> = ({
  onPublish,
  ...props
}) => {
  const { step, setStep } = props;
  const [visible, setVisible] = useState(false);
  const {
    visible: forcePushVisible,
    tryPushCheck,
    onCancel: onForcePushCancel,
    onTestRun,
  } = useForcePush();

  const handlePublish = async () => {
    setStep('force');
    if (!(await tryPushCheck())) {
      return;
    }

    setStep('version');
    setVisible(true);
  };

  const handleSubmit = (obj?: PublishData) => {
    onPublish(obj);
  };

  useEffect(() => {
    if (step !== 'version') {
      setVisible(false);
    }
  }, [step]);

  return (
    <Popover
      position="bottomRight"
      trigger="custom"
      onClickOutSide={() => setVisible(false)}
      visible={visible || forcePushVisible}
      content={
        <VersionForm
          forcePushVisible={forcePushVisible}
          onSubmit={handleSubmit}
          onCancel={() => setVisible(false)}
          onTestRun={() => {
            onTestRun();
            setVisible(false);
          }}
          onForcePublish={onForcePushCancel}
          onForceCancel={() => {
            onForcePushCancel();
            setVisible(false);
          }}
        />
      }
    >
      <div>
        <BasePublishButton onPublish={handlePublish} {...props} />
      </div>
    </Popover>
  );
};
