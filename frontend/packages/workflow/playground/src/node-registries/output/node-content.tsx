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

import { InputParameters } from '../common/components';
import { useFlags } from '@coze-arch/bot-flags';
import { MessageContent as OutputContentOld } from '@/components/node-render/node-render-new/content/message-content';
import { OutputTextContent } from './components/output-text-content';
import { I18n } from '@coze-arch/i18n';

export function OutputContent() {
  const [FLAGS] = useFlags();
  // The community edition does not support this function for the time being
  if (!FLAGS['bot.automation.output_node_v2']) {
    return <OutputContentOld />;
  }
  return (
    <>
      <InputParameters label={I18n.t('workflow_detail_node_output')} />
      <OutputTextContent />
    </>
  );
}
