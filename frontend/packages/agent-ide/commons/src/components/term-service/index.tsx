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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import {
  useTermServiceModal,
  type TermServiceInfo,
} from './term-service-modal';

export const PublishTermService = ({
  termServiceData,
  scene = 'bot',
  className,
}: {
  termServiceData: TermServiceInfo[];
  scene?: 'bot' | 'project';
  className?: string;
}) => {
  const { node: termServiceModal, open: openTermServiceModal } =
    useTermServiceModal({
      dataSource: termServiceData,
    });

  const BotScene = scene === 'bot';
  return (
    <>
      {termServiceModal}
      <Typography.Text
        className={classNames(
          'py-[12px] coz-fg-primary leading-[16px]',
          className,
        )}
      >
        {I18n.t(
          BotScene
            ? 'bot_publish_select_desc_compliance_new'
            : 'project_publish_select_desc_compliance_new',
          {
            publish_terms_title: (
              <Typography.Text
                link
                onClick={openTermServiceModal}
                className="!coz-fg-hglt !font-normal"
              >
                {I18n.t('publish_terms_title')}
              </Typography.Text>
            ),
          },
        )}
      </Typography.Text>
    </>
  );
};
