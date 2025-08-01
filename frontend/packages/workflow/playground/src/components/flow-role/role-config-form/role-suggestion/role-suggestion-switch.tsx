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

import {
  useField,
  observer,
  type ObjectField,
} from '@coze-workflow/test-run/formily';
import { SuggestReplyInfoMode } from '@coze-arch/bot-api/workflow_api';
import { Switch } from '@coze-arch/coze-design';

export const RoleSuggestionSwitch: React.FC = observer(() => {
  const field = useField<ObjectField>();
  const { value, disabled } = field;
  const status = value?.suggest_reply_mode;

  const handleChange = v => {
    const next = v ? SuggestReplyInfoMode.System : SuggestReplyInfoMode.Disable;

    field.setValue({
      suggest_reply_mode: next,
    });
  };

  return (
    <Switch
      size="mini"
      checked={
        status === SuggestReplyInfoMode.System ||
        status === SuggestReplyInfoMode.Custom
      }
      disabled={disabled}
      onChange={handleChange}
    />
  );
});
