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

import { I18n } from '@coze-arch/i18n';
import { Image } from '@coze-arch/bot-semi';
import { Collapsible } from '@coze-studio/components/collapsible-icon-button';
import { ModelOptionThumb } from '@coze-agent-ide/model-manager/model-select-v2';
import {
  SingleAgentModelView as SingleAgentModelViewBase,
  type SingleAgentModelViewProps,
} from '@coze-agent-ide/bot-config-area';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Button, Tag } from '@coze-arch/coze-design';

const itemKey = Symbol.for('SingleAgentModelView');

export function SingleAgentModelView(props: SingleAgentModelViewProps) {
  return (
    <SingleAgentModelViewBase
      {...props}
      triggerRender={m => (
        // Forced full display of Advent prompts during model Advent
        <Collapsible
          itemKey={itemKey}
          fullContent={
            <Button
              color="secondary"
              size="default"
              data-testid="bot.ide.bot_creator.set_model_view_button"
            >
              {m ? <ModelOptionThumb model={m} /> : null}
              <IconCozArrowDown className="coz-fg-secondary" />
            </Button>
          }
          collapsedContent={
            <Button
              size="default"
              color="secondary"
              icon={
                <Image
                  preview={false}
                  className="leading-none"
                  width={16}
                  height={16}
                  src={m?.model_icon}
                />
              }
            >
              {m?.model_status_details?.is_upcoming_deprecated ? (
                <span className="h-full flex items-center">
                  <Tag size="mini" color="yellow" className="font-medium">
                    {I18n.t('model_list_willDeprecated')}
                  </Tag>
                </span>
              ) : null}
            </Button>
          }
          collapsedTooltip={m?.name}
        />
      )}
    />
  );
}
