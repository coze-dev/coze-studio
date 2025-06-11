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
