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

import { useState, useRef, useEffect } from 'react';

import semver from 'semver';
import { I18n } from '@coze-arch/i18n';
import { Form, Button, Popover, type useFormApi } from '@coze-arch/coze-design';
import { type PublishWorkflowRequest } from '@coze-arch/bot-api/workflow_api';

import { useGlobalState } from '@/hooks';

import { PublishWithForce } from './publish-with-force';

import css from './publish-with-version.module.less';

interface PublishWithVersionProps {
  disabled?: boolean;
  className?: string;
  step: string;
  setStep: (v: string) => void;
  onPublish: (obj?: Partial<PublishWorkflowRequest>) => void;
}

const VersionForm: React.FC<{
  onSubmit: (data: Partial<PublishWorkflowRequest>) => void;
}> = ({ onSubmit }) => {
  const formApiRef = useRef<ReturnType<typeof useFormApi> | null>(null);
  const { info } = useGlobalState();
  const { workflow_version: workflowVersion } = info;

  const getDefaultVersion = () => {
    if (!workflowVersion) {
      return 'v0.0.1';
    }
    return `v${semver.inc(workflowVersion, 'patch')}`;
  };

  const handleSubmit = async () => {
    if (!formApiRef.current) {
      return;
    }
    try {
      await formApiRef.current.validate();
      const data = formApiRef.current.getValues();
      const next: Partial<PublishWorkflowRequest> = {
        workflow_version: data.version,
        version_description: data.description,
      };

      onSubmit(next);
      // eslint-disable-next-line @coze-arch/no-empty-catch
    } catch {
      // Validation error requires no additional processing
    }
  };

  return (
    <div className={css['version-form']}>
      <Form getFormApi={v => (formApiRef.current = v)}>
        <Form.Input
          label={I18n.t('ocean_deploy_list_pkg_version')}
          required
          field="version"
          initValue={getDefaultVersion()}
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
          label={I18n.t('card_builder_builder_publish_changelog_label')}
          field="description"
          maxCount={800}
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
        <Button className={css.submit} onClick={handleSubmit}>
          {I18n.t('workflow_detail_title_publish')}
        </Button>
      </Form>
    </div>
  );
};

export const PublishWithVersion: React.FC<PublishWithVersionProps> = ({
  onPublish,
  ...props
}) => {
  const { step, setStep } = props;
  const [visible, setVisible] = useState(false);

  const handlePublish = () => {
    setStep('version');
    setVisible(true);
  };
  const handleSubmit = (obj?: Partial<PublishWorkflowRequest>) => {
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
      visible={visible}
      content={<VersionForm onSubmit={handleSubmit} />}
    >
      <div>
        <PublishWithForce onPublish={handlePublish} {...props} />
      </div>
    </Popover>
  );
};
