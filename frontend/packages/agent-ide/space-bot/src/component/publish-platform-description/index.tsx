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

import ReactMarkdown from 'react-markdown';

import classNames from 'classnames';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import s from './index.module.less';

interface PublishPlatformDescriptionProps {
  desc: string;
}

export default function PublishPlatformDescription(
  props: PublishPlatformDescriptionProps,
) {
  const { desc = '' } = props;
  return (
    <Tooltip
      position="right"
      content={
        <div className={classNames(s['connector-tip'])}>
          <ReactMarkdown linkTarget="_blank">{desc}</ReactMarkdown>
        </div>
      }
    >
      <span style={{ lineHeight: 0 }}>
        <IconCozInfoCircle className="text-sm" />
      </span>
    </Tooltip>
  );
}
