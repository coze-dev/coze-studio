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

import React from 'react';

import { useRequest } from 'ahooks';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { Spin } from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';
import { Branch } from '@coze-arch/bot-api/dp_manage_api';
import { dpManageApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

import { NewBotDiffView } from './new-diff-view';
import { BotDiffView } from '.';

import styles from './index.module.less';

export const BotSubmitModalDiffView: React.FC<{ visible: boolean }> = props => {
  const params = useParams<DynamicParams>();
  const [Flags] = useFlags();
  const isUseNewTemplate = !!Flags?.['bot.devops.merge_prompt_diff'];
  const {
    data: botDiffData,
    loading,
    error,
  } = useRequest(
    async () => {
      const { bot_id = '', space_id = '' } = params;
      const resp = await dpManageApi.BotDiff({
        space_id,
        bot_id,
        left: {
          branch: Branch.Base,
        },
        template_key: isUseNewTemplate ? 'diff_template_v2' : '',
        right: { branch: Branch.PersonalDraft },
      });
      return resp.data;
    },
    { refreshDeps: [] },
  );

  return (
    <div
      className={styles['modal-diff-container']}
      style={{ display: props.visible ? 'block' : 'none' }}
    >
      {loading ? (
        <Spin spinning={loading} style={{ height: '100%', width: '100%' }} />
      ) : isUseNewTemplate ? (
        <NewBotDiffView
          diffData={botDiffData?.diff_display_node || []}
          hasError={error !== undefined}
        />
      ) : (
        <BotDiffView
          diffData={botDiffData?.diff_display_node || []}
          hasError={error !== undefined}
        />
      )}
    </div>
  );
};
