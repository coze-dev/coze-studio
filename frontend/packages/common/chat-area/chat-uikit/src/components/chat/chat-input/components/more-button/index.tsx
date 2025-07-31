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

import { type ReactNode, type FC } from 'react';

import classNames from 'classnames';
import { IconCozPlusCircle } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { UIKitTooltip } from '../../../../common/tooltips';

interface IProps {
  isDisabled?: boolean;
  tooltipContent?: ReactNode;
  layout: Layout;
}

const MoreButton: FC<IProps> = props => {
  const { isDisabled, tooltipContent, layout } = props;

  return (
    <UIKitTooltip
      // Collapse tooltip when the selected file event is invoked
      disableFocusListener
      content={tooltipContent}
      hideToolTip={layout === Layout.MOBILE}
    >
      <IconButton
        className="!rounded-full"
        data-testid="chat-area.chat-upload-button"
        color="secondary"
        disabled={isDisabled}
        icon={
          <IconCozPlusCircle
            className={classNames(
              isDisabled ? 'coz-fg-dim' : 'coz-fg-primary',
              'text-18px',
            )}
          />
        }
      />
    </UIKitTooltip>
  );
};

export default MoreButton;
