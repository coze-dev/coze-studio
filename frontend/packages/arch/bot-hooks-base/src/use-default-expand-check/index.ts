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

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { size } from 'lodash-es';
import { type SkillKeyEnum } from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { skillKeyToApiStatusKeyTransformer } from '@coze-arch/bot-utils';
import {
  TabStatus,
  type TabDisplayItems,
} from '@coze-arch/bot-api/developer_api';

/**
 * Used to verify the default expanded and stowed state of the current module
 * @Deprecated change attribute is deprecated and not maintained, please replace the useToolContentBlockDefaultExpand in @code-agent-ide/tool
 * @param blockKey primary key
 * @param configured whether there is configuration content
 * Check when @param
 *
 */
const useDefaultExPandCheck = (
  $params: {
    blockKey: SkillKeyEnum;
    configured: boolean;
  },
  $when = true,
) => {
  const { blockKey, configured = false } = $params;
  const isReadonly = useBotDetailIsReadonly();
  const { init, editable, botSkillBlockCollapsibleState } = usePageRuntimeStore(
    useShallow(store => ({
      init: store.init,
      editable: store.editable,
      botSkillBlockCollapsibleState: store.botSkillBlockCollapsibleState,
    })),
  );
  return useMemo(() => {
    // No verification
    if (!$when) {
      return undefined;
      // Finite-state machine not ready
    } else if (!init || size(botSkillBlockCollapsibleState) === 0) {
      return undefined;
      /**
       * @Description A user behavior record is only valid if the following conditions are met
       *
       * 1. Users have editing rights
       * 2. Cannot be a historical preview environment
       * 3. Must be configured
       */
    } else if (editable && !isReadonly && configured) {
      const transformerBlockKey = skillKeyToApiStatusKeyTransformer(blockKey);
      const collapsibleState =
        botSkillBlockCollapsibleState[
          transformerBlockKey as keyof TabDisplayItems
        ];
      if (collapsibleState === TabStatus.Open) {
        return true;
      } else if (collapsibleState === TabStatus.Close) {
        return false;
      }
    }
    return configured;
  }, [
    $when,
    blockKey,
    configured,
    init,
    isReadonly,
    editable,
    botSkillBlockCollapsibleState,
  ]);
};

export { useDefaultExPandCheck };
