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

import { useState } from 'react';

import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip } from '@coze-arch/bot-semi';
import { IconChevronRight } from '@douyinfe/semi-icons';

import { MemoryTemplateModal } from './memory-template-modal';

import s from './index.module.less';

export const MemoryList = ({
  onOpenMemoryAdd,
}: {
  onOpenMemoryAdd: (activeKey?: string) => void;
}) => {
  const variables = useBotSkillStore(innerS => innerS.variables);

  const [visible, setVisible] = useState(false);

  const ELLIPSIS_SIZE = 13;

  return (
    <div>
      {variables.some(item => item.key) ? (
        <div className={s['memory-list']}>
          {variables.map(item => {
            if (!item.key) {
              return;
            }
            return item.key.length > ELLIPSIS_SIZE ? (
              <Tooltip content={item.key}>
                <Tag
                  color="grey"
                  key={`config-item_${item.key}`}
                  onClick={() => onOpenMemoryAdd(item.key)}
                >
                  {item.key.slice(0, ELLIPSIS_SIZE)}...
                </Tag>
              </Tooltip>
            ) : (
              <Tag
                color="grey"
                key={`config-item_${item.key}`}
                onClick={() => onOpenMemoryAdd(item.key)}
              >
                {item.key}
              </Tag>
            );
          })}
        </div>
      ) : (
        <>
          <div className={s['default-text']}>
            {I18n.t('user_profile_intro')}
          </div>
          {FEATURE_ENABLE_VARIABLE ? (
            <div className={s['view-examples']}>
              <div
                className={s['view-examples-text']}
                onClick={() => setVisible(true)}
              >
                View examples
              </div>
              <IconChevronRight
                className={s['view-examples-icon']}
                size="small"
                style={{ marginLeft: 4 }}
                onClick={() => setVisible(true)}
              />
            </div>
          ) : null}
          <MemoryTemplateModal
            visible={visible}
            onCancel={() => {
              setVisible(false);
            }}
            onOk={() => {
              setVisible(false);
            }}
          />
        </>
      )}
    </div>
  );
};
